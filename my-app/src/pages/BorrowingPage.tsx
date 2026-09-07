import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, Eye, RefreshCw, AlertTriangle, Clock, BookOpen, User, Calendar, Tag, Hash, FileText } from 'lucide-react';
import { borrowingService, type BorrowRecord, type BorrowingStats, type BorrowingStatsDetailed } from '../services/borrowing.service';
import { readersService, type Reader } from '../services/readers.service';
import { booksService, type Book } from '../services/books.service';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import StatusBadge from '../components/admin/StatusBadge';
import Modal from '../components/admin/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/admin/Toast';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { getErrorMessage } from '../utils/error';

const ROWS_PER_PAGE = 8;

const BorrowingPage: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [overdueOpen, setOverdueOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [form, setForm] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return { readerId: '', bookId: '', borrowDate: '', dueDate: d.toISOString().split('T')[0], readerType: 'student', notes: '' };
  });
  const [stats, setStats] = useState<BorrowingStats>({ total: 0, active: 0, returned: 0, overdue: 0 });
  const [overdueStats, setOverdueStats] = useState<BorrowingStatsDetailed | null>(null);
  const [overdueRecords, setOverdueRecords] = useState<BorrowRecord[]>([]);
  const [overdueTotal, setOverdueTotal] = useState(0);
  const [overduePage, setOverduePage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await borrowingService.getAll({
        page, limit: ROWS_PER_PAGE, search: search || undefined,
        status: filter !== 'all' ? filter : undefined,
      });
      setRecords(res.data.data.records);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotal(res.data.data.pagination.total);
      setError(null);
    } catch {
      setError('Không thể tải danh sách phiếu mượn');
    } finally { setLoading(false); }
  }, [page, search, filter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await borrowingService.getStats();
      setStats(res.data.data);
    } catch { /* ignore */ }
  }, []);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [rRes, bRes] = await Promise.all([
        readersService.getAll({ limit: 100 }),
        booksService.getAll({ limit: 100 }),
      ]);
      setReaders(rRes.data.data.readers);
      setBooks(bRes.data.data.books);
    } catch { /* ignore */ }
  }, []);

  const fetchOverdueStats = useCallback(async () => {
    try {
      const res = await borrowingService.getStats();
      setOverdueStats(res.data.data);
    } catch { /* ignore */ }
  }, []);

  const fetchOverdueRecords = useCallback(async () => {
    try {
      const res = await borrowingService.getOverdueDetails({ page: overduePage, limit: ROWS_PER_PAGE, search });
      setOverdueRecords(res.data.data.records);
      setOverdueTotal(res.data.data.pagination.total);
      setOverduePage(res.data.data.pagination.page);
    } catch { /* ignore */ }
  }, [overduePage, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRecords(), 0);
    return () => clearTimeout(timer);
  }, [fetchRecords]);
  useEffect(() => {
    const timer = setTimeout(() => fetchStats(), 0);
    return () => clearTimeout(timer);
  }, [fetchStats]);
  useEffect(() => {
    const timer = setTimeout(() => fetchDropdowns(), 0);
    return () => clearTimeout(timer);
  }, [fetchDropdowns]);
  useEffect(() => {
    const timer = setTimeout(() => fetchOverdueStats(), 0);
    return () => clearTimeout(timer);
  }, [fetchOverdueStats]);
  useEffect(() => {
    if (overdueOpen) {
      const timer = setTimeout(() => fetchOverdueRecords(), 0);
      return () => clearTimeout(timer);
    }
  }, [overdueOpen, fetchOverdueRecords]);

  const handleCreate = async () => {
    if (!form.readerId || !form.bookId) {
      setToast({ message: 'Vui lòng điền đầy đủ các trường bắt buộc', type: 'error' });
      return;
    }
    const selectedReader = readers.find((r) => r.id === form.readerId);
    setActionLoading(true);
    try {
      await borrowingService.create({
        readerId: form.readerId,
        bookId: form.bookId,
        dueDate: form.dueDate || undefined,
        borrowDate: form.borrowDate || new Date().toISOString().split('T')[0],
        readerType: selectedReader?.readerType || form.readerType,
        notes: form.notes || undefined,
      });
      setToast({ message: 'Tạo phiếu mượn thành công', type: 'success' });
      setModalOpen(false);
      setForm({ readerId: '', bookId: '', borrowDate: '', dueDate: dueDateFor('student', ''), readerType: 'student', notes: '' });
      fetchRecords();
      fetchStats();
      fetchOverdueStats();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedRecord) return;
    setActionLoading(true);
    try {
      await borrowingService.returnBook(selectedRecord.id, 'Trả sách từ admin');
      setToast({ message: 'Trả sách thành công', type: 'success' });
      setReturnOpen(false);
      setSelectedRecord(null);
      fetchRecords();
      fetchStats();
      fetchOverdueStats();
      if (overdueOpen) fetchOverdueRecords();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác trả sách thất bại'), type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const openReturnModal = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setReturnOpen(true);
  };

  const openDetailModal = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const filterButtons = [
    { key: 'all', label: 'Tất cả', count: stats.total },
    { key: 'active', label: 'Đang mượn', count: stats.active },
    { key: 'returned', label: 'Đã trả', count: stats.returned },
    { key: 'overdue', label: 'Quá hạn', count: stats.overdue },
  ];

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };

  const dueDateFor = (type: string, borrowDate?: string) => {
    const d = borrowDate ? new Date(borrowDate) : new Date();
    d.setDate(d.getDate() + (type === 'teacher' ? 30 : 14));
    return d.toISOString().split('T')[0];
  };

  const getReaderName = (r: BorrowRecord) => {
    if (r.student?.user?.name) return r.student.user.name;
    if (r.teacher?.user?.name) return r.teacher.user.name;
    return r.readerId;
  };

  const getReaderTypeLabel = (r: BorrowRecord) => {
    if (r.student?.user?.name) return 'Sinh viên';
    if (r.teacher?.user?.name) return 'Giảng viên';
    return 'Khác';
  };

  const overdueByReaderType = overdueStats?.overdueByReaderType || [];
  const overdueByCategory = overdueStats?.overdueByCategory || {};
  const avgOverdueDays = overdueStats?.avgOverdueDays || 0;

  return (
    <div>
      <PageHeader title="Phiếu Mượn" subtitle="Theo dõi và quản lý tất cả hoạt động mượn sách."
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setOverdueOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F59E0B] text-white text-[13px] font-medium hover:bg-[#D97706] transition-colors cursor-pointer border-0">
              <AlertTriangle size={16} /> Quá hạn
            </button>
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
              <Plus size={16} /> Phiếu mới
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {filterButtons.map((f) => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className="p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer text-left bg-transparent"
            style={{ borderColor: filter === f.key ? '#2563EB' : '#E2E8F0' }}>
            <p className="text-[22px] font-bold text-slate-900 dark:text-slate-100">{f.count}</p>
            <p className="text-[12px] text-slate-500">{f.label}</p>
          </button>
        ))}
      </div>

      {stats.overdue > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-red-700 dark:text-red-300">{stats.overdue} phiếu quá hạn</p>
            <p className="text-[12px] text-red-600 dark:text-red-400/70">Trung bình quá hạn {avgOverdueDays} ngày</p>
          </div>
          <button onClick={() => setOverdueOpen(true)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium hover:bg-red-600 transition-colors cursor-pointer border-0">
            Xem chi tiết
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Tìm phiếu mượn..." /></div>
        <div className="overflow-x-auto">
          <table className="w-full mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Độc giả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Loại</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Sách</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Ngày mượn</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Hạn trả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{getReaderName(r)}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-500">{getReaderTypeLabel(r)}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{r.book?.title || '-'}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-500">{new Date(r.borrowDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-500">{new Date(r.dueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openDetailModal(r)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-0 bg-transparent" title="Xem chi tiết">
                        <Eye size={14} className="text-blue-600" />
                      </button>
                      {r.status === 'active' && (
                        <button onClick={() => openReturnModal(r)} className="px-2 py-1 rounded-lg bg-green-500 text-white text-[11px] font-medium hover:bg-[#16A34A] transition-colors cursor-pointer border-0">
                          Trả
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr><td colSpan={7} className="px-5 py-8 text-center"><div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="sm" /> <span className="text-[13px]">Đang tải...</span></div></td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={7} className="px-5 py-8"><ErrorState compact title={error} onRetry={fetchRecords} /></td></tr>
              )}
              {!loading && !error && records.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-slate-400">Không tìm thấy phiếu mượn</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-[13px] text-slate-500">Trang {page} / {totalPages} ({total} tổng)</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 bg-transparent"><ChevronLeft size={16} className="text-slate-500" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-0 ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{p}</button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 bg-transparent"><ChevronRight size={16} className="text-slate-500" /></button>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Phiếu Mượn Mới" width="560px">
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Loại độc giả</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.readerType} onChange={(e) => setForm({ ...form, readerType: e.target.value, dueDate: dueDateFor(e.target.value, form.borrowDate) })}>
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
            </select>
          </div>
          <div><label style={labelStyle}>Độc giả</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.readerId} onChange={(e) => setForm({ ...form, readerId: e.target.value })}>
              <option value="">Chọn độc giả...</option>
              {readers.filter((r) => r.readerType === form.readerType).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.email})</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Sách</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })}>
              <option value="">Chọn sách...</option>
              {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={labelStyle}>Ngày mượn</label>
              <input style={inputStyle} type="date" value={form.borrowDate} onChange={(e) => {
                const newBorrowDate = e.target.value;
                setForm({ ...form, borrowDate: newBorrowDate, dueDate: dueDateFor(form.readerType, newBorrowDate) });
              }} />
            </div>
            <div><label style={labelStyle}>Hạn trả</label>
              <input style={inputStyle} type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div><label style={labelStyle}>Ghi chú</label>
            <input style={inputStyle} type="text" placeholder="Ghi chú tùy chọn..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button onClick={handleCreate} disabled={actionLoading}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {actionLoading ? 'Đang tạo...' : 'Tạo phiếu'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedRecord(null); }} title="Chi tiết Phiếu Mượn" width="600px">
        {selectedRecord && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><User size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Độc giả</span></div>
                <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{getReaderName(selectedRecord)}</p>
                <p className="text-[12px] text-slate-500">{getReaderTypeLabel(selectedRecord)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><BookOpen size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Sách</span></div>
                <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{selectedRecord.book?.title || '-'}</p>
                <p className="text-[12px] text-slate-500">ID: {selectedRecord.bookId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><Calendar size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Ngày mượn</span></div>
                <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{new Date(selectedRecord.borrowDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Hạn trả</span></div>
                <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{new Date(selectedRecord.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
            {selectedRecord.returnDate && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><RefreshCw size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Ngày trả</span></div>
                <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{new Date(selectedRecord.returnDate).toLocaleDateString()}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><Tag size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Trạng thái</span></div>
                <StatusBadge status={selectedRecord.status} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><Hash size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Gia hạn</span></div>
                <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{selectedRecord.renewalCount || 0} / {selectedRecord.maxRenewals || 2}</p>
              </div>
            </div>
            {selectedRecord.notes && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2"><FileText size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Ghi chú</span></div>
                <p className="text-[13px] text-slate-600 dark:text-slate-300">{selectedRecord.notes}</p>
              </div>
            )}
            {selectedRecord.status === 'active' && (
              <button onClick={() => { setDetailOpen(false); openReturnModal(selectedRecord); }}
                className="w-full h-[42px] rounded-lg bg-green-500 text-white text-[14px] font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer border-0 mt-2">
                Trả sách
              </button>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={returnOpen}
        title="Xác nhận trả sách"
        message={`Bạn có chắc chắn muốn trả sách "${selectedRecord?.book?.title || ''}" cho "${getReaderName(selectedRecord || {} as BorrowRecord)}"?`}
        confirmLabel="Xác nhận trả"
        cancelLabel="Hủy"
        danger={false}
        loading={actionLoading}
        onConfirm={handleReturn}
        onCancel={() => { setReturnOpen(false); setSelectedRecord(null); }}
      />

      <Modal isOpen={overdueOpen} onClose={() => { setOverdueOpen(false); }} title="Thống kê quá hạn" width="700px">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-[#7F1D1D]/20 rounded-xl p-4 text-center">
              <p className="text-[24px] font-bold text-red-500">{stats.overdue}</p>
              <p className="text-[12px] text-[#991B1B] dark:text-[#FCA5A5]/70 mt-1">Tổng quá hạn</p>
            </div>
            <div className="bg-blue-50 dark:bg-[#1E3A5F]/20 rounded-xl p-4 text-center">
              <p className="text-[24px] font-bold text-blue-600">{avgOverdueDays}</p>
              <p className="text-[12px] text-[#1D4ED8] dark:text-[#93C5FD]/70 mt-1">Trung bình quá hạn (ngày)</p>
            </div>
            <div className="bg-green-50 dark:bg-[#14532D]/20 rounded-xl p-4 text-center">
              <p className="text-[24px] font-bold text-green-500">{overdueByReaderType.length}</p>
              <p className="text-[12px] text-green-600 dark:text-[#86EFAC]/70 mt-1">Nhóm độc giả</p>
            </div>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 mb-3">Phân bổ theo loại độc giả</h4>
            <div className="flex flex-col gap-2">
              {overdueByReaderType.map((item) => (
                <div key={item.readerType} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-[13px] text-slate-600 dark:text-slate-300">{item.readerType === 'student' ? 'Sinh viên' : item.readerType === 'teacher' ? 'Giảng viên' : item.readerType}</span>
                  <span className="text-[14px] font-bold text-red-500">{item._count.id}</span>
                </div>
              ))}
              {overdueByReaderType.length === 0 && (
                <p className="text-[13px] text-slate-400 text-center py-3">Không có phiếu quá hạn</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 mb-3">Phân bổ theo thể loại</h4>
            <div className="flex flex-col gap-2">
              {Object.entries(overdueByCategory).map(([catName, count]) => (
                <div key={catName} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-[13px] text-slate-600 dark:text-slate-300">{catName}</span>
                  <span className="text-[14px] font-bold text-red-500">{count}</span>
                </div>
              ))}
              {Object.keys(overdueByCategory).length === 0 && (
                <p className="text-[13px] text-slate-400 text-center py-3">Không có phiếu quá hạn</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 mb-3">Danh sách phiếu quá hạn</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Độc giả</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sách</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hạn trả</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueRecords.map((r) => (
                    <tr key={r.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0">
                      <td className="px-3 py-2 text-[12px] text-slate-600">{getReaderName(r)}</td>
                      <td className="px-3 py-2 text-[12px] text-slate-600 max-w-[150px] truncate">{r.book?.title || '-'}</td>
                      <td className="px-3 py-2 text-[12px] text-red-500 font-medium">{new Date(r.dueDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                  {overdueRecords.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-6 text-center text-[12px] text-slate-400">Không có phiếu quá hạn</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {overdueTotal > ROWS_PER_PAGE && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-[12px] text-slate-500">{overdueTotal} tổng</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setOverduePage((p) => Math.max(1, p - 1))} disabled={overduePage === 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer border-0 bg-transparent"><ChevronLeft size={14} className="text-slate-500" /></button>
                  <span className="text-[12px] text-slate-500">{overduePage}</span>
                  <button onClick={() => setOverduePage((p) => p + 1)} disabled={overdueRecords.length < ROWS_PER_PAGE} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer border-0 bg-transparent"><ChevronRight size={14} className="text-slate-500" /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BorrowingPage;