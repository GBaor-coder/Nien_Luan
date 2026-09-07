import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, FolderOpen } from 'lucide-react';
import { categoriesService, type Category } from '../services/categories.service';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import Modal from '../components/admin/Modal';
import Toast from '../components/admin/Toast';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { getErrorMessage } from '../utils/error';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#2563EB' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await categoriesService.getAll({ search: search || undefined, limit: 100 });
      setCategories(res.data.data.categories);
    } catch { setError(true); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCategories(), 0);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', color: '#2563EB' }); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, description: c.description || '', color: c.color || '#2563EB' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast({ message: 'Tên thể loại là bắt buộc', type: 'error' });
      return;
    }
    try {
      if (editing) {
        await categoriesService.update(editing.id, form);
        setToast({ message: 'Cập nhật thể loại thành công', type: 'success' });
      } else {
        await categoriesService.create(form);
        setToast({ message: 'Thêm thể loại thành công', type: 'success' });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Xóa thể loại "${c.name}"?`)) return;
    try {
      await categoriesService.remove(c.id);
      setToast({ message: 'Xóa thể loại thành công', type: 'success' });
      fetchCategories();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };

  return (
    <div>
      <PageHeader title="Thể loại" subtitle="Quản lý thể loại sách và phân loại."
        action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"><Plus size={16} /> Thêm Thể loại</button>}
      />

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} /></div>

      {loading ? (
        <LoadingState label="Đang tải thể loại..." minHeight={320} />
      ) : error ? (
        <ErrorState title="Không thể tải thể loại" description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại." onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderOpen} title="Không tìm thấy thể loại" description="Thử thay đổi từ khóa tìm kiếm." actionLabel="Thêm Thể loại" onAction={openAdd} />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200"
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color || '#2563EB'}15`, color: cat.color || '#2563EB' }}>
                <FolderOpen size={18} />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent">
                  <Edit3 size={14} className="text-blue-600" />
                </button>
                <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
            <h4 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mb-1">{cat.name}</h4>
            <p className="text-[12px] text-slate-500 mb-3 line-clamp-2">{cat.description || 'Không có mô tả'}</p>
            <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] dark:border-slate-700">
              <span className="text-[12px] text-slate-400">Sách</span>
              <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{cat.bookCount ?? cat._count?.books ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa Thể loại' : 'Thêm Thể loại'}>
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Tên Thể loại</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên thể loại" />
          </div>
          <div>
            <label style={labelStyle}>Mô tả</label>
            <textarea style={{ ...inputStyle, height: '80px', padding: '10px 12px', resize: 'vertical' as const }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn gọn" />
          </div>
          <div>
            <label style={labelStyle}>Màu sắc</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
              <input style={{ ...inputStyle, width: '140px' }} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <button onClick={handleSave}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            {editing ? 'Lưu thay đổi' : 'Thêm Thể loại'}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CategoriesPage;
