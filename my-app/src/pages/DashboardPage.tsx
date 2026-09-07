import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Download, RefreshCw, ChevronDown, AlertCircle } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { dashboardService, type DashboardOverview, type BorrowingTrend, type CategoryDistribution, type RecentActivity, type StatusDistribution } from '../services/dashboard.service';
import { getErrorMessage } from '../utils/error';
import KPICard from '../components/admin/KPICard';
import BorrowingTrendsChart from '../components/admin/BorrowingTrendsChart';
import CategoryDistributionChart from '../components/admin/CategoryDistributionChart';
import RecentActivityTable from '../components/admin/RecentActivityTable';
import QuickActions from '../components/admin/QuickActions';
import StatusDistributionChart from '../components/admin/StatusDistributionChart';
import ActionableInsights from '../components/admin/ActionableInsights';
import BorrowFlowPipeline from '../components/admin/BorrowFlowPipeline';
import Toast from '../components/admin/Toast';
import Button from '../components/ui/Button';
import { useAuth } from '../context/useAuth';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [trends, setTrends] = useState<BorrowingTrend[]>([]);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user } = useAuth();

  const dateRangeLabel = dateRange.startDate && dateRange.endDate
    ? `${new Date(dateRange.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateRange.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Tất cả thời gian';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, trendsRes, catRes, actRes, statusRes] = await Promise.allSettled([
        dashboardService.getOverview(dateRange),
        dashboardService.getBorrowingTrends(dateRange),
        dashboardService.getCategoryDistribution(dateRange),
        dashboardService.getRecentActivity(10),
        dashboardService.getStatusDistribution(),
      ]);

      let hasError = false;
      if (overviewRes.status === 'rejected') hasError = true;
      if (trendsRes.status === 'rejected') hasError = true;
      if (catRes.status === 'rejected') hasError = true;
      if (actRes.status === 'rejected') hasError = true;
      if (statusRes.status === 'rejected') hasError = true;

      if (hasError) {
        let err: unknown = new Error('Không thể tải dữ liệu bảng điều khiển.');
        if (overviewRes.status === 'rejected') err = overviewRes.reason;
        else if (trendsRes.status === 'rejected') err = trendsRes.reason;
        setError(getErrorMessage(err, 'Không thể tải dữ liệu bảng điều khiển.'));
      } else {
        setError(null);
      }

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data.data);
      if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data.data);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data);
      if (actRes.status === 'fulfilled') setActivities(actRes.value.data.data);
      if (statusRes.status === 'fulfilled') setStatusDistribution(statusRes.value.data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Đã xảy ra lỗi không mong muốn.'));
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleExport = () => {
    const rows: string[][] = [];
    rows.push(['Thống kê', 'Giá trị']);
    if (overview) {
      rows.push(['Tổng số sách', String(overview.kpis.totalBooks)]);
      rows.push(['Sách đang mượn', String(overview.kpis.borrowedBooks)]);
      rows.push(['Sách quá hạn', String(overview.kpis.overdueBooks)]);
      rows.push(['Độc giả hoạt động', String(overview.kpis.activeReaders)]);
      rows.push(['Sách có sẵn', String(overview.kpis.availableBooks)]);
      rows.push(['Tổng độc giả', String(overview.kpis.totalReaders)]);
      rows.push(['Phạt chưa thanh toán', String(overview.kpis.outstandingFines)]);
      rows.push(['Đặt chỗ đang chờ', String(overview.kpis.pendingReservations)]);
      rows.push(['Số thể loại', String(overview.counts.categories)]);
      rows.push(['Số tác giả', String(overview.counts.authors)]);
    }
    rows.push([]);
    rows.push(['Tháng', 'Mượn', 'Trả']);
    trends.forEach((t) => rows.push([t.month, String(t.borrowed), String(t.returned)]));
    rows.push([]);
    rows.push(['Trạng thái', 'Số lượng']);
    statusDistribution.forEach((s) => rows.push([s.status, String(s.count)]));

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Đã xuất file CSV thành công', type: 'success' });
  };

  const kpiData = overview ? [
    { id: 1, title: 'Tổng số Sách', value: (overview.kpis?.totalBooks || 0).toLocaleString(), change: '', trend: 'up' as const, icon: 'BookOpen', color: '#2563EB' },
    { id: 2, title: 'Sách có Sẵn', value: (overview.kpis?.availableBooks || 0).toLocaleString(), change: '', trend: 'up' as const, icon: 'Package', color: '#06B6D4' },
    { id: 3, title: 'Sách đang Mượn', value: (overview.kpis?.borrowedBooks || 0).toLocaleString(), change: overview.kpiTrends?.borrowedBooks?.change || '', trend: (overview.kpiTrends?.borrowedBooks?.trend || 'up') as 'up' | 'down', icon: 'BookMarked', color: '#8B5CF6' },
    { id: 4, title: 'Sách Quá hạn', value: (overview.kpis?.overdueBooks || 0).toLocaleString(), change: '', trend: 'down' as const, icon: 'AlertTriangle', color: '#F59E0B' },
    { id: 5, title: 'Độc giả Hoạt động', value: (overview.kpis?.activeReaders || 0).toLocaleString(), change: '', trend: 'up' as const, icon: 'Users', color: '#22C55E' },
    { id: 6, title: 'Tổng Độc giả', value: (overview.kpis?.totalReaders || 0).toLocaleString(), change: '', trend: 'up' as const, icon: 'UserCheck', color: '#14B8A4' },
    { id: 7, title: 'Phạt chưa Thanh toán', value: `${(overview.kpis?.outstandingFines || 0).toLocaleString()}₫`, change: '', trend: (overview.kpis?.outstandingFines > 0 ? 'down' : 'up') as 'up' | 'down', icon: 'Wallet', color: '#EC4899' },
    { id: 8, title: 'Đặt chỗ chờ', value: (overview.kpis?.pendingReservations || 0).toLocaleString(), change: '', trend: 'up' as const, icon: 'Clock', color: '#A855F7' },
  ] : [];

  const flowData = {
    availableBooks: overview?.kpis?.availableBooks || 0,
    borrowedBooks: overview?.kpis?.borrowedBooks || 0,
    overdueBooks: overview?.kpis?.overdueBooks || 0,
    returnedBooks: overview?.kpis?.returnedBooks || 0,
    lostBooks: overview?.kpis?.lostBooks || 0,
  };

  const firstKpis = kpiData.slice(0, 4);
  const secondKpis = kpiData.slice(4);

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6"
      >
        <div>
          <h2 className="text-[26px] sm:text-[30px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Xin chào, {user?.name?.split(' ').pop() || 'Thủ thư'}
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi tài nguyên, luồng mượn - trả và hiệu suất hoạt động của thư viện.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] font-medium text-slate-500 dark:text-slate-400">
            <Calendar size={15} />
            <span>{dateRangeLabel}</span>
            <ChevronDown size={14} />
          </div>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
            style={{ maxWidth: '140px' }}
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
            style={{ maxWidth: '140px' }}
          />
          <Button
            onClick={handleExport}
            disabled={!overview}
            variant="secondary"
            leftIcon={<Download size={15} />}
          >
            Xuất
          </Button>
          <Button
            onClick={fetchData}
            loading={loading}
            leftIcon={loading ? undefined : <RefreshCw size={15} />}
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 flex items-center gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
        >
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {/* KPI Cards - nhóm tài nguyên & lưu thông */}
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Tài nguyên &amp; Lưu thông sách
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {firstKpis.map((kpi, i) => (
            <motion.div key={kpi.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Độc giả &amp; Giao dịch
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {secondKpis.map((kpi, i) => (
            <motion.div key={kpi.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Luồng mượn - trả */}
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <BorrowFlowPipeline data={flowData} />
        </motion.div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <BorrowingTrendsChart data={trends} />
          </motion.div>
        </div>
        <div>
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <StatusDistributionChart data={statusDistribution} />
          </motion.div>
        </div>
      </div>

      {/* Insights + Thể loại + Thao tác nhanh */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div>
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <ActionableInsights data={overview?.insights || { overdueBooks: 0, outstandingFines: 0, readyForPickup: 0, totalReservations: 0 }} />
          </motion.div>
        </div>
        <div>
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
            <CategoryDistributionChart data={categories} />
          </motion.div>
        </div>
        <div className="flex flex-col gap-6">
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
            <QuickActions />
          </motion.div>
        </div>
      </div>

      {/* Bảng */}
      <div>
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <RecentActivityTable data={activities} />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
