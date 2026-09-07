import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Shield, Key } from 'lucide-react';
import { usersService, type User } from '../services/users.service';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import StatusBadge from '../components/admin/StatusBadge';
import Modal from '../components/admin/Modal';
import Toast from '../components/admin/Toast';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { getErrorMessage } from '../utils/error';

const ROWS_PER_PAGE = 8;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ code: '', name: '', email: '', phone: '', role: 'student', status: 'active', password: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password modal state
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwUser, setPwUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.getAll({ page, limit: ROWS_PER_PAGE, search: search || undefined });
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotal(res.data.data.pagination.total);
      setError(null);
    } catch {
      setError('Không thể tải danh sách người dùng');
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const openAdd = () => { setEditing(null); setForm({ code: '', name: '', email: '', phone: '', role: 'student', status: 'active', password: '' }); setModalOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ code: u.code || '', name: u.name, email: u.email, phone: u.phone || '', role: u.role, status: u.status, password: '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setToast({ message: 'Tên và email là bắt buộc', type: 'error' });
      return;
    }
    if (!editing && !form.password.trim()) {
      setToast({ message: 'Mật khẩu là bắt buộc cho người dùng mới', type: 'error' });
      return;
    }
    if (!editing && form.password.length < 6) {
      setToast({ message: 'Mật khẩu phải có ít nhất 6 ký tự', type: 'error' });
      return;
    }
    try {
      if (editing) {
         await usersService.update(editing.id, { code: form.code.trim() || undefined, name: form.name, email: form.email, phone: form.phone || undefined, role: form.role, status: form.status });
        setToast({ message: 'Cập nhật người dùng thành công', type: 'success' });
      } else {
         await usersService.create({ code: form.code.trim() || undefined, name: form.name, email: form.email, phone: form.phone || undefined, role: form.role, status: form.status, password: form.password });
        setToast({ message: 'Thêm người dùng thành công', type: 'success' });
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Xóa người dùng "${u.name}"?`)) return;
    try {
      await usersService.remove(u.id);
      setToast({ message: 'Xóa người dùng thành công', type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
    }
  };

  const openPasswordModal = (u: User) => {
    setPwUser(u);
    setNewPassword('');
    setConfirmPassword('');
    setPwModalOpen(true);
  };

  const handleChangePassword = async () => {
    if (!pwUser) return;
    if (!newPassword.trim()) {
      setToast({ message: 'Vui lòng nhập mật khẩu mới', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'Mật khẩu không khớp', type: 'error' });
      return;
    }
    try {
      await usersService.changePassword(pwUser.id, newPassword);
      setToast({ message: 'Cập nhật mật khẩu thành công', type: 'success' });
      setPwModalOpen(false);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Đổi mật khẩu thất bại'), type: 'error' });
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };
  const roleColors: Record<string, string> = { admin: '#EF4444', teacher: '#7C3AED', student: '#2563EB' };

  return (
    <div>
      <PageHeader title="Quản lý Người dùng" subtitle="Quản lý người dùng hệ thống và mức truy cập."
        action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"><Plus size={16} /> Thêm Người dùng</button>}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} /></div>
        <div className="overflow-x-auto">
          <table className="w-full mt-4">
              <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Mã số</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Họ tên</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Vai trò</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-5 py-3"><span className="text-[13px] font-mono text-slate-500">{u.code}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0" style={{ backgroundColor: roleColors[u.role] || '#64748B' }}>
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium" style={{ backgroundColor: `${roleColors[u.role] || '#64748B'}15`, color: roleColors[u.role] || '#64748B' }}>
                      <Shield size={11} /> {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent" title="Sửa"><Edit3 size={14} className="text-blue-600" /></button>
                      <button onClick={() => openPasswordModal(u)} className="p-1.5 rounded-lg hover:bg-[#FFF7ED] dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent" title="Đổi mật khẩu"><Key size={14} className="text-amber-500" /></button>
                      <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent" title="Xóa"><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center"><div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="sm" /> <span className="text-[13px]">Đang tải...</span></div></td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={6} className="px-5 py-8"><ErrorState compact title={error} onRetry={fetchUsers} /></td></tr>
              )}
              {!loading && !error && users.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-slate-400">Không tìm thấy người dùng</td></tr>
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

      {/* Add/Edit User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa Người dùng' : 'Thêm Người dùng'}>
        <div className="flex flex-col gap-4">
          <div><label style={labelStyle}>Mã số (Code)</label><input style={inputStyle} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ADMIN001, GV001, HV001..." /></div>
          <div><label style={labelStyle}>Họ và tên</label><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên người dùng" /></div>
          <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@lib.edu" /></div>
          <div><label style={labelStyle}>Điện thoại</label><input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" /></div>
          {!editing && (
            <div><label style={labelStyle}>Mật khẩu <span className="text-red-500">*</span></label><input style={inputStyle} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" /></div>
          )}
          <div><label style={labelStyle}>Vai trò</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {['admin', 'teacher', 'student'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button onClick={handleSave}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            {editing ? 'Lưu thay đổi' : 'Thêm Người dùng'}
          </button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={pwModalOpen} onClose={() => setPwModalOpen(false)} title={`Đổi Mật khẩu — ${pwUser?.name || ''}`}>
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Mật khẩu mới <span className="text-red-500">*</span></label>
            <input style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" />
          </div>
          <div>
            <label style={labelStyle}>Xác nhận mật khẩu <span className="text-red-500">*</span></label>
            <input style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" />
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[13px] text-red-500">Mật khẩu không khớp</p>
          )}
          <button onClick={handleChangePassword}
            className="w-full h-[42px] rounded-lg bg-[#F59E0B] text-white text-[14px] font-semibold hover:bg-[#D97706] transition-colors cursor-pointer border-0 mt-2">
            Cập nhật Mật khẩu
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UsersPage;
