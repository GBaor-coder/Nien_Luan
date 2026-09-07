import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Bell, Eye, MailCheck, Calculator } from 'lucide-react';
import { borrowingService, type BorrowRecord } from '../../services/borrowing.service';
import PageHeader from '../../components/admin/PageHeader';
import SearchInput from '../../components/admin/SearchInput';
import StatusBadge from '../../components/admin/StatusBadge';
import BorrowRecordDetailModal from '../../components/admin/BorrowRecordDetailModal';
import { getReaderName, getOverdueDays } from '../../utils/borrowing';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import Toast from '../../components/admin/Toast';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import { getErrorMessage } from '../../utils/error';

const ROWS_PER_PAGE = 8;

const BorrowingOverduePage: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<BorrowRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<BorrowRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await borrowingService.getOverdueDetails({ page, limit: ROWS_PER_PAGE, search: search || undefined });
      setRecords(res.data.data.records);
      setPagination({ total: res.data.data.pagination.total, page: res.data.data.pagination.page, totalPages: res.data.data.pagination.totalPages });
      setError(null);
    } catch {
      setError('Không thể tải danh sách phiếu quá hạn');
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRecords(1), 300);
    return () => clearTimeout(timer);
  }, [fetchRecords]);

  const handleReturn = async () => {
    if (!returnTarget) return;
    setActionLoading(true);
    try {
      await borrowingService.returnBook(returnTarget.id, 'Trả sách từ trang Phiếu quá hạn');
      setToast({ message: 'Trả sách thành công', type: 'success' });
      setReturnTarget(null);
      setDetail(null);
      fetchRecords(pagination.page);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Trả sách thất bại'), type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemind = (r: BorrowRecord) => {
    setToast({ message: `Đã gửi nhắc nhở tới "${getReaderName(r)}" về phiếu mượn quá hạn`, type: 'success' });
  };

  const [calculating, setCalculating] = useState(false);

  const handleCalculateFines = async () => {
    setCalculating(true);
    try {
      const res = await borrowingService.processOverdue();
      const data = res.data.data;
      const count = (data.created?.length || 0) + (data.updated?.length || 0);
      setToast({
        message: count > 0
          ? `Đã chuyển ${data.markedOverdue} phiếu sang quá hạn, xử lý ${count} phiếu phạt`
          : 'Không có phiếu quá hạn mới cần xử lý',
        type: 'success',
      });
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Xử lý quá hạn thất bại'), type: 'error' });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div>
      <PageHeader title="Phiếu Quá Hạn" subtitle="Danh sách phiếu mượn vượt hạn trả cần xử lý." />

      {pagination.total > 0 && (
        <div className="bg-red-50 dark:bg-[#7F1D1D]/20 border border-red-200 dark:border-[#991B1B]/30 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#991B1B] dark:text-[#FCA5A5]">{pagination.total} phiếu mượn đang quá hạn</p>
            <p className="text-[12px] text-[#B91C1C] dark:text-[#FCA5A5]/70">Cần liên hệ nhắc nhở và thu hồi sách kịp thời</p>
          </div>
          <button
            onClick={() => records.forEach(handleRemind)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium hover:bg-[#DC2626] transition-colors cursor-pointer border-0"
          >
            <Bell size={14} /> Nhắc nhở tất cả
          </button>
          <button
            onClick={handleCalculateFines}
            disabled={calculating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B] text-white text-[12px] font-medium hover:bg-[#D97706] transition-colors cursor-pointer border-0 disabled:opacity-50"
          >
            {calculating ? <Spinner size="sm" /> : <Calculator size={14} />} Tính phí phạt
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0">
          <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Tìm phiếu quá hạn..." width="280px" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Độc giả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Sách</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Ngày mượn</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Hạn trả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Quá hạn</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const days = getOverdueDays(r.dueDate);
                return (
                  <tr key={r.id} className="border-b border-[#FEF2F2] dark:border-slate-700 last:border-0 hover:bg-red-50/60 dark:hover:bg-[#7F1D1D]/20 transition-colors bg-red-50/30 dark:bg-[#7F1D1D]/10">
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{getReaderName(r)}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{r.book?.title || '-'}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{new Date(r.borrowDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{new Date(r.dueDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[12px] font-bold">
                        <AlertTriangle size={12} /> {days} ngày
                      </span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRemind(r)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-medium hover:bg-[#FEE2E2] transition-colors cursor-pointer border-0" title="Gửi nhắc nhở">
                          <MailCheck size={12} /> Nhắc nhở
                        </button>
                        <button onClick={() => { setDetail(r); setDetailOpen(true); }} className="p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors cursor-pointer border-0 bg-transparent" title="Xem chi tiết">
                          <Eye size={14} className="text-blue-600" />
                        </button>
                        <button onClick={() => setReturnTarget(r)} className="px-2 py-1.5 rounded-lg bg-green-500 text-white text-[11px] font-medium hover:bg-[#16A34A] transition-colors cursor-pointer border-0">
                          Trả
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr><td colSpan={7} className="px-5 py-10 text-center"><div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="sm" /> <span className="text-[13px]">Đang tải...</span></div></td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={7} className="px-5 py-10"><ErrorState compact title={error} onRetry={() => fetchRecords(pagination.page)} /></td></tr>
              )}
              {!loading && !error && records.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center">
                  <span className="flex flex-col items-center gap-2 text-[13px] text-slate-400">
                    <MailCheck size={28} />
                    Không có phiếu mượn nào quá hạn. Tuyệt vời!
                  </span>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchRecords} />
      </div>

      <BorrowRecordDetailModal record={detail} isOpen={detailOpen} onClose={() => { setDetailOpen(false); setDetail(null); }} />

      <ConfirmModal
        isOpen={!!returnTarget}
        title="Xác nhận trả sách"
        message={`Bạn có chắc chắn muốn trả sách "${returnTarget?.book?.title || ''}" cho "${getReaderName(returnTarget)}"?`}
        confirmLabel="Xác nhận trả"
        cancelLabel="Hủy"
        danger={false}
        loading={actionLoading}
        onConfirm={handleReturn}
        onCancel={() => setReturnTarget(null)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BorrowingOverduePage;
