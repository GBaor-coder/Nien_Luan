import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getErrorMessage } from '../../utils/error';
import { studentService, type BorrowRecord } from '../../services/student.service';
import BookCover from '../../components/ui/BookCover';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { BORROW_STATUS, getStatusConfig } from '../../data/statusConfig';

const ROWS_PER_PAGE = 8;

const StudentBorrowingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.student?.id || '';
  const teacherId = user?.teacher?.id || '';
  const readerId = user?.id || '';
  const hasReaderProfile = !!studentId || !!teacherId;
  const [borrowings, setBorrowings] = useState<BorrowRecord[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [renewTarget, setRenewTarget] = useState<BorrowRecord | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBorrowings = useCallback(async (page = 1) => {
    if (!hasReaderProfile) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const res = await studentService.getMyBorrowings(readerId, { page, limit: ROWS_PER_PAGE, search: search || undefined, status: statusFilter || undefined, studentId: studentId || undefined, teacherId: teacherId || undefined });
      setBorrowings(res.data.data.records);
      setPagination({
        total: res.data.data.pagination.total,
        page: res.data.data.pagination.page,
        totalPages: res.data.data.pagination.totalPages,
      });
    } catch (err) {
      console.error('Failed to fetch borrowings:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [hasReaderProfile, readerId, studentId, teacherId, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBorrowings(1), 300);
    return () => clearTimeout(timer);
  }, [fetchBorrowings]);

  const handleRenew = async () => {
    if (!renewTarget) return;
    setRenewingId(renewTarget.id);
    try {
      await studentService.renewBook(renewTarget.id);
      setRenewTarget(null);
      setToast({ type: 'success', message: `Đã gia hạn "${renewTarget.book?.title}"` });
      fetchBorrowings(pagination.page);
    } catch (err) {
      const msg = getErrorMessage(err, 'Gia hạn thất bại. Vui lòng thử lại.');
      setToast({ type: 'error', message: msg });
    } finally {
      setRenewingId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const getRemainingDays = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang mượn' },
    { value: 'overdue', label: 'Quá hạn' },
    { value: 'returned', label: 'Đã trả' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-[13px] font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">Mượn trả của tôi</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">Theo dõi tất cả sách đã mượn và trạng thái</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên sách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 outline-none text-[13px] text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Đang tải phiếu mượn..." minHeight={320} />
      ) : error ? (
        <ErrorState
          title="Không thể tải phiếu mượn"
          description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại."
          onRetry={() => fetchBorrowings(pagination.page)}
        />
      ) : borrowings.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Không có phiếu mượn nào"
          description={search || statusFilter ? 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.' : 'Khám phá danh mục sách và đặt mượn cuốn đầu tiên nhé!'}
          actionLabel="Tìm sách"
          onAction={() => navigate('/user/catalog')}
        />
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {borrowings.map((record) => {
                const remainingDays = record.status === 'returned' ? 0 : getRemainingDays(record.dueDate);
                const status = record.status === 'active' && remainingDays <= 3 && remainingDays >= 0 ? 'due_soon' : record.status;
                const config = getStatusConfig(BORROW_STATUS, status);
                const bookTitle = record.book?.title || 'Unknown';

                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    onClick={() => navigate(`/user/books/${record.bookId}`)}
                  >
                    <BookCover
                      title={bookTitle}
                      coverImage={record.book?.coverImage}
                      coverColor={record.book?.coverColor}
                      className="w-14 h-[72px] rounded-xl"
                      textClassName="text-[10px]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 truncate">{bookTitle}</h4>
                        <StatusBadge config={config} />
                      </div>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-1">{record.book?.author?.name || ''}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        {record.book?.category?.name && (
                          <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{record.book.category.name}</span>
                        )}
                        <span className="text-[11px] text-slate-400">Đã mượn: {new Date(record.borrowDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}</span>
                        <span className="text-[11px] text-slate-400">Hạn trả: {new Date(record.dueDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}</span>
                        {record.renewalCount > 0 && <span className="text-[11px] text-slate-400">Đã gia hạn {record.renewalCount}/{record.maxRenewals}</span>}
                      </div>
                    </div>

                    {record.status === 'active' && record.renewalCount < record.maxRenewals && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenewTarget(record); }}
                        disabled={renewingId === record.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 text-[12px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer border-0 flex-shrink-0 disabled:opacity-50"
                        title="Gia hạn sách"
                      >
                        {renewingId === record.id ? <Spinner size="xs" /> : <RotateCcw size={14} />}
                        Gia hạn
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-5 flex justify-end">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => fetchBorrowings(p)}
              />
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!renewTarget}
        onCancel={() => setRenewTarget(null)}
        onConfirm={handleRenew}
        loading={renewingId !== null}
        title="Gia hạn sách"
        message={`Gia hạn thời gian mượn cho sách "${renewTarget?.book?.title}"? Hạn trả sẽ được kéo dài thêm.`}
        confirmLabel="Gia hạn"
      />
    </div>
  );
};

export default StudentBorrowingsPage;
