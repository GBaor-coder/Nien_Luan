import React, { useState, useEffect, useCallback } from 'react';
import { CalendarClock, CheckCircle2, Check, X, Hash, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reservationsService, type Reservation } from '../services/reservations.service';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import StatusBadge from '../components/admin/StatusBadge';
import ConfirmModal from '../components/ui/ConfirmModal';
import Pagination from '../components/ui/Pagination';
import Select from '../components/ui/Select';
import Toast from '../components/admin/Toast';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { getErrorMessage } from '../utils/error';

const ROWS_PER_PAGE = 8;

const ReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ action: 'ready' | 'fulfill' | 'cancel'; reservation: Reservation } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await reservationsService.getAll({ page, limit: ROWS_PER_PAGE, search: search || undefined, status: statusFilter || undefined });
      setReservations(res.data.data.reservations);
      setPagination({ total: res.data.data.pagination.total, page: res.data.data.pagination.page, totalPages: res.data.data.pagination.totalPages });
      setError(null);
    } catch {
      setError('Không thể tải danh sách đặt chỗ');
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchReservations(1), 300);
    return () => clearTimeout(timer);
  }, [fetchReservations]);

  const getReaderName = (r: Reservation) =>
    r.student?.user?.name || r.teacher?.user?.name || r.readerId || '-';

  const getReaderTypeLabel = (r: Reservation) =>
    r.readerType === 'teacher' ? 'Giảng viên' : r.readerType === 'student' ? 'Học sinh' : '-';

  const handleConfirm = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const { action, reservation } = confirm;
      if (action === 'ready') {
        await reservationsService.updateStatus(reservation.id, 'ready_for_pickup');
        setToast({ message: `Đã đánh dấu "${reservation.book.title}" sẵn sàng nhận`, type: 'success' });
      } else if (action === 'fulfill') {
        await reservationsService.updateStatus(reservation.id, 'fulfilled');
        setToast({ message: `Đã xác nhận nhận sách "${reservation.book.title}"`, type: 'success' });
      } else {
        await reservationsService.updateStatus(reservation.id, 'cancelled');
        setToast({ message: `Đã hủy đặt chỗ "${reservation.book.title}"`, type: 'success' });
      }
      setConfirm(null);
      fetchReservations(pagination.page);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmMessages: Record<string, { title: string; message: string; label: string }> = {
    ready: {
      title: 'Đánh dấu sẵn sàng',
      message: `Xác nhận sách "${confirm?.reservation.book.title}" đã có sẵn để bạn đọc nhận? Người đặt sẽ nhận được thông báo.`,
      label: 'Sẵn sàng',
    },
    fulfill: {
      title: 'Xác nhận đã nhận sách',
      message: `Xác nhận bạn đọc đã nhận sách "${confirm?.reservation.book.title}"?`,
      label: 'Xác nhận đã nhận',
    },
    cancel: {
      title: 'Hủy đặt chỗ',
      message: `Bạn có chắc muốn hủy đặt chỗ sách "${confirm?.reservation.book.title}"? Vị trí sẽ được giải phóng cho người đặt tiếp theo.`,
      label: 'Hủy đặt chỗ',
    },
  };

  return (
    <div>
      <PageHeader
        title="Quản Lý Đặt Chỗ"
        subtitle="Theo dõi hàng đợi đặt sách, đánh dấu sẵn sàng và xác nhận nhận sách."
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0 flex flex-col sm:flex-row gap-3 sm:items-center">
          <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Tìm theo bạn đọc hoặc sách..." width="280px" />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'in_queue', label: 'Đang chờ' },
              { value: 'processing', label: 'Đang xử lý' },
              { value: 'ready_for_pickup', label: 'Sẵn sàng nhận' },
              { value: 'fulfilled', label: 'Đã nhận' },
              { value: 'expired', label: 'Hết hạn' },
              { value: 'cancelled', label: 'Đã hủy' },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Bạn đọc</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Loại</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Sách</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Ngày yêu cầu</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Vị trí chờ</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const isQueue = ['in_queue', 'processing'].includes(r.status);
                const isReady = r.status === 'ready_for_pickup';
                return (
                  <tr key={r.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{getReaderName(r)}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{getReaderTypeLabel(r)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${r.book?.coverColor || '#2563EB'}18`, color: r.book?.coverColor || '#2563EB' }}>
                          <Hash size={13} />
                        </div>
                        <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">{r.book?.title || '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{new Date(r.requestDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300 font-mono">
                      {r.queuePosition > 0 ? `#${r.queuePosition}` : '-'}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {isQueue && (
                          <button
                            onClick={() => setConfirm({ action: 'ready', reservation: r })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 text-white text-[11px] font-medium hover:bg-[#16A34A] transition-colors cursor-pointer border-0"
                            title="Đánh dấu sẵn sàng nhận"
                          >
                            <Check size={12} /> Sẵn sàng
                          </button>
                        )}
                        {isReady && (
                          <button
                            onClick={() => setConfirm({ action: 'fulfill', reservation: r })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"
                            title="Xác nhận đã nhận sách"
                          >
                            <CheckCircle2 size={12} /> Đã nhận
                          </button>
                        )}
                        {(isQueue || isReady) && (
                          <button
                            onClick={() => setConfirm({ action: 'cancel', reservation: r })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-medium hover:bg-[#FEE2E2] transition-colors cursor-pointer border-0"
                            title="Hủy đặt chỗ"
                          >
                            <X size={12} /> Hủy
                          </button>
                        )}
                        {r.borrowRecord && (
                          <button
                            onClick={() => navigate(r.borrowRecord!.status === 'returned' ? '/dashboard/borrowing/returned' : '/dashboard/borrowing/active')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-medium hover:bg-blue-100 transition-colors cursor-pointer border-0"
                            title="Xem phiếu mượn liên kết"
                          >
                            <FileText size={12} /> Phiếu mượn
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr><td colSpan={7} className="px-5 py-10 text-center"><div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="sm" /> <span className="text-[13px]">Đang tải...</span></div></td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={7} className="px-5 py-10"><ErrorState compact title={error} onRetry={() => fetchReservations(pagination.page)} /></td></tr>
              )}
              {!loading && !error && reservations.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center">
                  <span className="flex flex-col items-center gap-2 text-[13px] text-slate-400">
                    <CalendarClock size={28} />
                    Không có đặt chỗ nào
                  </span>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchReservations} />
      </div>

      <ConfirmModal
        isOpen={!!confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirm}
        loading={actionLoading}
        title={confirm ? confirmMessages[confirm.action].title : ''}
        message={confirm ? confirmMessages[confirm.action].message : ''}
        confirmLabel={confirm ? confirmMessages[confirm.action].label : ''}
        danger={confirm?.action === 'cancel'}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ReservationsPage;
