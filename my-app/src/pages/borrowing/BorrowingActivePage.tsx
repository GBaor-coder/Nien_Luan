import React, { useState, useEffect, useCallback } from 'react';
import { BookOpenCheck, Eye, RotateCcw, Clock } from 'lucide-react';
import { borrowingService, type BorrowRecord } from '../../services/borrowing.service';
import PageHeader from '../../components/admin/PageHeader';
import SearchInput from '../../components/admin/SearchInput';
import StatusBadge from '../../components/admin/StatusBadge';
import BorrowRecordDetailModal from '../../components/admin/BorrowRecordDetailModal';
import { getReaderName, getReaderTypeLabel } from '../../utils/borrowing';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import Toast from '../../components/admin/Toast';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import { getErrorMessage } from '../../utils/error';

const ROWS_PER_PAGE = 8;

const BorrowingActivePage: React.FC = () => {
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
      const res = await borrowingService.getAll({ page, limit: ROWS_PER_PAGE, search: search || undefined, status: 'active' });
      setRecords(res.data.data.records);
      setPagination({ total: res.data.data.pagination.total, page: res.data.data.pagination.page, totalPages: res.data.data.pagination.totalPages });
      setError(null);
    } catch {
      setError('Không thể tải danh sách phiếu đang mượn');
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRecords(1), 300);
    return () => clearTimeout(timer);
  }, [fetchRecords]);

  const getRemainingDays = (dueDate: string) => {
    const due = new Date(dueDate).getTime();
    const now = new Date().getTime();
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    setActionLoading(true);
    try {
      await borrowingService.returnBook(returnTarget.id, 'Trả sách từ trang Phiếu đang mượn');
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

  return (
    <div>
      <PageHeader title="Phiếu Đang Mượn" subtitle="Danh sách phiếu mượn chưa hoàn trả." />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0">
          <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Tìm theo độc giả hoặc sách..." width="280px" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Độc giả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Loại</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Sách</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Ngày mượn</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Hạn trả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Còn lại</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const remaining = getRemainingDays(r.dueDate);
                return (
                  <tr key={r.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{getReaderName(r)}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{getReaderTypeLabel(r)}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{r.book?.title || '-'}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{new Date(r.borrowDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{new Date(r.dueDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: remaining <= 3 ? '#F59E0B' : '#16A34A' }}>
                        <Clock size={13} /> {remaining > 0 ? `${remaining} ngày` : 'Hết hạn'}
                      </span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setDetail(r); setDetailOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-0 bg-transparent" title="Xem chi tiết">
                          <Eye size={14} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => setReturnTarget(r)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 text-white text-[11px] font-medium hover:bg-[#16A34A] transition-colors cursor-pointer border-0"
                        >
                          <RotateCcw size={12} /> Trả
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr><td colSpan={8} className="px-5 py-10 text-center"><div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="sm" /> <span className="text-[13px]">Đang tải...</span></div></td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={8} className="px-5 py-10"><ErrorState compact title={error} onRetry={() => fetchRecords(pagination.page)} /></td></tr>
              )}
              {!loading && !error && records.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center">
                  <span className="flex flex-col items-center gap-2 text-[13px] text-slate-400">
                    <BookOpenCheck size={28} />
                    Không có phiếu mượn nào đang hoạt động
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

export default BorrowingActivePage;
