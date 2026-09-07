import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { readersService, type Reader, type ReaderInput } from '../services/readers.service';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import Modal from '../components/admin/Modal';
import Toast from '../components/admin/Toast';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { getErrorMessage } from '../utils/error';

const ROWS_PER_PAGE = 8;

const typeStyles: Record<string, { bg: string; color: string; label: string }> = {
  student: { bg: '#EFF6FF', color: '#2563EB', label: 'Sinh viên' },
  teacher: { bg: '#F5F3FF', color: '#7C3AED', label: 'Giảng viên' },
};

const emptyForm = (): ReaderInput => ({
  name: '',
  email: '',
  phone: '',
  password: '',
  status: 'active',
  readerType: 'student',
  studentId: '',
  className: '',
  grade: 1,
  enrollYear: new Date().getFullYear(),
  teacherId: '',
  department: '',
  position: '',
  degree: '',
});

const toForm = (r: Reader): ReaderInput => ({
  name: r.name,
  email: r.email,
  phone: r.phone || '',
  status: r.status,
  readerType: r.readerType,
  studentId: r.profile?.studentId || '',
  className: r.profile?.className || '',
  grade: r.profile?.grade || 1,
  enrollYear: r.profile?.enrollYear || new Date().getFullYear(),
  teacherId: r.profile?.teacherId || '',
  department: r.profile?.department || '',
  position: r.profile?.position || '',
  degree: r.profile?.degree || '',
});

const ReadersPage: React.FC = () => {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reader | null>(null);
  const [form, setForm] = useState<ReaderInput>(emptyForm());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchReaders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await readersService.getAll({ page, limit: ROWS_PER_PAGE, search: search || undefined });
      setReaders(res.data.data.readers);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotal(res.data.data.pagination.total);
    } catch { setError(true); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchReaders(), 0);
    return () => clearTimeout(timer);
  }, [fetchReaders]);

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setModalOpen(true); };
  const openEdit = (r: Reader) => { setEditing(r); setForm(toForm(r)); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setToast({ message: 'Tên và email là bắt buộc', type: 'error' });
      return;
    }
    try {
      if (editing) {
        const payload = { ...form } as ReaderInput;
        delete payload.password;
        delete payload.readerType;
        await readersService.update(editing.id, payload);
        setToast({ message: 'Cập nhật độc giả thành công', type: 'success' });
      } else {
        await readersService.create(form);
        setToast({ message: 'Thêm độc giả thành công', type: 'success' });
      }
      setModalOpen(false);
      fetchReaders();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    }
  };

  const handleDelete = async (r: Reader) => {
    if (!confirm(`Xóa độc giả "${r.name}"?`)) return;
    try {
      await readersService.remove(r.id);
      setToast({ message: 'Xóa độc giả thành công', type: 'success' });
      fetchReaders();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };
  const isStudent = form.readerType !== 'teacher';

  const getClassInfo = (r: Reader) => {
    if (r.readerType === 'student') {
      const parts = [r.profile?.className, r.profile?.grade ? `Năm ${r.profile.grade}` : null].filter(Boolean);
      return parts.join(' • ') || '-';
    }
    const parts = [r.profile?.department, r.profile?.degree].filter(Boolean);
    return parts.join(' • ') || '-';
  };

  return (
    <div>
      <PageHeader title="Độc giả" subtitle="Quản lý sinh viên và giảng viên sử dụng thư viện."
        action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"><Plus size={16} /> Thêm Độc giả</button>}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} /></div>
        <div className="overflow-x-auto">
          <table className="w-full mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Họ tên</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Loại</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Lớp / Khoa / Học hàm</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Sách đã mượn</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {readers.map((r) => {
                const ts = typeStyles[r.readerType] || typeStyles.student;
                return (
                  <tr key={r.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0" style={{ backgroundColor: ts.color }}>
                          {r.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{r.name}</span>
                          {r.code && <div className="text-[11px] text-slate-400">{r.code}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{r.email}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium" style={{ backgroundColor: ts.bg, color: ts.color }}>
                        {ts.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{getClassInfo(r)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-lg text-[12px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {r.borrowed ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent"><Edit3 size={14} className="text-blue-600" /></button>
                        <button onClick={() => handleDelete(r)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent"><Trash2 size={14} className="text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8"><div className="flex items-center justify-center gap-2"><Spinner size="sm" /><span className="text-[13px] text-slate-400">Đang tải...</span></div></td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="px-5 py-8"><ErrorState compact onRetry={fetchReaders} /></td></tr>
              ) : readers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-slate-400">Không tìm thấy độc giả</td></tr>
              ) : null}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa thông tin độc giả' : 'Thêm Độc giả'} width="560px">
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Loại độc giả</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} disabled={!!editing} value={form.readerType} onChange={(e) => setForm({ ...form, readerType: e.target.value as 'student' | 'teacher' })}>
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
            </select>
          </div>
          <div><label style={labelStyle}>Họ và tên</label><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên độc giả" /></div>
          <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
          <div><label style={labelStyle}>Điện thoại</label><input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" /></div>
          {isStudent ? (
            <div className="grid grid-cols-3 gap-3">
              <div><label style={labelStyle}>Lớp</label><input style={inputStyle} value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="CNTT1" /></div>
              <div><label style={labelStyle}>Năm học</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.grade} onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })}>
                  {[1, 2, 3, 4].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Mã SV</label><input style={inputStyle} value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="HV2026001" /></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div><label style={labelStyle}>Bộ môn</label><input style={inputStyle} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Công nghệ thông tin" /></div>
              <div><label style={labelStyle}>Chức vụ</label><input style={inputStyle} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Giảng viên" /></div>
              <div><label style={labelStyle}>Học hàm/Học vị</label><input style={inputStyle} value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Thạc sĩ, Tiến sĩ..." /></div>
            </div>
          )}
          {!editing && (
            <div><label style={labelStyle}>Mật khẩu <span className="text-red-500">*</span></label><input style={inputStyle} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" /></div>
          )}
          <button onClick={handleSave}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            {editing ? 'Lưu thay đổi' : 'Thêm Độc giả'}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ReadersPage;
