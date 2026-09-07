import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, CalendarDays, Library, BookHeart } from 'lucide-react';
import DueDateAlert from '../../components/users/DueDateAlert';
import CurrentBorrowings from '../../components/users/CurrentBorrowings';
import QuickStats from '../../components/users/QuickStats';
import ReservationStatus from '../../components/users/ReservationStatus';
import RecommendedBooks from '../../components/users/RecommendedBooks';
import LibraryNotice from '../../components/users/LibraryNotice';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../context/useAuth';
import { getErrorMessage } from '../../utils/error';
import { studentService, type BorrowRecord, type Reservation } from '../../services/student.service';

const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.student?.id || '';
  const teacherId = user?.teacher?.id || '';
  const readerId = user?.id || '';
  const readerType = user?.student ? 'student' : user?.teacher ? 'teacher' : null;
  const hasReaderProfile = !!studentId || !!teacherId;
  const maxBorrow = user?.student?.membershipCard?.maxBorrow || (readerType === 'teacher' ? 10 : 5);

  const [activeBorrowings, setActiveBorrowings] = useState<BorrowRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [borrowStats, setBorrowStats] = useState({ total: 0, active: 0, returned: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [renewTarget, setRenewTarget] = useState<BorrowRecord | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasReaderProfile) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const [borrowRes, statsRes, resRes] = await Promise.all([
        studentService.getMyBorrowings(readerId, { limit: 10, studentId: studentId || undefined, teacherId: teacherId || undefined }),
        studentService.getBorrowingStats(),
        studentService.getMyReservations(readerId, { limit: 5 }),
      ]);

      const allBorrowings = borrowRes.data.data.records;
      setActiveBorrowings(allBorrowings.filter(r => r.status === 'active' || r.status === 'overdue'));
      setBorrowStats(statsRes.data.data);
      setReservations(resRes.data.data.reservations);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [hasReaderProfile, readerId, studentId, teacherId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleRenew = async () => {
    if (!renewTarget) return;
    setRenewingId(renewTarget.id);
    try {
      await studentService.renewBook(renewTarget.id);
      setRenewTarget(null);
      setToast({ type: 'success', message: `Đã gia hạn "${renewTarget.book?.title}" thành công` });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: getErrorMessage(err, 'Gia hạn thất bại') });
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lift ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-[13px] font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header chào mừng */}
      <div className="col-span-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-6 sm:p-8 text-white">
          <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[13px] text-violet-200 font-medium flex items-center gap-1.5 mb-1">
                <CalendarDays size={14} />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight">
                Chào mừng trở lại, {user?.name?.split(' ').pop() || 'bạn'}!
              </h2>
              <p className="text-[14px] text-violet-100/90 mt-1 max-w-xl">
                Khám phá bộ sưu tập sách mới, theo dõi phiếu mượn và quản lý thời gian đọc của bạn.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
                <Library size={22} className="mb-1" />
                <span className="text-[10px] text-violet-100">Thư viện số</span>
              </div>
              <button
                onClick={() => window.location.assign('/user/catalog')}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-white text-violet-700 text-[13px] font-semibold hover:bg-violet-50 transition-colors cursor-pointer border-0 shadow-sm"
              >
                <BookHeart size={16} />
                Tìm sách ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="col-span-12">
          <ErrorState compact title="Không thể tải dữ liệu bảng điều khiển" onRetry={fetchData} />
        </div>
      )}

      <DueDateAlert borrowings={activeBorrowings} loading={loading} />
      <CurrentBorrowings borrowings={activeBorrowings} loading={loading} onRenew={setRenewTarget} renewingId={renewingId} />
      <QuickStats
        activeCount={activeBorrowings.length}
        totalCount={borrowStats.total}
        returnedCount={borrowStats.returned}
        maxBorrow={maxBorrow}
        loading={loading}
      />
      <ReservationStatus reservations={reservations} loading={loading} />
      <RecommendedBooks />
      <LibraryNotice />

      <ConfirmModal
        isOpen={!!renewTarget}
        onCancel={() => setRenewTarget(null)}
        onConfirm={handleRenew}
        loading={renewingId !== null}
        title="Gia hạn sách"
        message={`Bạn muốn gia hạn thời gian mượn cho sách "${renewTarget?.book?.title}"?`}
        confirmLabel="Gia hạn"
      />
    </div>
  );
};

export default StudentDashboardPage;
