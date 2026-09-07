import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Star, CalendarClock, CheckCircle, AlertCircle,
  User as UserIcon, Layers, BookOpen, Hash, FileText, MapPin, Clock,
} from 'lucide-react';
import { booksService, type Book } from '../../services/books.service';
import { studentService, type Reservation } from '../../services/student.service';
import { useAuth } from '../../context/useAuth';
import BookCover from '../../components/ui/BookCover';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { BOOK_STATUS, getStatusConfig } from '../../data/statusConfig';
import { getErrorMessage } from '../../utils/error';

const StudentBookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const readerId = user?.id || '';
  const studentId = user?.student?.id || '';
  const teacherId = user?.teacher?.id || '';
  const readerType = user?.student ? 'student' : user?.teacher ? 'teacher' : null;
  const hasReaderProfile = !!studentId || !!teacherId;

  const [book, setBook] = useState<Book | null>(null);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBook = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const res = await booksService.getById(id);
      setBook(res.data.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBook(), 0);
    return () => clearTimeout(timer);
  }, [fetchBook]);

  useEffect(() => {
    if (!readerId) return;
    studentService.getMyReservations(readerId, { limit: 50 })
      .then((res) => setMyReservations(res.data.data.reservations))
      .catch(() => {});
  }, [readerId]);

  const alreadyReserved = book ? myReservations.some((r) => r.bookId === book.id && ['in_queue', 'processing', 'ready_for_pickup', 'ready'].includes(r.status)) : false;

  const handleReserve = async () => {
    if (!book || !hasReaderProfile || !readerType) return;
    setReserving(true);
    try {
      await studentService.createReservation({
        readerId,
        studentId: user?.student?.id,
        teacherId: user?.teacher?.id,
        readerType,
        bookId: book.id,
      });
      setConfirmOpen(false);
      setToast({ type: 'success', message: 'Đã gửi yêu cầu đặt chỗ! Nhận sách tại quầy thủ thư.' });
      setTimeout(() => navigate('/user/reservations'), 1200);
    } catch (err) {
      const msg = getErrorMessage(err, 'Đặt chỗ thất bại. Vui lòng thử lại.');
      setToast({ type: 'error', message: msg });
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải thông tin sách..." minHeight={400} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Không thể tải thông tin sách"
        description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={fetchBook}
      />
    );
  }

  if (!book) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Không tìm thấy sách"
        description="Cuốn sách bạn tìm không tồn tại hoặc đã bị xóa."
        actionLabel="Quay lại danh mục"
        onAction={() => navigate('/user/catalog')}
      />
    );
  }

  const config = getStatusConfig(BOOK_STATUS, book.available <= 0 ? 'out_of_stock' : book.available < (book.quantity || 1) * 0.3 ? 'limited' : 'available');
  const infoItems = [
    { label: 'Tác giả', value: book.author?.name || '-', icon: UserIcon },
    { label: 'Thể loại', value: book.category?.name || '-', icon: Layers },
    { label: 'ISBN', value: book.isbn || '-', icon: Hash },
    { label: 'Nhà xuất bản', value: book.publisher?.name || '-', icon: FileText },
    { label: 'Năm xuất bản', value: book.year ? String(book.year) : '-', icon: Clock },
    { label: 'Số trang', value: book.pages ? String(book.pages) : '-', icon: FileText },
    { label: 'Ngôn ngữ', value: book.language || '-', icon: FileText },
    { label: 'Vị trí kệ', value: book.location || '-', icon: MapPin },
  ];

  return (
    <div className="max-w-[1200px] mx-auto relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-[13px] font-medium">{toast.message}</span>
        </div>
      )}

      <button
        onClick={() => navigate('/user/catalog')}
        className="flex items-center gap-1.5 mb-5 text-[13px] font-medium text-slate-500 hover:text-blue-600 transition-colors cursor-pointer border-0 bg-transparent"
      >
        <ChevronLeft size={16} /> Quay lại danh mục
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="flex-shrink-0 md:w-64">
            <BookCover
              title={book.title}
              coverImage={book.coverImage}
              coverColor={book.coverColor}
              className="w-full aspect-[3/4] rounded-xl shadow-md"
              textClassName="text-[16px]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge config={config} size="md" />
              <span className="text-[12px] text-slate-500 dark:text-slate-400">
                {book.available > 0 ? `Còn ${book.available}/${book.quantity} bản` : 'Hiện chưa có bản khả dụng'}
              </span>
            </div>
            <h2 className="text-[24px] font-bold text-slate-900 dark:text-slate-100 mb-1">{book.title}</h2>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-4">
              {book.author?.name ? `Tác giả: ${book.author.name}` : ''}
            </p>
            {book.avgRating ? (
              <div className="flex items-center gap-1.5 mb-4">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="text-[14px] font-bold text-slate-900 dark:text-slate-100">{Number(book.avgRating).toFixed(1)}</span>
                {book.totalReviews ? <span className="text-[12px] text-slate-400">({book.totalReviews} đánh giá)</span> : null}
              </div>
            ) : null}

            {book.description && (
              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{book.description}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {!hasReaderProfile ? (
                <div className="flex-1 sm:flex-none inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[13px] font-medium">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  Tài khoản chưa có hồ sơ độc giả. Hãy liên hệ thủ thư để đăng ký thẻ thư viện và kích hoạt tính năng đặt mượn.
                </div>
              ) : (
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={alreadyReserved}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarClock size={16} />
                  {alreadyReserved ? 'Đã đặt chỗ sách này' : book.available > 0 ? 'Đặt mượn sách' : 'Đặt chỗ (xếp hàng)'}
                </button>
              )}
              <button
                onClick={() => navigate('/user/reservations')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[14px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer border-0"
              >
                Xem đặt chỗ của tôi
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <p className="text-[12px] text-slate-500 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Lưu ý:</span> Sau khi đặt chỗ thành công, bạn đến quầy thủ thư để nhận sách trong vòng 3 ngày. Quá hạn đặt chỗ sẽ tự hủy.
              </p>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-4">Thông tin chi tiết</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Icon size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleReserve}
        loading={reserving}
        title="Xác nhận đặt chỗ"
        message={`Bạn muốn đặt chỗ sách "${book.title}"? Yêu cầu sẽ được chuyển tới thủ thư để xác nhận và sắp xếp nhận sách.`}
        confirmLabel="Đặt chỗ"
      />
    </div>
  );
};

export default StudentBookDetailPage;
