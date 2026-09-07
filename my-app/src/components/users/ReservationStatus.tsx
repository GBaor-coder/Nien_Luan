import React from 'react';
import { CalendarClock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Reservation } from '../../services/student.service';
import BookCover from '../ui/BookCover';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import { RESERVATION_STATUS, getStatusConfig } from '../../data/statusConfig';

interface ReservationStatusProps {
  reservations: Reservation[];
  loading: boolean;
}

const ReservationStatus: React.FC<ReservationStatusProps> = ({ reservations, loading }) => {
  const navigate = useNavigate();
  const activeReservations = reservations.filter((r) => ['in_queue', 'processing', 'ready_for_pickup', 'ready'].includes(r.status));
  const displayReservations = activeReservations.slice(0, 4);

  return (
    <div className="col-span-12 lg:col-span-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <CalendarClock size={18} className="text-violet-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Đặt chỗ</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{activeReservations.length} đang chờ xử lý</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/reservations')}
            className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer border-0 bg-transparent"
          >
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : displayReservations.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Chưa có đặt chỗ"
            description="Đặt chỗ sách từ danh mục để nhận tại quầy thủ thư."
            actionLabel="Tìm sách"
            onAction={() => navigate('/user/catalog')}
          />
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {displayReservations.map((res) => {
              const config = getStatusConfig(RESERVATION_STATUS, res.status);
              const bookTitle = res.book?.title || 'Unknown';

              return (
                <div
                  key={res.id}
                  className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  onClick={() => navigate(`/user/books/${res.bookId}`)}
                >
                  <div className="flex items-start gap-3">
                    <BookCover
                      title={bookTitle}
                      coverImage={res.book?.coverImage}
                      coverColor={res.book?.coverColor}
                      className="w-10 h-14 rounded-lg"
                      textClassName="text-[9px]"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">{bookTitle}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge config={config} size="sm" />
                        {res.queuePosition > 0 && (
                          <span className="text-[10px] text-slate-400">#{res.queuePosition} trong hàng đợi</span>
                        )}
                        {(res.status === 'ready_for_pickup' || res.status === 'ready') && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-600">
                            <MapPin size={10} /> Nhận tại quầy
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationStatus;
