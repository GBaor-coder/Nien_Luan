import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, PenTool, Upload, X } from 'lucide-react';
import { authorsService, type Author } from '../services/authors.service';
import { uploadService } from '../services/upload.service';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import Modal from '../components/admin/Modal';
import Toast from '../components/admin/Toast';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { getErrorMessage } from '../utils/error';

const COLORS = ['#2563EB', '#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#06B6D4', '#A855F7', '#EF4444', '#14B8A6', '#F97316', '#6366F1', '#0EA5E9'];

const AuthorsPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState({ name: '', nationality: '', bio: '', birthYear: '', deathYear: '', avatar: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await authorsService.getAll({ search: search || undefined, limit: 100, page: 1 });
      setAuthors(res.data.data.authors);
      setTotal(res.data.data.pagination?.total ?? 0);
      setHasNext(res.data.data.pagination?.hasNext ?? false);
      setPage(1);
    } catch (err) {
      console.error('Failed to fetch authors:', err);
      setError(true);
    } finally { setLoading(false); }
  }, [search]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await authorsService.getAll({ search: search || undefined, limit: 100, page: nextPage });
      setAuthors(prev => [...prev, ...res.data.data.authors]);
      setPage(nextPage);
      setHasNext(res.data.data.pagination?.hasNext ?? false);
    } catch (err) {
      console.error('Failed to load more authors:', err);
    } finally { setLoadingMore(false); }
  }, [page, search, loadingMore]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAuthors(), 0);
    return () => clearTimeout(timer);
  }, [fetchAuthors]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', nationality: '', bio: '', birthYear: '', deathYear: '', avatar: '' });
    setImageFile(null);
    setModalOpen(true);
  };
  const openEdit = (a: Author) => {
    setEditing(a);
    setForm({
      name: a.name,
      nationality: a.nationality || '',
      bio: a.bio || '',
      birthYear: a.birthYear ? String(a.birthYear) : '',
      deathYear: a.deathYear ? String(a.deathYear) : '',
      avatar: a.avatar || '',
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast({ message: 'Tên tác giả là bắt buộc', type: 'error' });
      return;
    }
    try {
      let avatarUrl = form.avatar;
      if (imageFile) {
        const uploadRes = await uploadService.uploadAuthorAvatar(imageFile);
        avatarUrl = uploadRes.data.data.url;
      }

      const payload = {
        name: form.name,
        nationality: form.nationality || undefined,
        bio: form.bio || undefined,
        avatar: avatarUrl || undefined,
        birthYear: form.birthYear ? +form.birthYear : undefined,
        deathYear: form.deathYear ? +form.deathYear : undefined,
      };

      if (editing) {
        await authorsService.update(editing.id, payload);
        setToast({ message: 'Cập nhật tác giả thành công', type: 'success' });
      } else {
        await authorsService.create(payload);
        setToast({ message: 'Thêm tác giả thành công', type: 'success' });
      }
      setModalOpen(false);
      fetchAuthors();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thao tác thất bại'), type: 'error' });
    }
  };

  const handleDelete = async (a: Author) => {
    if (!confirm(`Xóa tác giả "${a.name}"?`)) return;
    try {
      await authorsService.remove(a.id);
      setToast({ message: 'Xóa tác giả thành công', type: 'success' });
      fetchAuthors();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };

  return (
    <div>
      <PageHeader title="Tác giả" subtitle="Quản lý hồ sơ tác giả và các tác phẩm."
        action={<button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0"><Plus size={16} /> Thêm Tác giả</button>}
      />

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} /></div>

      {loading ? (
        <LoadingState label="Đang tải tác giả..." minHeight={320} />
      ) : error ? (
        <ErrorState title="Không thể tải danh sách tác giả" description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại." onRetry={fetchAuthors} />
      ) : authors.length === 0 ? (
        <EmptyState icon={PenTool} title="Không tìm thấy tác giả" description="Thử thay đổi từ khóa tìm kiếm." actionLabel="Thêm Tác giả" onAction={openAdd} />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {authors.map((author) => {
          const color = COLORS[Math.abs(author.name.charCodeAt(0)) % COLORS.length];
          return (
            <div key={author.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200"
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
              <div className="flex items-center gap-3 mb-4">
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0"
                    style={{ backgroundColor: color }}>
                    {author.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 truncate">{author.name}</h4>
                  <p className="text-[12px] text-slate-500">{author.nationality || 'Không rõ'}</p>
                  {(author.birthYear || author.deathYear) && (
                    <p className="text-[11px] text-slate-400">
                      {author.birthYear || '?'} - {author.deathYear || 'nay'}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[12px] text-slate-500 mb-4 line-clamp-2">{author.bio || 'Không có tiểu sử'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <PenTool size={12} className="text-slate-400" />
                  <span className="text-[12px] text-slate-400">{author._count?.books || 0} sách</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(author)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent">
                    <Edit3 size={14} className="text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(author)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-[#334155] transition-colors cursor-pointer border-0 bg-transparent">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {hasNext && !loading && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <button onClick={loadMore} disabled={loadingMore}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed">
            {loadingMore ? 'Đang tải...' : 'Xem thêm'}
          </button>
          <span className="text-[12px] text-slate-400">Hiển thị {authors.length} / {total} tác giả</span>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa Tác giả' : 'Thêm Tác giả'}>
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Ảnh đại diện</label>
            {form.avatar || imageFile ? (
              <div className="relative inline-block">
                <img src={imageFile ? URL.createObjectURL(imageFile) : form.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border border-slate-200" />
                <button onClick={() => { setForm({ ...form, avatar: '' }); setImageFile(null); }} className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer border-0" title="Xóa ảnh">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#2563EB] transition-colors">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[9px] text-slate-400">Tải lên</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                }} />
              </label>
            )}
          </div>
          <div>
            <label style={labelStyle}>Họ và tên</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên tác giả" />
          </div>
          <div>
            <label style={labelStyle}>Quốc tịch</label>
            <input style={inputStyle} value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} placeholder="Quốc gia" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Năm sinh</label>
              <input style={inputStyle} type="number" min={1000} max={2100} value={form.birthYear} onChange={(e) => setForm({ ...form, birthYear: e.target.value })} placeholder="VD: 1990" />
            </div>
            <div>
              <label style={labelStyle}>Năm mất</label>
              <input style={inputStyle} type="number" min={1000} max={2100} value={form.deathYear} onChange={(e) => setForm({ ...form, deathYear: e.target.value })} placeholder="Để trống nếu còn sống" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Tiểu sử</label>
            <textarea style={{ ...inputStyle, height: '80px', padding: '10px 12px', resize: 'vertical' as const }} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tiểu sử ngắn gọn" />
          </div>
          <button onClick={handleSave}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 mt-2">
            {editing ? 'Lưu thay đổi' : 'Thêm Tác giả'}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AuthorsPage;
