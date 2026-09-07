import React, { useState, useEffect, useCallback } from 'react';
import { Download, BookOpen, Users, BookMarked, AlertTriangle, Banknote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTheme } from '../context/useTheme';
import PageHeader from '../components/admin/PageHeader';
import Toast from '../components/admin/Toast';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import { reportsService, type OverviewReport, type BorrowingReport, type BookReport } from '../services/reports.service';
import { categoriesService } from '../services/categories.service';
import { BORROW_STATUS } from '../data/statusConfig';

const CATEGORY_FALLBACK_COLOR = '#2563EB';

const getDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const formatDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const getStatusLabel = (status: string) => BORROW_STATUS[status]?.label || status;

const ReportsPage: React.FC = () => {
  const { isDark } = useTheme();
  const [overview, setOverview] = useState<OverviewReport | null>(null);
  const [borrowing, setBorrowing] = useState<BorrowingReport | null>(null);
  const [bookReport, setBookReport] = useState<BookReport | null>(null);
  const [categoryMap, setCategoryMap] = useState<Record<string, { name: string; color: string }>>({});
  const [range, setRange] = useState(getDefaultRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [ov, books, cats] = await Promise.all([
        reportsService.getOverview(),
        reportsService.getBooks(),
        categoriesService.getAllSimple(),
      ]);
      setOverview(ov.data.data);
      setBookReport(books.data.data);
      const map: Record<string, { name: string; color: string }> = {};
      cats.data.data.forEach((c) => {
        if (c.id) map[c.id] = { name: c.name, color: c.color || CATEGORY_FALLBACK_COLOR };
      });
      setCategoryMap(map);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchAll(), 0);
    return () => clearTimeout(timer);
  }, [fetchAll]);

  const fetchBorrowing = useCallback(async () => {
    try {
      const res = await reportsService.getBorrowing({
        startDate: range.startDate || undefined,
        endDate: range.endDate || undefined,
      });
      setBorrowing(res.data.data);
    } catch (err) {
      console.error('Failed to load borrowing report:', err);
      setToast({ message: 'Không tải được báo cáo mượn/trả', type: 'error' });
    }
  }, [range]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBorrowing(), 0);
    return () => clearTimeout(timer);
  }, [fetchBorrowing]);

  const summaryData = overview
    ? [
        { label: 'Tổng số sách', value: overview.totalBooks.toLocaleString('vi-VN'), icon: <BookMarked size={18} />, color: '#2563EB' },
        { label: 'Độc giả hoạt động', value: overview.activeReaders.toLocaleString('vi-VN'), icon: <Users size={18} />, color: '#8B5CF6' },
        { label: 'Đang mượn', value: overview.activeBorrows.toLocaleString('vi-VN'), icon: <BookOpen size={18} />, color: '#22C55E' },
        { label: 'Quá hạn', value: overview.overdueBorrows.toLocaleString('vi-VN'), icon: <AlertTriangle size={18} />, color: '#EF4444' },
        { label: 'Tiền phạt chưa thu', value: overview.outstandingFines.toLocaleString('vi-VN') + ' đ', icon: <Banknote size={18} />, color: '#F59E0B' },
      ]
    : [];

  const monthlyData = (borrowing?.byMonth || []).map((m) => ({
    month: m.month,
    issues: m.count,
    returns: m.returned,
  }));

  const topBooksData = (bookReport?.mostBorrowed || []).slice(0, 8).map((b) => ({
    name: b.title,
    borrows: b.borrowCount,
  }));

  const categoryData = (bookReport?.byCategory || []).map((c) => {
    const meta = c.categoryId ? categoryMap[c.categoryId] : null;
    return {
      name: meta?.name || 'Chưa phân loại',
      value: c.count,
      color: meta?.color || CATEGORY_FALLBACK_COLOR,
    };
  });

  const exportCSV = () => {
    if (!borrowing || borrowing.records.length === 0) {
      setToast({ message: 'Không có dữ liệu để xuất trong khoảng ngày đã chọn', type: 'error' });
      return;
    }
    setExporting(true);
    try {
      const header = ['Ngày mượn', 'Mã phiếu', 'Độc giả', 'Loại độc giả', 'Sách', 'Hạn trả', 'Ngày trả', 'Trạng thái'];
      const rows = borrowing.records.map((r) => [
        formatDate(r.borrowDate),
        r.id,
        r.student?.user?.name || r.teacher?.user?.name || '—',
        r.student ? 'Học sinh' : r.teacher ? 'Giáo viên' : '—',
        r.book?.title || '—',
        formatDate(r.dueDate),
        formatDate(r.returnDate),
        getStatusLabel(r.status),
      ]);
      const escape = (cell: string) => `"${String(cell).replace(/"/g, '""')}"`;
      const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-muon-tra-${range.startDate}_${range.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ message: 'Đã xuất báo cáo CSV', type: 'success' });
    } catch (err) {
      console.error('Export failed:', err);
      setToast({ message: 'Xuất báo cáo thất bại', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const inputStyle: React.CSSProperties = { height: '36px', padding: '0 12px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };

  return (
    <div>
      <PageHeader title="Báo cáo & Thống kê" subtitle="Chỉ số hiệu suất và phân tích thư viện."
        action={
          <button onClick={exportCSV} disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed">
            <Download size={16} /> {exporting ? 'Đang xuất...' : 'Xuất Báo cáo'}
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Đang tải báo cáo..." minHeight={320} />
      ) : error ? (
        <ErrorState title="Không thể tải báo cáo" description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại." onRetry={fetchAll} />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
            {summaryData.map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.icon}</div>
                <p className="text-[22px] font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <input type="date" style={inputStyle} value={range.startDate} onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))} />
            <span className="text-[13px] text-slate-400">đến</span>
            <input type="date" style={inputStyle} value={range.endDate} onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))} />
            <span className="text-[13px] text-slate-500">Tổng lượt mượn trong khoảng: {borrowing?.total ?? 0}</span>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Line Chart - Issues vs Returns */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Lượt mượn vs Trả</h3>
              <p className="text-[13px] text-slate-500 mb-4">Theo tháng trong khoảng ngày đã chọn</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1E293B' : '#fff', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, borderRadius: '8px', fontSize: '13px' }} />
                    <Line type="monotone" dataKey="issues" name="Lượt mượn" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="returns" name="Lượt trả" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span className="text-[12px] text-slate-500">Lượt mượn</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[12px] text-slate-500">Lượt trả</span></div>
              </div>
            </div>

            {/* Top Borrowed Books */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Sách mượn nhiều nhất</h3>
              <p className="text-[13px] text-slate-500 mb-4">Top 8 cuốn sách phổ biến</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={topBooksData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} horizontal={false} />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} width={130} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1E293B' : '#fff', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, borderRadius: '8px', fontSize: '13px' }} />
                    <Bar dataKey="borrows" name="Lượt mượn" fill="#8B5CF6" radius={[0, 6, 6, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Phân bổ Sách theo Thể loại</h3>
            <p className="text-[13px] text-slate-500 mb-4">Số lượng sách theo thể loại</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryData.map((cat) => {
                const total = categoryData.reduce((s, c) => s + c.value, 0);
                const pct = total > 0 ? ((cat.value / total) * 100).toFixed(1) : '0.0';
                return (
                  <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">{cat.name}</span>
                        <span className="text-[12px] text-slate-500">{cat.value} ({pct}%)</span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-[#E2E8F0] dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ReportsPage;
