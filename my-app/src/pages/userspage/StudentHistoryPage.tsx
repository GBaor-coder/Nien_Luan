import React, { useState, useEffect, useCallback } from 'react';
import { Search, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { studentService, type BorrowRecord } from '../../services/student.service';
import BookCover from '../../components/ui/BookCover';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

const ROWS_PER_PAGE = 10;

const StudentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.student?.id || '';
  const teacherId = user?.teacher?.id || '';
  const readerId = user?.id || '';
  const hasReaderProfile = !!studentId || !!teacherId;
  const [history, setHistory] = useState<BorrowRecord[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  const fetchHistory = useCallback(async (page = 1) => {
    if (!hasReaderProfile) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const res = await studentService.getMyBorrowings(readerId, { page, limit: ROWS_PER_PAGE, status: 'returned', search: search || undefined, studentId: studentId || undefined, teacherId: teacherId || undefined });
      setHistory(res.data.data.records);
      setPagination({
        total: res.data.data.pagination.total,
        page: res.data.data.pagination.page,
        totalPages: res.data.data.pagination.totalPages,
      });
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [hasReaderProfile, readerId, studentId, teacherId, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchHistory(1), 300);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  const readDays = (record: BorrowRecord) => {
    if (!record.returnDate) return null;
    const diff = new Date(record.returnDate).getTime() - new Date(record.borrowDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">Lịch sử đọc sách</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">Lịch sử mượn và trả sách đầy đủ của bạn</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full lg:w-72">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên sách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-0 outline-none text-[13px] text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Đang tải lịch sử đọc sách..." minHeight={320} />
      ) : error ? (
        <ErrorState
          title="Không thể tải lịch sử đọc sách"
          description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại."
          onRetry={() => fetchHistory(pagination.page)}
        />
      ) : history.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Chưa có lịch sử mượn sách"
          description={search ? 'Không tìm thấy kết quả phù hợp.' : 'Sách bạn đã mượn và trả sẽ xuất hiện tại đây.'}
          actionLabel="Tìm sách"
          onAction={() => navigate('/user/catalog')}
        />
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {history.map((record) => {
                const bookTitle = record.book?.title || 'Unknown';
                const days = readDays(record);

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
                      className="w-12 h-16 rounded-lg"
                      textClassName="text-[9px]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 truncate">{bookTitle}</h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">{record.book?.author?.name || ''}</p>
                    </div>
                    <div className="hidden md:block text-right flex-shrink-0">
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">
                        {new Date(record.borrowDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' — '}
                        {record.returnDate ? new Date(record.returnDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'chưa trả'}
                      </p>
                    </div>
                    {days !== null && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[12px] font-semibold text-slate-500 dark:text-slate-300 flex-shrink-0">
                        <BookOpen size={13} /> {days} ngày
                      </span>
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
                onPageChange={(p) => fetchHistory(p)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentHistoryPage;
