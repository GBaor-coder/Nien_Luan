import React from 'react';
import { BookOpen, RotateCcw, ArrowRight } from 'lucide-react';
import Spinner from '../ui/Spinner';
import { useNavigate } from 'react-router-dom';
import type { BorrowRecord } from '../../services/student.service';
import BookCover from '../ui/BookCover';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { BORROW_STATUS, getStatusConfig } from '../../data/statusConfig';

interface CurrentBorrowingsProps {
  borrowings: BorrowRecord[];
  loading: boolean;
  onRenew?: (record: BorrowRecord) => void;
  renewingId?: string | null;
}

const CurrentBorrowings: React.FC<CurrentBorrowingsProps> = ({ borrowings, loading, onRenew, renewingId }) => {
  const navigate = useNavigate();

  const getRemainingDays = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const displayBorrowings = borrowings.slice(0, 5);

  return (
    <div className="col-span-12 lg:col-span-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Phiếu mượn hiện tại</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{borrowings.length} cuốn đang mượn</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/borrowings')}
            className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer border-0 bg-transparent"
          >
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : displayBorrowings.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Chưa có phiếu mượn"
            description="Khám phá danh mục sách và đặt mượn cuốn đầu tiên nhé!"
            actionLabel="Tìm sách"
            onAction={() => navigate('/user/catalog')}
          />
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {displayBorrowings.map((record) => {
              const remainingDays = getRemainingDays(record.dueDate);
              const status = record.status === 'active' && remainingDays <= 3 ? 'due_soon' : record.status;
              const config = getStatusConfig(BORROW_STATUS, status);
              const dueDate = new Date(record.dueDate);
              const bookTitle = record.book?.title || 'Unknown';

              return (
                <div
                  key={record.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
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
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">{record.book?.author?.name || ''}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hạn trả: {dueDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[12px] font-bold ${record.status === 'overdue' ? 'bg-red-50 text-red-600' : remainingDays <= 3 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                      {record.status === 'overdue' ? `Quá hạn ${Math.abs(remainingDays)} ngày` : `Còn ${remainingDays} ngày`}
                    </span>

                    {record.status === 'active' && record.renewalCount < record.maxRenewals && onRenew && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRenew(record); }}
                        disabled={renewingId === record.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 text-[12px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer border-0 disabled:opacity-50"
                        title="Gia hạn sách"
                      >
                        {renewingId === record.id ? <Spinner size="xs" /> : <RotateCcw size={14} />}
                        Gia hạn
                      </button>
                    )}
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

export default CurrentBorrowings;
