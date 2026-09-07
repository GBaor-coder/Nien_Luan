import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, CalendarClock, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getErrorMessage } from '../../utils/error';
import { studentService, type Reservation } from '../../services/student.service';
import BookCover from '../../components/ui/BookCover';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { RESERVATION_STATUS, getStatusConfig } from '../../data/statusConfig';

const ROWS_PER_PAGE = 8;

const StudentReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const readerId = user?.id || '';
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReservations = useCallback(async (page = 1) => {
    if (!readerId) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const res = await studentService.getMyReservations(readerId, { page, limit: ROWS_PER_PAGE, search: search || undefined, status: statusFilter || undefined });
      setReservations(res.data.data.reservations);
      setPagination({
        total: res.data.data.pagination.total,
        page: res.data.data.pagination.page,
        totalPages: res.data.data.pagination.totalPages,
      });
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [readerId, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchReservations(1), 300);
    return () => clearTimeout(timer);
  }, [fetchReservations]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await studentService.cancelReservation(cancelTarget.id);
      setCancelTarget(null);
      setToast({ type: 'success', message: `Đã hủy đặt chỗ "${cancelTarget.book?.title}"` });
      fetchReservations(pagination.page);
    } catch (err) {
      const msg = getErrorMessage(err, 'Hủy đặt chỗ thất bại');
      setToast({ type: 'error', message: msg });
    } finally {
      setCancelling(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const isCancellable = (status: string) => ['in_queue', 'processing'].includes(status);

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'in_queue', label: 'Đang chờ' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'ready_for_pickup', label: 'Sẵn sàng nhận' },
    { value: 'fulfilled', label: 'Đã nhận' },
    { value: 'expired', label: 'Hết hạn' },
    { value: 'cancelled', label: 'Đã hủy' },
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
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">Đặt chỗ của tôi</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">Quản lý đặt sách và trạng thái nhận sách</p>
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
        <LoadingState label="Đang tải đặt chỗ..." minHeight={320} />
      ) : error ? (
        <ErrorState
          title="Không thể tải đặt chỗ"
          description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại."
          onRetry={() => fetchReservations(pagination.page)}
        />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Chưa có đặt chỗ nào"
          description={search || statusFilter ? 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.' : 'Đặt chỗ sách từ danh mục và nhận tại quầy thủ thư.'}
          actionLabel="Tìm sách"
          onAction={() => navigate('/user/catalog')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservations.map((res) => {
              const config = getStatusConfig(RESERVATION_STATUS, res.status);
              const bookTitle = res.book?.title || 'Unknown';

              return (
                <div
                  key={res.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 transition-shadow cursor-pointer"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                  onClick={() => navigate(`/user/books/${res.bookId}`)}
                >
                  <div className="flex items-start gap-4">
                    <BookCover
                      title={bookTitle}
                      coverImage={res.book?.coverImage}
                      coverColor={res.book?.coverColor}
                      className="w-16 h-[88px] rounded-xl"
                      textClassName="text-[10px]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 truncate">{bookTitle}</h4>
                        <StatusBadge config={config} size="sm" />
                      </div>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-2">{res.book?.author?.name || ''}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        <span>Yêu cầu: {new Date(res.requestDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}</span>
                        {res.estimatedAvailability && (
                          <span>Dự kiến có: {new Date(res.estimatedAvailability).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}</span>
                        )}
                      </div>
                      {res.queuePosition > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-medium">Vị trí hàng chờ: #{res.queuePosition}</span>
                        </div>
                      )}
                      {(res.status === 'ready_for_pickup' || res.status === 'ready') && (
                        <div className="mt-2 flex items-center gap-1 text-[12px] text-green-600 font-medium">
                          <MapPin size={14} /> Nhận tại quầy thủ thư trong 3 ngày
                        </div>
                      )}
                      {res.status === 'in_queue' && res.estimatedAvailability && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                          <CalendarClock size={12} /> Hết hạn sau: {new Date(res.expiryDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                      {isCancellable(res.status) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setCancelTarget(res); }}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[12px] font-semibold hover:bg-red-100 transition-colors cursor-pointer border-0"
                        >
                          <XCircle size={14} /> Hủy đặt chỗ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-5 flex justify-end">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => fetchReservations(p)}
              />
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!cancelTarget}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Hủy đặt chỗ"
        message={`Bạn muốn hủy đặt chỗ sách "${cancelTarget?.book?.title}"? Vị trí của bạn sẽ được giải phóng cho người khác.`}
        confirmLabel="Hủy đặt chỗ"
        danger
      />
    </div>
  );
};

export default StudentReservationsPage;
