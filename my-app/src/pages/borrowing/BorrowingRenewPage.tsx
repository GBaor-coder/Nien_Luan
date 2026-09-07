import React, { useState, useEffect } from 'react';
import { RotateCcw, CalendarDays, FileText, BookOpenCheck, ChevronRight } from 'lucide-react';
import { borrowingService, type BorrowRecord } from '../../services/borrowing.service';
import { getReaderName, getReaderTypeLabel } from '../../utils/borrowing';
import PageHeader from '../../components/admin/PageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import { getErrorMessage } from '../../utils/error';

const inputStyle: React.CSSProperties = { width: '100%', height: '42px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const BorrowingRenewPage: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [selected, setSelected] = useState<BorrowRecord | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowingService.getAll({ page: 1, limit: 100, status: 'active' });
      const eligible = res.data.data.records.filter((r) => (r.renewalCount || 0) < (r.maxRenewals || 2));
      setRecords(eligible);
    } catch {
      setError('Không thể tải danh sách phiếu mượn');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchRecords, 0);
    return () => clearTimeout(timer);
  }, []);

  const selectRecord = (r: BorrowRecord) => {
    setSelected(r);
    setDueDate(addDays(r.dueDate, 14));
    setNotes(`Gia hạn phiếu mượn - lần ${(r.renewalCount || 0) + 1}`);
  };

  const handleSubmit = async () => {
    if (!selected) {
      setToast({ message: 'Vui lòng chọn phiếu cần gia hạn', type: 'error' });
      return;
    }
    if (!dueDate) {
      setToast({ message: 'Vui lòng chọn hạn trả mới', type: 'error' });
      return;
    }
    if (new Date(dueDate) <= new Date()) {
      setToast({ message: 'Hạn trả mới phải sau ngày hiện tại', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await borrowingService.renewBook(selected.id, { dueDate, notes: notes || undefined });
      setToast({ message: `Đã gia hạn phiếu của "${getReaderName(selected)}" đến ${new Date(dueDate).toLocaleDateString()}`, type: 'success' });
      const updated = records.map((r) => (r.id === selected.id ? { ...r, dueDate, renewalCount: (r.renewalCount || 0) + 1, notes: notes || r.notes } : r));
      setRecords(updated);
      setSelected(null);
      setDueDate('');
      setNotes('');
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Gia hạn thất bại'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Gia Hạn Phiếu Mượn" subtitle="Kéo dài thời gian mượn cho các phiếu đang hoạt động." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eligible list */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Chọn phiếu cần gia hạn</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Chỉ hiển thị phiếu đang mượn còn lượt gia hạn</p>
          </div>
          <div className="p-3 flex flex-col gap-1.5 max-h-[520px] overflow-y-auto">
            {loading ? (
              <LoadingState label="Đang tải phiếu mượn..." minHeight={320} size="md" />
            ) : error ? (
              <ErrorState title={error} description="Không thể tải danh sách phiếu đang mượn" onRetry={fetchRecords} />
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                <BookOpenCheck size={30} />
                <p className="text-[13px]">Không có phiếu nào đủ điều kiện gia hạn</p>
              </div>
            ) : (
              records.map((r) => {
                const active = selected?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => selectRecord(r)}
                    className="w-full text-left p-3.5 rounded-xl border-2 transition-all duration-150 cursor-pointer"
                    style={{
                      borderColor: active ? '#2563EB' : '#E2E8F0',
                      backgroundColor: active ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{getReaderName(r)}</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500"><ChevronRight size={13} /></span>
                    </div>
                    <p className="text-[12px] text-slate-500 mb-2 line-clamp-1">{r.book?.title || '-'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Hạn trả: {new Date(r.dueDate).toLocaleDateString()}</span>
                      <span className="text-[11px] font-medium text-blue-600">Gia hạn {r.renewalCount || 0}/{r.maxRenewals || 2}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Renewal form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 h-fit">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mb-4">Thông tin gia hạn</h3>
          {!selected ? (
            <div className="flex flex-col items-center gap-3 py-14 text-slate-400">
              <RotateCcw size={34} />
              <p className="text-[13px] text-center max-w-[260px]">Chọn một phiếu mượn ở bên trái để bắt đầu gia hạn</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{getReaderName(selected)}</p>
                  <StatusBadge status={selected.status} />
                </div>
                <p className="text-[12px] text-slate-500 mb-3">{selected.book?.title} · {getReaderTypeLabel(selected)}</p>
                <div className="flex items-center gap-4 text-[12px] text-slate-500">
                  <span>Hạn trả hiện tại: <b className="text-slate-900 dark:text-slate-100">{new Date(selected.dueDate).toLocaleDateString()}</b></span>
                  <span>Đã gia hạn: <b className="text-blue-600">{selected.renewalCount || 0}/{selected.maxRenewals || 2}</b></span>
                </div>
              </div>
              <div>
                <label style={labelStyle}><CalendarDays size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />Hạn trả mới</label>
                <input style={inputStyle} type="date" min={new Date().toISOString().split('T')[0]} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}><FileText size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />Ghi chú lý do</label>
                <input style={inputStyle} type="text" placeholder="Lý do gia hạn..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full h-[46px] rounded-lg bg-[#F59E0B] text-white text-[14px] font-semibold hover:bg-[#D97706] transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Spinner size="sm" /> : <RotateCcw size={18} />}
                {submitting ? 'Đang gia hạn...' : 'Xác nhận gia hạn'}
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BorrowingRenewPage;
