import React, { useState, useEffect, useCallback } from 'react';
import { Star, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { booksService, type Book } from '../../services/books.service';
import BookCover from '../ui/BookCover';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import ErrorState from '../ui/ErrorState';

const RecommendedBooks: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBooks = useCallback(() => {
    setLoading(true);
    setError(false);
    booksService.getAll({ limit: 6, sort: 'createdAt', order: 'desc' })
      .then((res) => {
        setBooks(res.data.data.books);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 0);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  return (
    <div className="col-span-12 lg:col-span-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Sách mới về</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">Khám phá thư viện</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/catalog')}
            className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer border-0 bg-transparent"
          >
            Tìm & mượn sách <ArrowRight size={14} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : error ? (
            <ErrorState compact title="Không tải được sách mới" onRetry={fetchBooks} />
          ) : books.length === 0 ? (
            <EmptyState icon={Sparkles} title="Chưa có sách mới" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-6 gap-5">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  onClick={() => navigate(`/user/books/${book.id}`)}
                >
                  <BookCover
                    title={book.title}
                    coverImage={book.coverImage}
                    coverColor={book.coverColor}
                    className="w-full aspect-[3/4] rounded-xl mb-3"
                    textClassName="text-[11px]"
                  />
                  <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{book.author?.name || ''}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {book.avgRating ? (
                      <div className="flex items-center gap-0.5">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-medium text-slate-900 dark:text-slate-100">{Number(book.avgRating).toFixed(1)}</span>
                      </div>
                    ) : null}
                    {book.category?.name && (
                      <>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] text-slate-400">{book.category.name}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendedBooks;
