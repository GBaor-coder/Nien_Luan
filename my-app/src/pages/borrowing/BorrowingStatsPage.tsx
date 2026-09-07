import React, { useState, useEffect, useMemo } from 'react';
import { BookMarked, BookOpenCheck, BookCheck, AlertTriangle, Trophy, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { borrowingService, type BorrowRecord, type BorrowingStats } from '../../services/borrowing.service';
import { getReaderName } from '../../utils/borrowing';
import PageHeader from '../../components/admin/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useTheme } from '../../context/useTheme';

const BorrowingStatsPage: React.FC = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<BorrowingStats>({ total: 0, active: 0, returned: 0, overdue: 0 });
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, listRes] = await Promise.all([
        borrowingService.getStats(),
        borrowingService.getAll({ page: 1, limit: 100 }),
      ]);
      setStats(statsRes.data.data);
      setRecords(listRes.data.data.records);
    } catch {
      setError('Không thể tải dữ liệu thống kê');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchStats, 0);
    return () => clearTimeout(timer);
  }, []);

  const topBooks = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      const title = r.book?.title || 'Không rõ';
      map.set(title, (map.get(title) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, borrows]) => ({ name, borrows })).sort((a, b) => b.borrows - a.borrows).slice(0, 5);
  }, [records]);

  const topReaders = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      const name = getReaderName(r);
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [records]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { borrow: number; return: number }>();
    records.forEach((r) => {
      const m = new Date(r.borrowDate).toLocaleDateString('en-US', { month: 'short' });
      const entry = map.get(m) || { borrow: 0, return: 0 };
      entry.borrow += 1;
      map.set(m, entry);
      if (r.returnDate) {
        const rm = new Date(r.returnDate).toLocaleDateString('en-US', { month: 'short' });
        const rentry = map.get(rm) || { borrow: 0, return: 0 };
        rentry.return += 1;
        map.set(rm, rentry);
      }
    });
    return Array.from(map.entries()).map(([month, v]) => ({ month, borrowed: v.borrow, returned: v.return }));
  }, [records]);

  const maxBook = Math.max(1, ...topBooks.map((b) => b.borrows));
  const maxReader = Math.max(1, ...topReaders.map((r) => r.count));

  const kpis = [
    { label: 'Tổng lượt mượn', value: stats.total, icon: <BookMarked size={18} />, color: '#2563EB' },
    { label: 'Phiếu đang mượn', value: stats.active, icon: <BookOpenCheck size={18} />, color: '#F59E0B' },
    { label: 'Tổng lượt trả', value: stats.returned, icon: <BookCheck size={18} />, color: '#22C55E' },
    { label: 'Phiếu quá hạn', value: stats.overdue, icon: <AlertTriangle size={18} />, color: '#EF4444' },
  ];

  return (
    <div>
      <PageHeader title="Thống Kê Mượn Trả" subtitle="Báo cáo tổng quan về hoạt động mượn trả sách." />

      {loading ? (
        <LoadingState label="Đang tải dữ liệu thống kê..." minHeight={320} size="lg" />
      ) : error ? (
        <ErrorState title={error} description="Không thể tải dữ liệu thống kê mượn trả" onRetry={fetchStats} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${k.color}15`, color: k.color }}>{k.icon}</div>
                </div>
                <p className="text-[26px] font-bold text-slate-900 dark:text-slate-100">{k.value}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Monthly chart */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Thống kê theo tháng</h3>
              <p className="text-[13px] text-slate-500 mb-4">Lượt mượn và lượt trả theo từng tháng</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={monthlyData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1E293B' : '#fff', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, borderRadius: '8px', fontSize: '13px', color: isDark ? '#F8FAFC' : '#0F172A' }} />
                    <Bar dataKey="borrowed" name="Lượt mượn" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="returned" name="Lượt trả" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span className="text-[12px] text-slate-500">Lượt mượn</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[12px] text-slate-500">Lượt trả</span></div>
              </div>
            </div>

            {/* Top readers */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-[#8B5CF6]" />
                <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Độc giả mượn nhiều nhất</h3>
              </div>
              <p className="text-[13px] text-slate-500 mb-4">Top 5 theo tổng lượt mượn</p>
              <div className="flex flex-col gap-3">
                {topReaders.map((r, i) => (
                  <div key={r.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] text-slate-600 dark:text-slate-300 truncate max-w-[70%]">{i + 1}. {r.name}</span>
                      <span className="text-[12px] font-bold text-[#8B5CF6]">{r.count}</span>
                    </div>
                    <div className="h-1.5 bg-[#E2E8F0] dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#8B5CF6]" style={{ width: `${(r.count / maxReader) * 100}%` }} />
                    </div>
                  </div>
                ))}
                {topReaders.length === 0 && <p className="text-[13px] text-slate-400 text-center py-6">Chưa có dữ liệu</p>}
              </div>
            </div>
          </div>

          {/* Top books */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-amber-500" />
              <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Sách mượn nhiều nhất</h3>
            </div>
            <p className="text-[13px] text-slate-500 mb-4">Top 5 cuốn sách được mượn nhiều nhất</p>
            <div className="flex flex-col gap-3">
              {topBooks.map((b, i) => (
                <div key={b.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-slate-600 dark:text-slate-300 truncate max-w-[80%]">{i + 1}. {b.name}</span>
                    <span className="text-[12px] font-bold text-blue-600">{b.borrows} lượt</span>
                  </div>
                  <div className="h-2 bg-[#E2E8F0] dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#8B5CF6]" style={{ width: `${(b.borrows / maxBook) * 100}%` }} />
                  </div>
                </div>
              ))}
              {topBooks.length === 0 && <p className="text-[13px] text-slate-400 text-center py-6">Chưa có dữ liệu</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BorrowingStatsPage;
