import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { booksService, type Book } from '../services/books.service';
import { categoriesService, type Category } from '../services/categories.service';
import { authorsService, type Author } from '../services/authors.service';
import { publishersService, type Publisher } from '../services/publishers.service';
import { uploadService } from '../services/upload.service';
import BookCover from '../components/ui/BookCover';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import StatusBadge from '../components/admin/StatusBadge';
import Modal from '../components/admin/Modal';
import Toast from '../components/admin/Toast';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { getErrorMessage } from '../utils/error';

const ROWS_PER_PAGE = 8;

const CatalogPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'title' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState({
    title: '',
    authorId: '',
    isbn: '',
    categoryId: '',
    publisherId: '',
    year: '',
    pages: '',
    language: '',
    price: '',
    location: '',
    description: '',
    edition: '',
    coverColor: '#2563EB',
    quantity: 1,
    available: 1,
  });
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; book: Book | null }>({ isOpen: false, book: null });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await booksService.getAll({
        page, limit: ROWS_PER_PAGE, search: search || undefined,
        sort: sortKey, order: sortDir,
      });
      setBooks(res.data.data.books);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotal(res.data.data.pagination.total);
    } catch { setError(true); } finally { setLoading(false); }
  }, [page, search, sortKey, sortDir]);

  const fetchMeta = useCallback(async () => {
    try {
      const [catRes, authorRes, publisherRes] = await Promise.all([
        categoriesService.getAllSimple(),
        authorsService.getAll({ limit: 100 }),
        publishersService.getAll({ limit: 100 }),
      ]);
      setCategories(catRes.data.data);
      setAuthors(authorRes.data.data.authors);
      setPublishers(publisherRes.data.data.publishers);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBooks(), 0);
    return () => clearTimeout(timer);
  }, [fetchBooks]);
  useEffect(() => {
    const timer = setTimeout(() => fetchMeta(), 0);
    return () => clearTimeout(timer);
  }, [fetchMeta]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const openAdd = () => {
    setEditingBook(null);
    setForm({ title: '', authorId: '', isbn: '', categoryId: '', publisherId: '', year: '', pages: '', language: '', price: '', location: '', description: '', edition: '', coverColor: '#2563EB', quantity: 1, available: 1 });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (b: Book) => {
    setEditingBook(b);
    setForm({
      title: b.title,
      authorId: b.authorId || '',
      isbn: b.isbn || '',
      categoryId: b.categoryId || '',
      publisherId: b.publisherId || '',
      year: b.year != null ? String(b.year) : '',
      pages: b.pages != null ? String(b.pages) : '',
      language: b.language || '',
      price: b.price != null ? String(b.price) : '',
      location: b.location || '',
      description: b.description || '',
      edition: b.edition || '',
      coverColor: b.coverColor || '#2563EB',
      quantity: b.quantity,
      available: b.available,
    });
    setImageFile(null);
    setImagePreview(b.coverImage || null);
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setToast({ message: 'Vui lòng điền đầy đủ các trường bắt buộc', type: 'error' });
      return;
    }

    try {
      let coverImage = editingBook?.coverImage || '';

      // Upload image if selected
      if (imageFile) {
        const uploadRes = await uploadService.uploadBookCover(imageFile);
        coverImage = uploadRes.data.data.url;
      } else if (imagePreview === null && editingBook) {
        coverImage = '';
      }

      if (editingBook) {
        await booksService.update(editingBook.id, {
          title: form.title, authorId: form.authorId || undefined, isbn: form.isbn || undefined,
          categoryId: form.categoryId || undefined, publisherId: form.publisherId || undefined,
          year: form.year ? +form.year : undefined, pages: form.pages ? +form.pages : undefined,
          language: form.language || undefined, price: form.price !== '' ? +form.price : undefined,
          location: form.location || undefined, description: form.description || undefined,
          edition: form.edition || undefined, coverColor: form.coverColor || undefined,
          quantity: form.quantity, available: form.available,
          coverImage: coverImage || undefined,
        });
        setToast({ message: 'Cập nhật sách thành công', type: 'success' });
      } else {
        await booksService.create({
          title: form.title, authorId: form.authorId || undefined, isbn: form.isbn || undefined,
          categoryId: form.categoryId || undefined, publisherId: form.publisherId || undefined,
          year: form.year ? +form.year : undefined, pages: form.pages ? +form.pages : undefined,
          language: form.language || undefined, price: form.price !== '' ? +form.price : undefined,
          location: form.location || undefined, description: form.description || undefined,
          edition: form.edition || undefined, coverColor: form.coverColor || undefined,
          quantity: form.quantity, available: form.available,
          coverImage: coverImage || undefined,
        });
        setToast({ message: 'Thêm sách thành công', type: 'success' });
      }
      setModalOpen(false);
      fetchBooks();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (confirmDialog.book) {
      try {
        await booksService.remove(confirmDialog.book.id);
        setToast({ message: 'Xóa sách thành công', type: 'success' });
        setConfirmDialog({ isOpen: false, book: null });
        fetchBooks();
      } catch (err) {
        setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '40px', padding: '0 12px', fontSize: '14px',
    border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none',
    backgroundColor: 'transparent', color: 'inherit',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };
  const textareaStyle: React.CSSProperties = {
    width: '100%', minHeight: '80px', padding: '10px 12px', fontSize: '14px',
    border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none',
    backgroundColor: 'transparent', color: 'inherit', resize: 'vertical', fontFamily: 'inherit',
  };

  return (
    <div>
      <PageHeader
        title="Kho sách"
        subtitle="Quản lý tất cả sách trong bộ sưu tập thư viện."
        action={
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
            <Plus size={16} /> Thêm Sách
          </button>
        }
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th onClick={() => handleSort('title')} className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400 cursor-pointer hover:text-slate-500 transition-colors select-none">
                  <span className="inline-flex items-center gap-1">Tiêu đề<ArrowUpDown size={12} /></span>
                </th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Tác giả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thể loại</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">ISBN</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">SL</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Còn</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <BookCover
                        title={b.title}
                        coverImage={b.coverImage}
                        coverColor={b.coverColor}
                        showTitle={false}
                        className="w-10 h-14 rounded-lg shadow-sm"
                      />
                      <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">{b.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{b.author?.name || '-'}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{b.category?.name || '-'}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300 font-mono">{b.isbn || '-'}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{b.quantity}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{b.available}</td>
                  <td className="px-5 py-3"><StatusBadge status={b.status === 'unavailable' ? 'out_of_stock' : b.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(b)} title="Chỉnh sửa" className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer border-0 bg-transparent">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => setConfirmDialog({ isOpen: true, book: b })} title="Xóa" className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer border-0 bg-transparent">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-8"><div className="flex items-center justify-center gap-2"><Spinner size="sm" /><span className="text-[13px] text-slate-400">Đang tải...</span></div></td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="px-5 py-8"><ErrorState compact onRetry={fetchBooks} /></td></tr>
              ) : books.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[13px] text-slate-400">Không tìm thấy sách</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-[13px] text-slate-500">
            Trang {page} / {totalPages} ({total} tổng)
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 bg-transparent">
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-0 ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 bg-transparent">
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingBook ? 'Sửa Sách' : 'Thêm Sách Mới'}>
        <div className="flex flex-col gap-4">
          {/* Image Upload */}
          <div>
            <label style={labelStyle}>Ảnh bìa</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-24 h-32 rounded-lg object-cover border border-slate-200" />
                <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer border-0" title="Xóa ảnh">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-24 h-32 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#2563EB] transition-colors">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[10px] text-slate-400">Tải lên</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div>
            <label style={labelStyle}>Tiêu đề <span className="text-red-500">*</span></label>
            <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tên sách" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Tác giả</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.authorId} onChange={(e) => setForm({ ...form, authorId: e.target.value })}>
                <option value="">Chọn tác giả...</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Thể loại</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Chọn thể loại...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Nhà xuất bản</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.publisherId} onChange={(e) => setForm({ ...form, publisherId: e.target.value })}>
                <option value="">Chọn nhà xuất bản...</option>
                {publishers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>ISBN</label>
              <input style={{ ...inputStyle, backgroundColor: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }} value={form.isbn} disabled placeholder="Tự động sinh khi lưu" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Năm xuất bản</label>
              <input style={inputStyle} type="number" min={1000} max={9999} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="VD: 2020" />
            </div>
            <div>
              <label style={labelStyle}>Số trang</label>
              <input style={inputStyle} type="number" min={1} value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} placeholder="VD: 320" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Ngôn ngữ</label>
              <input style={inputStyle} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="VD: Tiếng Việt" />
            </div>
            <div>
              <label style={labelStyle}>Giá (VNĐ)</label>
              <input style={inputStyle} type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="VD: 120000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Vị trí kệ</label>
              <input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="VD: A1-03" />
            </div>
            <div>
              <label style={labelStyle}>Lần xuất bản</label>
              <input style={inputStyle} value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} placeholder="VD: Tái bản lần 2" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Mô tả</label>
            <textarea style={textareaStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn về cuốn sách..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Số lượng</label>
              <input style={inputStyle} type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Còn lại</label>
              <input style={inputStyle} type="number" min={0} max={form.quantity} value={form.available} onChange={(e) => setForm({ ...form, available: +e.target.value })} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Màu bìa</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.coverColor} onChange={(e) => setForm({ ...form, coverColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-slate-200 bg-transparent p-0" />
              <BookCover title={form.title || 'Tiêu đề sách'} coverColor={form.coverColor} showTitle={true} className="w-14 h-20 text-[9px]" textClassName="text-[9px]" />
              <span className="text-[13px] text-slate-500 font-mono">{form.coverColor}</span>
            </div>
          </div>
          <button onClick={handleSave}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            {editingBook ? 'Lưu thay đổi' : 'Thêm Sách'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, book: null })}
        onConfirm={confirmDelete}
        title="Xóa Sách"
        message={`Bạn có chắc chắn muốn xóa "${confirmDialog.book?.title}"? Hành động này không thể hoàn tác.`}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CatalogPage;
