import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, Building2 } from 'lucide-react';
import { publishersService, type Publisher } from '../services/publishers.service';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import Modal from '../components/admin/Modal';
import Toast from '../components/admin/Toast';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { getErrorMessage } from '../utils/error';

const PublishersPage: React.FC = () => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Publisher | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', website: '', description: '', foundedYear: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchPublishers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await publishersService.getAll({ search: search || undefined, limit: 100 });
      setPublishers(res.data.data.publishers);
    } catch { setError(true); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPublishers(), 0);
    return () => clearTimeout(timer);
  }, [fetchPublishers]);

  const openAdd = () => { setEditing(null); setForm({ name: '', address: '', phone: '', email: '', website: '', description: '', foundedYear: '' }); setModalOpen(true); };
  const openEdit = (p: Publisher) => {
    setEditing(p);
    setForm({ name: p.name, address: p.address || '', phone: p.phone || '', email: p.email || '', website: p.website || '', description: p.description || '', foundedYear: p.foundedYear?.toString() || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast({ message: 'Tên nhà xuất bản là bắt buộc', type: 'error' });
      return;
    }
    try {
      const data = {
        ...form,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
      };
      if (editing) {
        await publishersService.update(editing.id, data);
        setToast({ message: 'Cập nhật nhà xuất bản thành công', type: 'success' });
      } else {
        await publishersService.create(data);
        setToast({ message: 'Thêm nhà xuất bản thành công', type: 'success' });
      }
      setModalOpen(false);
      fetchPublishers();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    }
  };

  const handleDelete = async (p: Publisher) => {
    if (!confirm(`Xóa nhà xuất bản "${p.name}"?`)) return;
    try {
      await publishersService.remove(p.id);
      setToast({ message: 'Xóa nhà xuất bản thành công', type: 'success' });
      fetchPublishers();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };

  return (
    <div>
      <PageHeader title="Nhà xuất bản" subtitle="Quản lý nhà xuất bản và đối tác xuất bản."
        action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"><Plus size={16} /> Thêm NXB</button>}
      />

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} /></div>

      {loading ? (
        <LoadingState label="Đang tải nhà xuất bản..." minHeight={320} />
      ) : error ? (
        <ErrorState title="Không thể tải nhà xuất bản" description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại." onRetry={fetchPublishers} />
      ) : publishers.length === 0 ? (
        <EmptyState icon={Building2} title="Không tìm thấy nhà xuất bản" description="Thử thay đổi từ khóa tìm kiếm." actionLabel="Thêm NXB" onAction={openAdd} />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {publishers.map((pub) => (
          <div key={pub.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200"
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-blue-600">
                <Building2 size={18} />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(pub)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent">
                  <Edit3 size={14} className="text-blue-600" />
                </button>
                <button onClick={() => handleDelete(pub)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
            <h4 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate">{pub.name}</h4>
            <p className="text-[12px] text-slate-500 mb-3 line-clamp-2">{pub.description || pub.address || 'Không có thông tin'}</p>
            <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] dark:border-slate-700">
              <span className="text-[12px] text-slate-400">Sách</span>
              <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{pub.bookCount ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa Nhà xuất bản' : 'Thêm Nhà xuất bản'} width="560px">
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Tên Nhà xuất bản</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên NXB" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Địa chỉ</label>
              <input style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Hà Nội" />
            </div>
            <div>
              <label style={labelStyle}>Năm thành lập</label>
              <input style={inputStyle} type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} placeholder="1981" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Điện thoại</label>
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0241234567" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nxb@example.com" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Website</label>
            <input style={inputStyle} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://nxb.example.com" />
          </div>
          <div>
            <label style={labelStyle}>Mô tả</label>
            <textarea style={{ ...inputStyle, height: '80px', padding: '10px 12px', resize: 'vertical' as const }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn gọn" />
          </div>
          <button onClick={handleSave}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            {editing ? 'Lưu thay đổi' : 'Thêm Nhà xuất bản'}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default PublishersPage;
