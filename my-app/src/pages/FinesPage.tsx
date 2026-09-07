import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Trash2, Ban, Wallet, Plus, CreditCard } from 'lucide-react';
import { finesService, type Fine, type FineStats } from '../services/fines.service';
import { readersService, type Reader } from '../services/readers.service';
import PageHeader from '../components/admin/PageHeader';
import SearchInput from '../components/admin/SearchInput';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/admin/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/admin/Toast';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { FINE_STATUS, getStatusConfig } from '../data/statusConfig';
import { getErrorMessage } from '../utils/error';

const ROWS_PER_PAGE = 10;

const FinesPage: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [stats, setStats] = useState<FineStats | null>(null);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [waiveOpen, setWaiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [createForm, setCreateForm] = useState({ readerId: '', amount: '', reason: 'overdue', notes: '' });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: ROWS_PER_PAGE };
      if (search) params.search = search;
      if (filter !== 'all') params.status = filter;
      const [finesRes, statsRes] = await Promise.all([
        finesService.getAll(params),
        finesService.getStats(),
      ]);
      setFines(finesRes.data.data.fines);
      setPagination(finesRes.data.data.pagination);
      setStats(statsRes.data.data);
      setError(null);
    } catch {
      setError('Không thể tải danh sách phí phạt');
    } finally { setLoading(false); }
  }, [search, filter]);

  const fetchReaders = useCallback(async () => {
    try {
      const res = await readersService.getAll({ limit: 100 });
      setReaders(res.data.data.readers);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(1), 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => fetchReaders(), 0);
    return () => clearTimeout(timer);
  }, [fetchReaders]);

  const handlePayment = async () => {
    if (!selectedFine || !paymentAmount) return;
    setActionLoading(true);
    try {
      await finesService.addPayment(selectedFine.id, { paidAmount: Number(paymentAmount), notes: paymentNotes || undefined });
      setToast({ message: 'Ghi nhận thanh toán thành công', type: 'success' });
      setPaymentOpen(false);
      setSelectedFine(null);
      setPaymentAmount('');
      setPaymentNotes('');
      fetchData(pagination.page);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Thanh toán thất bại'), type: 'error' });
    } finally { setActionLoading(false); }
  };

  const handleWaive = async () => {
    if (!selectedFine) return;
    setActionLoading(true);
    try {
      await finesService.waive(selectedFine.id);
      setToast({ message: 'Miễn phạt thành công', type: 'success' });
      setWaiveOpen(false);
      setSelectedFine(null);
      fetchData(pagination.page);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Miễn phạt thất bại'), type: 'error' });
    } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedFine) return;
    setActionLoading(true);
    try {
      await finesService.remove(selectedFine.id);
      setToast({ message: 'Xóa phí phạt thành công', type: 'success' });
      setDeleteOpen(false);
      setSelectedFine(null);
      fetchData(pagination.page);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Xóa thất bại'), type: 'error' });
    } finally { setActionLoading(false); }
  };

  const handleCreate = async () => {
    if (!createForm.readerId || !createForm.amount) {
      setToast({ message: 'Vui lòng điền đầy đủ thông tin', type: 'error' });
      return;
    }
    setActionLoading(true);
    try {
      await finesService.create({
        readerId: createForm.readerId,
        amount: Number(createForm.amount),
        reason: createForm.reason,
        notes: createForm.notes || undefined,
      });
      setToast({ message: 'Tạo phí phạt thành công', type: 'success' });
      setCreateOpen(false);
      setCreateForm({ readerId: '', amount: '', reason: 'overdue', notes: '' });
      fetchData(pagination.page);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Tạo phí phạt thất bại'), type: 'error' });
    } finally { setActionLoading(false); }
  };

  const getReaderName = (fine: Fine) => {
    if (fine.student?.user?.name) return fine.student.user.name;
    if (fine.teacher?.user?.name) return fine.teacher.user.name;
    return 'N/A';
  };

  const formatMoney = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };

  const filterButtons = [
    { key: 'all', label: 'Tất cả', count: stats ? stats.pendingCount + stats.paidCount + stats.waivedCount : 0 },
    { key: 'pending', label: 'Chưa nộp', count: stats?.pendingCount || 0 },
    { key: 'paid', label: 'Đã nộp', count: stats?.paidCount || 0 },
    { key: 'waived', label: 'Miễn phạt', count: stats?.waivedCount || 0 },
  ];

  return (
    <div>
      <PageHeader title="Quản Lý Phí Phạt" subtitle="Theo dõi và xử lý các khoản phí phạt."
        action={
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
            <Plus size={16} /> Thêm mới
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {filterButtons.map((f) => (
          <button key={f.key} onClick={() => { setFilter(f.key); }}
            className="p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer text-left bg-transparent"
            style={{ borderColor: filter === f.key ? '#2563EB' : '#E2E8F0' }}>
            <p className="text-[22px] font-bold text-slate-900 dark:text-slate-100">{f.count}</p>
            <p className="text-[12px] text-slate-500">{f.label}</p>
          </button>
        ))}
      </div>

      {stats && stats.totalOutstanding > 0 && (
        <div className="bg-amber-50 dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#F59E0B]/30 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
            <Wallet size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#92400E] dark:text-[#FDE68A]">{formatMoney(stats.totalOutstanding)} chưa thu</p>
            <p className="text-[12px] text-[#B45309] dark:text-[#FDE68A]/70">Tổng tiền phạt chưa nộp</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0"><SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Tìm phí phạt..." /></div>
        <div className="overflow-x-auto">
          <table className="w-full mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Độc giả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Lý do</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Số tiền</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Đã nộp</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => {
                const config = getStatusConfig(FINE_STATUS, f.status);
                return (
                  <tr key={f.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{getReaderName(f)}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">
                      {f.reason === 'overdue' ? 'Quá hạn' : f.reason === 'damaged' ? 'Hư hại' : f.reason === 'lost' ? 'Mất' : f.reason}
                      {f.borrowRecord?.book?.title && <span className="text-slate-400"> - {f.borrowRecord.book.title}</span>}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-semibold text-slate-900 dark:text-slate-100">{formatMoney(f.amount)}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{formatMoney(f.paidAmount || 0)}</td>
                    <td className="px-5 py-3"><StatusBadge config={config} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedFine(f); setDetailOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-0 bg-transparent" title="Xem chi tiết">
                          <Eye size={14} className="text-blue-600" />
                        </button>
                        {(f.status === 'pending' || f.status === 'partial' || f.status === 'partially_paid') && (
                          <>
                            <button onClick={() => { setSelectedFine(f); setPaymentAmount(String(f.amount - (f.paidAmount || 0))); setPaymentOpen(true); }} className="p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer border-0 bg-transparent" title="Ghi nhận thanh toán">
                              <CreditCard size={14} className="text-green-500" />
                            </button>
                            <button onClick={() => { setSelectedFine(f); setWaiveOpen(true); }} className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer border-0 bg-transparent" title="Miễn phạt">
                              <Ban size={14} className="text-amber-500" />
                            </button>
                          </>
                        )}
                        <button onClick={() => { setSelectedFine(f); setDeleteOpen(true); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent" title="Xóa">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr><td colSpan={6} className="px-5 py-10 text-center"><div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="sm" /> <span className="text-[13px]">Đang tải...</span></div></td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={6} className="px-5 py-10"><ErrorState compact title={error} onRetry={() => fetchData(pagination.page)} /></td></tr>
              )}
              {!loading && !error && fines.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-[13px] text-slate-400">Không có phí phạt nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[13px] text-slate-500">Trang {pagination.page}/{pagination.totalPages} ({pagination.total} tổng)</p>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchData(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium border-0 cursor-pointer disabled:opacity-40 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Trước</button>
              <button onClick={() => fetchData(Math.min(pagination.totalPages, pagination.page + 1))} disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium border-0 cursor-pointer disabled:opacity-40 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setSelectedFine(null); }} title="Chi tiết Phí Phạt" width="500px">
        {selectedFine && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-[12px] text-slate-500 uppercase font-semibold mb-1">Độc giả</p>
                <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{getReaderName(selectedFine)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-[12px] text-slate-500 uppercase font-semibold mb-1">Sách</p>
                <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{selectedFine.borrowRecord?.book?.title || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-[12px] text-slate-500 uppercase font-semibold mb-1">Lý do</p>
                <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">
                  {selectedFine.reason === 'overdue' ? 'Quá hạn' : selectedFine.reason === 'damaged' ? 'Hư hại' : selectedFine.reason === 'lost' ? 'Mất' : selectedFine.reason}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-[12px] text-slate-500 uppercase font-semibold mb-1">Trạng thái</p>
                <StatusBadge config={getStatusConfig(FINE_STATUS, selectedFine.status)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-[12px] text-slate-500 uppercase font-semibold mb-1">Số tiền</p>
                <p className="text-[18px] font-bold text-slate-900 dark:text-slate-100">{formatMoney(selectedFine.amount)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-[12px] text-slate-500 uppercase font-semibold mb-1">Đã nộp</p>
                <p className="text-[18px] font-bold text-green-500">{formatMoney(selectedFine.paidAmount || 0)}</p>
              </div>
            </div>
            {selectedFine.notes && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-[12px] text-slate-500 uppercase font-semibold mb-1">Ghi chú</p>
                <p className="text-[13px] text-slate-600 dark:text-slate-300">{selectedFine.notes}</p>
              </div>
            )}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <p className="text-[12px] text-slate-500 uppercase font-semibold mb-1">Ngày tạo</p>
              <p className="text-[13px] text-slate-600 dark:text-slate-300">{new Date(selectedFine.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={paymentOpen} onClose={() => { setPaymentOpen(false); setSelectedFine(null); setPaymentAmount(''); setPaymentNotes(''); }} title="Ghi Nhận Thanh Toán" width="420px">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[13px] text-slate-500 mb-2">Phí phạt: <span className="font-semibold text-slate-900">{selectedFine ? formatMoney(selectedFine.amount) : ''}</span></p>
            <p className="text-[13px] text-slate-500 mb-3">Đã nộp: <span className="font-semibold text-green-500">{selectedFine ? formatMoney(selectedFine.paidAmount || 0) : ''}</span></p>
          </div>
          <div>
            <label style={labelStyle}>Số tiền thanh toán</label>
            <input style={inputStyle} type="number" min="1000" step="1000" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Nhập số tiền..." />
          </div>
          <div>
            <label style={labelStyle}>Ghi chú</label>
            <input style={inputStyle} type="text" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Ghi chú tùy chọn..." />
          </div>
          <button onClick={handlePayment} disabled={actionLoading || !paymentAmount}
            className="w-full h-[42px] rounded-lg bg-green-500 text-white text-[14px] font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer border-0 disabled:opacity-50">
            {actionLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
        </div>
      </Modal>

      {/* Waive Confirmation */}
      <ConfirmModal isOpen={waiveOpen} title="Miễn Phạt" danger={false}
        message={`Bạn có chắc chắn muốn miễn phí phạt "${formatMoney(selectedFine?.amount || 0)}" cho "${getReaderName(selectedFine || {} as Fine)}"?`}
        confirmLabel="Xác nhận miễn phạt" cancelLabel="Hủy" loading={actionLoading}
        onConfirm={handleWaive} onCancel={() => { setWaiveOpen(false); setSelectedFine(null); }} />

      {/* Delete Confirmation */}
      <ConfirmModal isOpen={deleteOpen} title="Xóa Phí Phạt" danger
        message={`Bạn có chắc chắn muốn xóa phí phạt "${formatMoney(selectedFine?.amount || 0)}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa" cancelLabel="Hủy" loading={actionLoading}
        onConfirm={handleDelete} onCancel={() => { setDeleteOpen(false); setSelectedFine(null); }} />

      {/* Create Fine Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Tạo Phí Phạt Mới" width="480px">
        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Độc giả</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={createForm.readerId} onChange={(e) => setCreateForm({ ...createForm, readerId: e.target.value })}>
              <option value="">Chọn độc giả...</option>
              {readers.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.readerType === 'student' ? 'SV' : 'GV'})</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Số tiền</label>
            <input style={inputStyle} type="number" min="1000" step="1000" value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} placeholder="Nhập số tiền..." />
          </div>
          <div>
            <label style={labelStyle}>Lý do</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={createForm.reason} onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}>
              <option value="overdue">Quá hạn</option>
              <option value="damaged">Hư hại</option>
              <option value="lost">Mất</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ghi chú</label>
            <input style={inputStyle} type="text" value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} placeholder="Ghi chú tùy chọn..." />
          </div>
          <button onClick={handleCreate} disabled={actionLoading}
            className="w-full h-[42px] rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer border-0 disabled:opacity-50">
            {actionLoading ? 'Đang tạo...' : 'Tạo phí phạt'}
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default FinesPage;
