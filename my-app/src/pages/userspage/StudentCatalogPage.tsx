import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, BookOpen } from 'lucide-react';
import { booksService, type Book } from '../../services/books.service';
import { categoriesService, type Category } from '../../services/categories.service';
import BookCover from '../../components/ui/BookCover';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { BOOK_STATUS, getStatusConfig } from '../../data/statusConfig';
import Select from '../../components/ui/Select';

const ROWS_PER_PAGE = 12;

const StudentCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [sortKey, setSortKey] = useState<'title' | 'createdAt'>('title');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [prevFilters, setPrevFilters] = useState({
    search,
    categoryId,
    status,
    sortKey,
    order,
  });

  if (
    prevFilters.search !== search ||
    prevFilters.categoryId !== categoryId ||
    prevFilters.status !== status ||
    prevFilters.sortKey !== sortKey ||
    prevFilters.order !== order
  ) {
    setPrevFilters({ search, categoryId, status, sortKey, order });
    setPage(1);
  }

  useEffect(() => {
    categoriesService.getAllSimple()
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await booksService.getAll({
        page,
        limit: ROWS_PER_PAGE,
        search: search || undefined,
        categoryId: categoryId || undefined,
        status: status || undefined,
        sort: sortKey,
        order,
      });
      setBooks(res.data.data.books);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotal(res.data.data.pagination.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, status, sortKey, order]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBooks(), 0);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      if (searchInput.trim()) {
        setSearchParams({ search: searchInput.trim() }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  const bookStatus = (b: Book) => {
    if (b.available <= 0) return 'out_of_stock';
    if (b.available < (b.quantity || 1) * 0.3) return 'limited';
    return 'available';
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
    setCategoryId('');
    setStatus('');
    setSortKey('title');
    setOrder('asc');
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">Tìm & mượn sách</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">Tìm kiếm sách trong thư viện và đặt chỗ ngay tại quầy</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tên sách, tác giả, ISBN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent border-0 outline-none text-[13px] text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={categoryId}
              onChange={setCategoryId}
              options={[
                { value: '', label: 'Tất cả thể loại' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <Select
              value={status}
              onChange={setStatus}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'available', label: 'Có sẵn' },
                { value: 'limited', label: 'Sắp hết' },
                { value: 'out_of_stock', label: 'Hết sách' },
              ]}
            />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <Select
                value={`${sortKey}:${order}`}
                onChange={(value) => {
                  const [k, o] = value.split(':') as ['title' | 'createdAt', 'asc' | 'desc'];
                  setSortKey(k);
                  setOrder(o);
                }}
                options={[
                  { value: 'title:asc', label: 'Tên A → Z' },
                  { value: 'title:desc', label: 'Tên Z → A' },
                  { value: 'createdAt:desc', label: 'Mới nhất' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingState label="Đang tải danh mục sách..." minHeight={320} />
      ) : error ? (
        <ErrorState
          title="Không thể tải danh mục sách"
          description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại."
          onRetry={fetchBooks}
        />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Không tìm thấy sách phù hợp"
          description="Thử thay đổi từ khóa hoặc bộ lọc để tìm được sách bạn cần."
          actionLabel="Xóa bộ lọc"
          onAction={handleClear}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-5">
            {books.map((book) => {
              const st = bookStatus(book);
              const config = getStatusConfig(BOOK_STATUS, st);
              return (
                <div
                  key={book.id}
                  onClick={() => navigate(`/user/books/${book.id}`)}
                  className="group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative">
                    <BookCover
                      title={book.title}
                      coverImage={book.coverImage}
                      coverColor={book.coverColor}
                      className="w-full aspect-[3/4] rounded-xl mb-3 shadow-sm group-hover:shadow-md transition-shadow"
                      textClassName="text-[12px]"
                    />
                    <div className="absolute top-2 right-2">
                      <StatusBadge config={config} />
                    </div>
                  </div>
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
                        <span className="text-[10px] text-slate-400 truncate">{book.category.name}</span>
                      </>
                    )}
                  </div>
                  {book.available > 0 && (
                    <p className="text-[10px] text-green-600 mt-0.5">Còn {book.available} bản</p>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default StudentCatalogPage;
