import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, Shield, Check } from 'lucide-react';
import { rolesService, type Role } from '../services/roles.service';
import PageHeader from '../components/admin/PageHeader';
import Modal from '../components/admin/Modal';
import Toast from '../components/admin/Toast';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { getErrorMessage } from '../utils/error';

const allPermissions = ['Dashboard', 'Catalog', 'Categories', 'Authors', 'Readers', 'Borrowing', 'Reports', 'Users', 'Roles', 'Settings'];
const roleColors: Record<string, string> = { admin: '#EF4444', teacher: '#7C3AED', student: '#2563EB' };

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] as string[] });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await rolesService.getAll({ limit: 100 });
      setRoles(res.data.data.roles);
    } catch { setError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchRoles(), 0);
    return () => clearTimeout(timer);
  }, [fetchRoles]);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', permissions: [] }); setModalOpen(true); };
  const openEdit = (r: Role) => { setEditing(r); setForm({ name: r.name, description: r.description || '', permissions: r.permissions || [] }); setModalOpen(true); };

  const togglePerm = (perm: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm) ? f.permissions.filter((p) => p !== perm) : [...f.permissions, perm],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast({ message: 'Tên vai trò là bắt buộc', type: 'error' });
      return;
    }
    try {
      if (editing) {
        await rolesService.update(editing.id, form);
        setToast({ message: 'Cập nhật vai trò thành công', type: 'success' });
      } else {
        await rolesService.create(form);
        setToast({ message: 'Thêm vai trò thành công', type: 'success' });
      }
      setModalOpen(false);
      fetchRoles();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    }
  };

  const handleDelete = async (r: Role) => {
    if (!confirm(`Xóa vai trò "${r.name}"?`)) return;
    try {
      await rolesService.remove(r.id);
      setToast({ message: 'Xóa vai trò thành công', type: 'success' });
      fetchRoles();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };

  return (
    <div>
      <PageHeader title="Vai trò & Quyền hạn" subtitle="Định nghĩa vai trò và kiểm soát quyền truy cập."
        action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"><Plus size={16} /> Thêm Vai trò</button>}
      />

      {loading ? (
        <LoadingState label="Đang tải vai trò..." minHeight={320} />
      ) : error ? (
        <ErrorState title="Không thể tải vai trò" description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại." onRetry={fetchRoles} />
      ) : roles.length === 0 ? (
        <EmptyState icon={Shield} title="Không tìm thấy vai trò" description="Tạo vai trò đầu tiên để bắt đầu phân quyền." actionLabel="Thêm Vai trò" onAction={openAdd} />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200"
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColors[role.name] || '#64748B'}15`, color: roleColors[role.name] || '#64748B' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{role.name}</h4>
                  <p className="text-[12px] text-slate-500">{role.description || 'Không có mô tả'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(role)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent"><Edit3 size={14} className="text-blue-600" /></button>
                {role.name !== 'Administrator' && (
                  <button onClick={() => handleDelete(role)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent"><Trash2 size={14} className="text-red-500" /></button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[12px] text-slate-400">Người dùng:</span>
              <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{role._count?.users || 0}</span>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] dark:border-slate-700">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Quyền hạn</p>
              <div className="flex flex-wrap gap-1.5">
                {(!role.permissions || role.permissions.length === 0) ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-[11px] font-medium text-red-500">
                    <Check size={10} /> Tất cả quyền truy cập
                  </span>
                ) : (
                  role.permissions.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-[11px] font-medium text-blue-600">
                      <Check size={10} /> {p}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa Vai trò' : 'Thêm Vai trò'}>
        <div className="flex flex-col gap-4">
          <div><label style={labelStyle}>Tên Vai trò</label><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Biên tập viên" /></div>
          <div><label style={labelStyle}>Mô tả</label><input style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn gọn" /></div>
          <div>
            <label style={labelStyle}>Quyền hạn</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {allPermissions.map((perm) => (
                <label key={perm} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <input type="checkbox" checked={form.permissions.includes(perm)} onChange={() => togglePerm(perm)}
                    className="w-4 h-4 rounded accent-[#2563EB] cursor-pointer" />
                  <span className="text-[13px] text-slate-600 dark:text-slate-300">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={handleSave}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            {editing ? 'Lưu thay đổi' : 'Thêm Vai trò'}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RolesPage;
