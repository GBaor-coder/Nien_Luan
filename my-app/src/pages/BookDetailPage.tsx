import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Book as BookIcon, Package, Clock, Search, Upload, X } from 'lucide-react';
import { booksService, type Book } from '../services/books.service';
import { authorsService, type Author } from '../services/authors.service';
import { categoriesService, type Category } from '../services/categories.service';
import { publishersService, type Publisher } from '../services/publishers.service';
import { uploadService } from '../services/upload.service';
import { bookCopiesData, bookHistoryData, type BookCopy, type BookHistory } from '../data/mockData';
import BookCover from '../components/ui/BookCover';
import StatusBadge from '../components/admin/StatusBadge';
import PageHeader from '../components/admin/PageHeader';
import Modal from '../components/admin/Modal';
import Toast from '../components/admin/Toast';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import { getErrorMessage } from '../utils/error';

const ROWS_PER_PAGE = 8;

interface BookForm {
  title: string; authorId: string; isbn: string; categoryId: string;
  quantity: number; available: number; publisherId: string; year: number;
  pages: number; language: string; price: number; location: string;
  description: string; coverImage: string; edition: string;
}

const defaultBookForm: BookForm = {
  title: '', authorId: '', isbn: '', categoryId: '',
  quantity: 1, available: 1, publisherId: '', year: new Date().getFullYear(),
  pages: 0, language: 'English', price: 0, location: '',
  description: '', coverImage: '', edition: '1st',
};

const BookDetailPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'copies' | 'history'>('info');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab2, setActiveTab2] = useState<'basic' | 'details'>('basic');

  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await booksService.getAll({ search: search || undefined, limit: 50 });
      setBooks(res.data.data.books);
    } catch { /* ignore */ }
  }, [search]);

  const fetchMeta = useCallback(async () => {
    try {
      const [authorRes, catRes, publisherRes] = await Promise.all([
        authorsService.getAll({ limit: 100 }),
        categoriesService.getAllSimple(),
        publishersService.getAll({ limit: 100 }),
      ]);
      setAuthors(authorRes.data.data.authors);
      setCategories(catRes.data.data);
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

  // Book CRUD state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState<BookForm>(defaultBookForm);
  const [confirmBookDelete, setConfirmBookDelete] = useState<{ isOpen: boolean; book: Book | null }>({ isOpen: false, book: null });

  // Copies state
  const [copies, setCopies] = useState<BookCopy[]>(bookCopiesData);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [copyForm, setCopyForm] = useState({ barcode: '', condition: 'good' as BookCopy['condition'], shelfLocation: '', notes: '' });
  const [confirmCopyDelete, setConfirmCopyDelete] = useState<{ isOpen: boolean; copy: BookCopy | null }>({ isOpen: false, copy: null });

  // History state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyForm, setHistoryForm] = useState({ readerName: '', action: 'borrow' as BookHistory['action'], notes: '' });

  const filteredBooks = useMemo(() => {
    let data = [...books];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((b) => b.title.toLowerCase().includes(q) || (b.author?.name || '').toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
    }
    return data;
  }, [books, search]);

  const totalPages = Math.ceil(filteredBooks.length / ROWS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const selectedCopies = useMemo(() => copies.filter((c) => c.bookId === selectedBook?.id), [copies, selectedBook]);
  const selectedHistory = useMemo(() => bookHistoryData.filter((h) => h.bookId === selectedBook?.id), [selectedBook]);

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '40px', padding: '0 12px', fontSize: '14px',
    border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none',
    backgroundColor: 'transparent', color: 'inherit',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };
  const tabStyle = (active: boolean) => `flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors cursor-pointer border-0 ${active ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`;
  const formTabStyle = (active: boolean) => `px-4 py-2 text-[13px] font-medium rounded-lg transition-colors cursor-pointer border-0 ${active ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`;

  const conditionColor = (c: string) => {
    const colors: Record<string, string> = { new: '#22C55E', good: '#2563EB', worn: '#F59E0B', damaged: '#EF4444' };
    return colors[c] || '#64748B';
  };

  const copyStatusColor = (s: string) => {
    const colors: Record<string, string> = { available: '#22C55E', borrowed: '#F59E0B', reserved: '#8B5CF6', maintenance: '#EF4444' };
    return colors[s] || '#64748B';
  };

  const actionIcon = (a: string) => {
    const icons: Record<string, string> = { borrow: '📤', return: '📥', renew: '🔄', reserve: '📋' };
    return icons[a] || '📋';
  };

  // Book CRUD
  const openAddBook = () => {
    setEditingBook(null);
    setBookForm(defaultBookForm);
    setActiveTab2('basic');
    setBookModalOpen(true);
  };

  const openEditBook = (b: Book) => {
    setEditingBook(b);
    setBookForm({
      title: b.title, authorId: b.authorId || '', isbn: b.isbn || '', categoryId: b.categoryId || '',
      quantity: b.quantity, available: b.available, publisherId: b.publisherId || '', year: b.year || new Date().getFullYear(),
      pages: b.pages || 0, language: b.language || 'English', price: b.price || 0, location: b.location || '',
      description: b.description || '', coverImage: b.coverImage || '', edition: b.edition || '1st',
    });
    setActiveTab2('basic');
    setBookModalOpen(true);
  };

  const handleSaveBook = async () => {
    if (!bookForm.title.trim()) {
      setToast({ message: 'Vui lòng điền đầy đủ các trường bắt buộc', type: 'error' });
      return;
    }

    try {
      if (editingBook) {
        await booksService.update(editingBook.id, {
          title: bookForm.title, authorId: bookForm.authorId || undefined,
          isbn: bookForm.isbn || undefined, categoryId: bookForm.categoryId || undefined,
          publisherId: bookForm.publisherId || undefined,
          quantity: bookForm.quantity, available: bookForm.available,
          year: bookForm.year || undefined, pages: bookForm.pages || undefined,
          language: bookForm.language || undefined, price: bookForm.price || undefined,
          location: bookForm.location || undefined, description: bookForm.description || undefined,
          coverImage: bookForm.coverImage || undefined, edition: bookForm.edition || undefined,
        });
        setToast({ message: 'Cập nhật sách thành công', type: 'success' });
      } else {
        const res = await booksService.create({
          title: bookForm.title, authorId: bookForm.authorId || undefined,
          isbn: bookForm.isbn || undefined, categoryId: bookForm.categoryId || undefined,
          publisherId: bookForm.publisherId || undefined,
          quantity: bookForm.quantity, available: bookForm.available,
          year: bookForm.year || undefined, pages: bookForm.pages || undefined,
          language: bookForm.language || undefined, price: bookForm.price || undefined,
          location: bookForm.location || undefined, description: bookForm.description || undefined,
          coverImage: bookForm.coverImage || undefined, edition: bookForm.edition || undefined,
        });
        setSelectedBook(res.data.data);
        setToast({ message: 'Thêm sách thành công', type: 'success' });
      }
      setBookModalOpen(false);
      fetchBooks();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    }
  };

  const handleDeleteBook = async () => {
    if (confirmBookDelete.book) {
      try {
        await booksService.remove(confirmBookDelete.book.id);
        if (selectedBook?.id === confirmBookDelete.book.id) setSelectedBook(null);
        setToast({ message: 'Xóa sách thành công', type: 'success' });
        fetchBooks();
      } catch (err) {
        setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
      }
    }
  };

  const updateBookForm = (field: keyof BookForm, value: string | number) => {
    setBookForm((prev) => ({ ...prev, [field]: value }));
  };

  // Copy CRUD
  const openAddCopy = () => {
    setEditingCopy(null);
    setCopyForm({ barcode: '', condition: 'good', shelfLocation: '', notes: '' });
    setCopyModalOpen(true);
  };

  const openEditCopy = (c: BookCopy) => {
    setEditingCopy(c);
    setCopyForm({ barcode: c.barcode, condition: c.condition, shelfLocation: c.shelfLocation, notes: c.notes });
    setCopyModalOpen(true);
  };

  const handleSaveCopy = () => {
    if (!copyForm.barcode.trim() || !copyForm.shelfLocation.trim()) {
      setToast({ message: 'Vui lòng điền mã vạch và vị trí kệ', type: 'error' });
      return;
    }

    if (editingCopy) {
      setCopies((prev) => prev.map((c) => c.id === editingCopy.id ? { ...c, ...copyForm } : c));
      setToast({ message: 'Cập nhật bản sao thành công', type: 'success' });
    } else if (selectedBook) {
      const newCopy: BookCopy = {
        id: `CP-${String(copies.length + 1).padStart(3, '0')}`,
        bookId: selectedBook.id,
        ...copyForm,
        status: 'available',
        acquiredDate: new Date().toISOString().split('T')[0],
      };
      setCopies((prev) => [...prev, newCopy]);
      setToast({ message: 'Thêm bản sao thành công', type: 'success' });
    }
    setCopyModalOpen(false);
  };

  const handleDeleteCopy = () => {
    if (confirmCopyDelete.copy) {
      setCopies((prev) => prev.filter((c) => c.id !== confirmCopyDelete.copy!.id));
      setToast({ message: 'Xóa bản sao thành công', type: 'success' });
    }
  };

  // History
  const openAddHistory = () => {
    setHistoryForm({ readerName: '', action: 'borrow', notes: '' });
    setHistoryModalOpen(true);
  };

  const handleSaveHistory = () => {
    if (!historyForm.readerName.trim()) {
      setToast({ message: 'Vui lòng nhập tên độc giả', type: 'error' });
      return;
    }

    if (selectedBook) {
      const newHistory: BookHistory = {
        id: `BH-${String(bookHistoryData.length + 1).padStart(3, '0')}`,
        bookId: selectedBook.id,
        ...historyForm,
        date: new Date().toISOString().split('T')[0],
      };
      bookHistoryData.push(newHistory);
      setToast({ message: 'Đã thêm phiếu lịch sử', type: 'success' });
    }
    setHistoryModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Quản lý Chi tiết Sách"
        subtitle="Quản lý thông tin chi tiết, bản sao và lịch sử cho từng cuốn sách."
        action={
          <button onClick={openAddBook} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
            <Plus size={16} /> Thêm Sách
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Tìm kiếm sách..."
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {paginatedBooks.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBook(b); setActiveTab('info'); }}
                  className={`w-full p-3.5 text-left border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border-x-0 border-t-0 ${selectedBook?.id === b.id ? 'bg-blue-50/70 dark:bg-blue-500/10 border-l-2 border-l-blue-600' : 'bg-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <BookCover
                      title={b.title}
                      coverImage={b.coverImage}
                      coverColor={b.coverColor}
                      showTitle={false}
                      className="w-9 h-12 rounded-lg shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">{b.title}</p>
                      <p className="text-[11px] text-slate-400">{b.author?.name || '-'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer border-0 bg-transparent">
                <ChevronLeft size={14} className="text-slate-500" />
              </button>
              <span className="text-[11px] text-slate-500">{page}/{totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer border-0 bg-transparent">
                <ChevronRight size={14} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedBook ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {/* Book Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-5">
                  <BookCover
                    title={selectedBook.title}
                    subtitle={selectedBook.author?.name}
                    coverImage={selectedBook.coverImage}
                    coverColor={selectedBook.coverColor}
                    className="w-24 h-32 rounded-xl shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-[18px] font-bold text-slate-900 dark:text-slate-100 mb-1">{selectedBook.title}</h3>
                    <p className="text-[14px] text-slate-500 mb-3">by {selectedBook.author?.name || '-'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={selectedBook.status === 'unavailable' ? 'out_of_stock' : selectedBook.status} />
                      <span className="text-[12px] text-slate-400">{selectedCopies.length} bản sao</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditBook(selectedBook)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer border-0 bg-transparent" title="Sửa Sách">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setConfirmBookDelete({ isOpen: true, book: selectedBook })} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer border-0 bg-transparent" title="Xóa Sách">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setActiveTab('info')} className={tabStyle(activeTab === 'info')}>
                  <BookIcon size={14} /> Thông tin
                </button>
                <button onClick={() => setActiveTab('copies')} className={tabStyle(activeTab === 'copies')}>
                  <Package size={14} /> Bản sao ({selectedCopies.length})
                </button>
                <button onClick={() => setActiveTab('history')} className={tabStyle(activeTab === 'history')}>
                  <Clock size={14} /> Lịch sử ({selectedHistory.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5">
                {activeTab === 'info' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'ISBN', value: selectedBook.isbn || '-' },
                      { label: 'Thể loại', value: selectedBook.category?.name || '-' },
                      { label: 'Nhà xuất bản', value: selectedBook.publisher?.name || '-' },
                      { label: 'Ấn bản', value: selectedBook.edition || '-' },
                      { label: 'Năm', value: selectedBook.year ? String(selectedBook.year) : '-' },
                      { label: 'Số trang', value: selectedBook.pages ? String(selectedBook.pages) : '-' },
                      { label: 'Ngôn ngữ', value: selectedBook.language || '-' },
                      { label: 'Giá', value: selectedBook.price != null ? `$${selectedBook.price.toFixed(2)}` : '-' },
                      { label: 'Vị trí', value: selectedBook.location || '-' },
                      { label: 'Số lượng', value: String(selectedBook.quantity) },
                      { label: 'Còn lại', value: String(selectedBook.available) },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <span className="text-[11px] font-medium text-slate-400 uppercase mb-1">{item.label}</span>
                        <span className="text-[14px] text-slate-900 dark:text-slate-100 font-medium">{item.value || '-'}</span>
                      </div>
                    ))}
                    {selectedBook.description && (
                      <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <span className="text-[11px] font-medium text-slate-400 uppercase mb-1 block">Mô tả</span>
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{selectedBook.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'copies' && (
                  <div>
                    <div className="flex justify-end mb-4">
                      <button onClick={openAddCopy} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
                        <Plus size={14} /> Thêm Bản sao
                      </button>
                    </div>

                    {selectedCopies.length === 0 ? (
                      <p className="text-center text-[13px] text-slate-400 py-8">Chưa có bản sao nào. Hãy thêm bản sao đầu tiên.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400">Mã vạch</th>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400">Tình trạng</th>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400">Kệ</th>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400">Trạng thái</th>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-400">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCopies.map((c) => (
                              <tr key={c.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0">
                                <td className="px-3 py-2.5 text-[12px] font-mono text-slate-900 dark:text-slate-100">{c.barcode}</td>
                                <td className="px-3 py-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize" style={{ backgroundColor: `${conditionColor(c.condition)}18`, color: conditionColor(c.condition) }}>
                                    {c.condition}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300">{c.shelfLocation}</td>
                                <td className="px-3 py-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize" style={{ backgroundColor: `${copyStatusColor(c.status)}18`, color: copyStatusColor(c.status) }}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => openEditCopy(c)} className="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer border-0 bg-transparent">
                                      <Edit3 size={12} className="text-blue-600" />
                                    </button>
                                    <button onClick={() => setConfirmCopyDelete({ isOpen: true, copy: c })} className="p-1 rounded hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent">
                                      <Trash2 size={12} className="text-red-500" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <div className="flex justify-end mb-4">
                      <button onClick={openAddHistory} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
                        <Plus size={14} /> Thêm Phiếu
                      </button>
                    </div>

                    {selectedHistory.length === 0 ? (
                      <p className="text-center text-[13px] text-slate-400 py-8">Chưa có lịch sử nào.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedHistory.map((h) => (
                          <div key={h.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <span className="text-[18px]">{actionIcon(h.action)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{h.readerName}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize bg-blue-50 text-blue-600">{h.action}</span>
                              </div>
                              <p className="text-[11px] text-slate-400">{h.date}</p>
                              {h.notes && <p className="text-[12px] text-slate-500 mt-1">{h.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <BookIcon size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-[14px] text-slate-400">Chọn một cuốn sách từ danh sách để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Book Modal */}
      <Modal isOpen={bookModalOpen} onClose={() => setBookModalOpen(false)} title={editingBook ? 'Sửa Sách' : 'Thêm Sách Mới'} width="600px">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab2('basic')} className={formTabStyle(activeTab2 === 'basic')}>Thông tin Cơ bản</button>
          <button onClick={() => setActiveTab2('details')} className={formTabStyle(activeTab2 === 'details')}>Chi tiết</button>
        </div>

        {activeTab2 === 'basic' && (
          <div className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Tiêu đề <span className="text-red-500">*</span></label>
              <input style={inputStyle} value={bookForm.title} onChange={(e) => updateBookForm('title', e.target.value)} placeholder="Tên sách" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Tác giả</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={bookForm.authorId} onChange={(e) => updateBookForm('authorId', e.target.value)}>
                  <option value="">Chọn tác giả...</option>
                  {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Thể loại</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={bookForm.categoryId} onChange={(e) => updateBookForm('categoryId', e.target.value)}>
                  <option value="">Chọn thể loại...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>ISBN</label>
                <input style={inputStyle} value={bookForm.isbn} onChange={(e) => updateBookForm('isbn', e.target.value)} placeholder="978-..." />
              </div>
              <div>
                <label style={labelStyle}>Số lượng</label>
                <input style={inputStyle} type="number" min={1} value={bookForm.quantity} onChange={(e) => updateBookForm('quantity', +e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Còn lại</label>
                <input style={inputStyle} type="number" min={0} max={bookForm.quantity} value={bookForm.available} onChange={(e) => updateBookForm('available', +e.target.value)} />
              </div>
              <div></div>
            </div>
          </div>
        )}

        {activeTab2 === 'details' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Nhà xuất bản</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={bookForm.publisherId} onChange={(e) => updateBookForm('publisherId', e.target.value)}>
                  <option value="">Chọn nhà xuất bản...</option>
                  {publishers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ấn bản</label>
                <input style={inputStyle} value={bookForm.edition} onChange={(e) => updateBookForm('edition', e.target.value)} placeholder="1st, 2nd, ..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Năm</label>
                <input style={inputStyle} type="number" min={1900} max={new Date().getFullYear()} value={bookForm.year} onChange={(e) => updateBookForm('year', +e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Số trang</label>
                <input style={inputStyle} type="number" min={0} value={bookForm.pages} onChange={(e) => updateBookForm('pages', +e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Ngôn ngữ</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={bookForm.language} onChange={(e) => updateBookForm('language', e.target.value)}>
                  {['English', 'Vietnamese', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Other'].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Giá ($)</label>
                <input style={inputStyle} type="number" min={0} step={0.01} value={bookForm.price} onChange={(e) => updateBookForm('price', +e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Vị trí (Kệ)</label>
              <input style={inputStyle} value={bookForm.location} onChange={(e) => updateBookForm('location', e.target.value)} placeholder="A1-01, B2-03, ..." />
            </div>
            <div>
              <label style={labelStyle}>Ảnh bìa</label>
              {bookForm.coverImage ? (
                <div className="relative inline-block">
                  <img src={bookForm.coverImage} alt="Preview" className="w-24 h-32 rounded-lg object-cover border border-slate-200" />
                  <button onClick={() => updateBookForm('coverImage', '')} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer border-0" title="Xóa ảnh">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-24 h-32 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#2563EB] transition-colors">
                  <Upload size={20} className="text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-400">Tải lên</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const uploadRes = await uploadService.uploadBookCover(file);
                      updateBookForm('coverImage', uploadRes.data.data.url);
                    }
                  }} />
                </label>
              )}
            </div>
            <div>
              <label style={labelStyle}>Mô tả</label>
              <textarea style={{ ...inputStyle, height: '80px', padding: '10px 12px', resize: 'vertical' as const }} value={bookForm.description} onChange={(e) => updateBookForm('description', e.target.value)} placeholder="Mô tả sách..." />
            </div>
          </div>
        )}

        <button onClick={handleSaveBook}
          className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-4">
          {editingBook ? 'Lưu thay đổi' : 'Thêm Sách'}
        </button>
      </Modal>

      {/* Copy Modal */}
      <Modal isOpen={copyModalOpen} onClose={() => setCopyModalOpen(false)} title={editingCopy ? 'Sửa Bản sao' : 'Thêm Bản sao'}>
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Mã vạch <span className="text-red-500">*</span></label>
            <input style={inputStyle} value={copyForm.barcode} onChange={(e) => setCopyForm({ ...copyForm, barcode: e.target.value })} placeholder="978-...-01" />
          </div>
          <div>
            <label style={labelStyle}>Tình trạng</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={copyForm.condition} onChange={(e) => setCopyForm({ ...copyForm, condition: e.target.value as BookCopy['condition'] })}>
              {['new', 'good', 'worn', 'damaged'].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Vị trí kệ <span className="text-red-500">*</span></label>
            <input style={inputStyle} value={copyForm.shelfLocation} onChange={(e) => setCopyForm({ ...copyForm, shelfLocation: e.target.value })} placeholder="A1-01-01" />
          </div>
          <div>
            <label style={labelStyle}>Ghi chú</label>
            <textarea style={{ ...inputStyle, height: '60px', padding: '10px 12px', resize: 'vertical' as const }} value={copyForm.notes} onChange={(e) => setCopyForm({ ...copyForm, notes: e.target.value })} placeholder="Ghi chú về bản sao này..." />
          </div>
          <button onClick={handleSaveCopy}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            {editingCopy ? 'Lưu thay đổi' : 'Thêm Bản sao'}
          </button>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title="Thêm Phiếu Lịch sử">
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Tên Độc giả <span className="text-red-500">*</span></label>
            <input style={inputStyle} value={historyForm.readerName} onChange={(e) => setHistoryForm({ ...historyForm, readerName: e.target.value })} placeholder="Tên độc giả" />
          </div>
          <div>
            <label style={labelStyle}>Hành động</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={historyForm.action} onChange={(e) => setHistoryForm({ ...historyForm, action: e.target.value as BookHistory['action'] })}>
              {['borrow', 'return', 'renew', 'reserve'].map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ghi chú</label>
            <textarea style={{ ...inputStyle, height: '60px', padding: '10px 12px', resize: 'vertical' as const }} value={historyForm.notes} onChange={(e) => setHistoryForm({ ...historyForm, notes: e.target.value })} placeholder="Ghi chú tùy chọn..." />
          </div>
          <button onClick={handleSaveHistory}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            Thêm Phiếu
          </button>
        </div>
      </Modal>

      {/* Confirm Delete Book */}
      <ConfirmDialog
        isOpen={confirmBookDelete.isOpen}
        onClose={() => setConfirmBookDelete({ isOpen: false, book: null })}
        onConfirm={handleDeleteBook}
        title="Xóa Sách"
        message={`Bạn có chắc chắn muốn xóa "${confirmBookDelete.book?.title}"? Hành động này cũng sẽ xóa tất cả bản sao và lịch sử. Không thể hoàn tác.`}
      />

      {/* Confirm Delete Copy */}
      <ConfirmDialog
        isOpen={confirmCopyDelete.isOpen}
        onClose={() => setConfirmCopyDelete({ isOpen: false, copy: null })}
        onConfirm={handleDeleteCopy}
        title="Xóa Bản sao"
        message="Bạn có chắc chắn muốn xóa bản sao này? Hành động này không thể hoàn tác."
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BookDetailPage;