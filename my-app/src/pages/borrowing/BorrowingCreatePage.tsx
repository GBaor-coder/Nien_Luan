import React, { useState, useEffect } from 'react';
import { FilePlus2, User, BookOpen, CalendarDays, Info, CheckCircle2, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { borrowingService } from '../../services/borrowing.service';
import { readersService, type Reader } from '../../services/readers.service';
import { booksService, type Book } from '../../services/books.service';
import PageHeader from '../../components/admin/PageHeader';
import Toast from '../../components/admin/Toast';
import { getErrorMessage } from '../../utils/error';

const inputStyle: React.CSSProperties = { width: '100%', height: '42px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };

const BorrowingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [readers, setReaders] = useState<Reader[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState({
    readerType: 'student',
    readerId: '',
    bookId: '',
    borrowDate: '',
    dueDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().split('T')[0];
    })(),
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const [rRes, bRes] = await Promise.all([
          readersService.getAll({ limit: 100 }),
          booksService.getAll({ limit: 100 }),
        ]);
        setReaders(rRes.data.data.readers);
        setBooks(bRes.data.data.books);
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const selectedBook = books.find((b) => b.id === form.bookId);

  const dueDateFor = (type: 'student' | 'teacher', borrowDate?: string) => {
    const d = borrowDate ? new Date(borrowDate) : new Date();
    d.setDate(d.getDate() + (type === 'teacher' ? 30 : 14));
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!form.readerId || !form.bookId) {
      setToast({ message: 'Vui lòng chọn độc giả và sách', type: 'error' });
      return;
    }
    if (form.dueDate && form.dueDate < form.borrowDate) {
      setToast({ message: 'Hạn trả phải sau ngày mượn', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await borrowingService.create({
        readerId: form.readerId,
        bookId: form.bookId,
        dueDate: form.dueDate || undefined,
        borrowDate: form.borrowDate || new Date().toISOString().split('T')[0],
        readerType: form.readerType,
        notes: form.notes || undefined,
      });
      setToast({ message: 'Tạo phiếu mượn thành công', type: 'success' });
      setForm({ readerType: 'student', readerId: '', bookId: '', borrowDate: '', dueDate: dueDateFor('student', ''), notes: '' });
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Không thể tạo phiếu mượn'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tạo Phiếu Mượn Mới"
        subtitle="Lập phiếu mượn sách cho sinh viên hoặc giảng viên."
        action={
          <button
            onClick={() => navigate('/dashboard/borrowing')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[13px] font-medium hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors cursor-pointer border-0"
          >
            <ListChecks size={16} /> Xem tất cả phiếu
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 mb-5">Thông tin phiếu mượn</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Loại độc giả</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, readerType: 'student', readerId: '', dueDate: dueDateFor('student', form.borrowDate) })}
                  className="h-[42px] rounded-lg border-2 transition-colors cursor-pointer text-[13px] font-medium"
                  style={{
                    borderColor: form.readerType === 'student' ? '#2563EB' : '#E2E8F0',
                    backgroundColor: form.readerType === 'student' ? '#EFF6FF' : 'transparent',
                    color: form.readerType === 'student' ? '#1D4ED8' : '#64748B',
                  }}
                >
                  Sinh viên
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, readerType: 'teacher', readerId: '', dueDate: dueDateFor('teacher', form.borrowDate) })}
                  className="h-[42px] rounded-lg border-2 transition-colors cursor-pointer text-[13px] font-medium"
                  style={{
                    borderColor: form.readerType === 'teacher' ? '#2563EB' : '#E2E8F0',
                    backgroundColor: form.readerType === 'teacher' ? '#EFF6FF' : 'transparent',
                    color: form.readerType === 'teacher' ? '#1D4ED8' : '#64748B',
                  }}
                >
                  Giảng viên
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}><User size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />Độc giả</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.readerId}
                onChange={(e) => setForm({ ...form, readerId: e.target.value })}
              >
                <option value="">Chọn độc giả...</option>
                {readers.filter((r) => r.readerType === form.readerType).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.email})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}><BookOpen size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />Sách</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.bookId}
                onChange={(e) => setForm({ ...form, bookId: e.target.value })}
              >
                <option value="">Chọn sách...</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}{b.available <= 0 ? ' (Hết sách)' : ''}</option>
                ))}
              </select>
              {selectedBook && (
                <div className="flex items-center gap-2 mt-2 text-[12px] text-slate-500">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${selectedBook.available > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {selectedBook.available > 0 ? `Còn ${selectedBook.available} bản` : 'Hết sách'}
                  </span>
                  {selectedBook.author?.name && <span>{selectedBook.author.name}</span>}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}><CalendarDays size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />Ngày mượn</label>
                <input style={inputStyle} type="date" value={form.borrowDate} onChange={(e) => {
                  const newBorrowDate = e.target.value;
                  setForm({ ...form, borrowDate: newBorrowDate, dueDate: dueDateFor(form.readerType as 'student' | 'teacher', newBorrowDate) });
                }} />
              </div>
              <div>
                <label style={labelStyle}><CalendarDays size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />Hạn trả</label>
                <input style={inputStyle} type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                <p className="text-[11px] text-slate-400 mt-1">Để trống để hệ thống tự tính (SV 14 ngày, GV 30 ngày).</p>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Ghi chú</label>
              <input style={inputStyle} type="text" placeholder="Ghi chú tùy chọn..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 w-full h-[46px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang tạo...' : <><FilePlus2 size={18} /> Tạo phiếu mượn</>}
            </button>
          </div>
        </div>

        {/* Side info */}
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-blue-600" />
              <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Quy trình mượn sách</h4>
            </div>
            <ol className="flex flex-col gap-3">
              {[
                'Chọn loại độc giả (Sinh viên hoặc Giảng viên).',
                'Chọn độc giả trong danh sách đã đăng ký.',
                'Chọn sách còn bản khả dụng (available > 0).',
                'Nhập ngày mượn và hạn trả.',
                'Lưu phiếu — hệ thống tự trừ số lượng sách khả dụng.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-slate-600 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-[#F0F9FF] dark:bg-[#0C4A6E]/20 border border-[#BAE6FD] dark:border-[#0EA5E9]/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={15} className="text-[#0284C7]" />
              <h4 className="text-[13px] font-semibold text-[#075985] dark:text-[#7DD3FC]">Mẹo</h4>
            </div>
            <p className="text-[12px] text-[#0369A1] dark:text-[#BAE6FD]/80">
              Sinh viên được mượn tối đa 5 quyển (14 ngày), giảng viên tối đa 10 quyển (30 ngày). Phiếu đang mượn có thể gia hạn tối đa 2 lần.
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BorrowingCreatePage;
