import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptText, AlarmClock, Wallet, ArrowRight, ExternalLink, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { studentService, type BorrowRecord, type Fine } from '../../services/student.service';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import BookCover from '../../components/ui/BookCover';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/admin/Toast';
import { FINE_STATUS, getStatusConfig } from '../../data/statusConfig';

const StudentFinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.student?.id || '';
  const teacherId = user?.teacher?.id || '';
  const readerId = user?.id || '';
  const hasReaderProfile = !!studentId || !!teacherId;

  const [activeTab, setActiveTab] = useState<'overdue' | 'fines'>('overdue');
  const [overdue, setOverdue] = useState<BorrowRecord[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasReaderProfile) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const [overdueRes, finesRes] = await Promise.all([
        studentService.getOverdueBorrowings(readerId, { limit: 50, studentId: studentId || undefined, teacherId: teacherId || undefined }),
        studentService.getMyFines(readerId, { limit: 50, studentId: studentId || undefined, teacherId: teacherId || undefined }),
      ]);
      setOverdue(overdueRes.data.data.records);
      setFines(finesRes.data.data.fines);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [hasReaderProfile, readerId, studentId, teacherId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const unpaidTotal = fines
    .filter((f) => f.status === 'pending' || f.status === 'unpaid' || f.status === 'partial' || f.status === 'partially_paid')
    .reduce((sum, f) => sum + (f.amount - (f.paidAmount || 0)), 0);

  const daysOverdue = (record: BorrowRecord) => {
    const due = new Date(record.dueDate);
    const now = new Date();
    return Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatMoney = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

  const stats = [
    { label: 'Sách quá hạn', value: overdue.length, icon: AlarmClock, color: '#DC2626', bg: '#FEF2F2' },
    { label: 'Tổng tiền phạt', value: fines.length ? formatMoney(fines.reduce((s, f) => s + f.amount, 0)) : '0đ', icon: ReceiptText, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Chưa nộp', value: formatMoney(unpaidTotal), icon: Wallet, color: '#D97706', bg: '#FFFBEB' },
  ];

  const tabStyle = (active: boolean) =>
    `px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors cursor-pointer border-0 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200'}`;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">Quá hạn & Phí phạt</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">Theo dõi sách quá hạn và các khoản phí cần thanh toán</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.bg }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className="text-[20px] font-bold text-slate-900 dark:text-slate-100">{loading ? '-' : stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button className={tabStyle(activeTab === 'overdue')} onClick={() => setActiveTab('overdue')}>
          Sách quá hạn ({overdue.length})
        </button>
        <button className={tabStyle(activeTab === 'fines')} onClick={() => setActiveTab('fines')}>
          Phí phạt ({fines.length})
        </button>
      </div>

      {loading ? (
        <LoadingState label="Đang tải dữ liệu phạt..." minHeight={320} />
      ) : error ? (
        <ErrorState
          title="Không thể tải dữ liệu phạt"
          description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại."
          onRetry={fetchData}
        />
      ) : activeTab === 'overdue' ? (
        overdue.length === 0 ? (
          <EmptyState
            icon={AlarmClock}
            title="Không có sách quá hạn"
            description="Bạn không có cuốn sách nào quá hạn trả."
          />
        ) : (
          <Card noPadding className="overflow-hidden">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {overdue.map((record) => {
                const days = daysOverdue(record);
                return (
                  <div key={record.id} className="flex items-center gap-4 px-6 py-4">
                    <BookCover
                      title={record.book?.title || ''}
                      coverImage={record.book?.coverImage}
                      coverColor={record.book?.coverColor}
                      className="w-12 h-16 rounded-lg"
                      textClassName="text-[10px]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 truncate">{record.book?.title || 'Unknown'}</h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">{record.book?.author?.name || ''}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hạn trả: {new Date(record.dueDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[12px] font-bold">
                        Quá hạn {days} ngày
                      </span>
                      <button
                        onClick={() => navigate('/user/borrowings')}
                        className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer border-0 bg-transparent ml-auto"
                      >
                        Xem phiếu <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )
      ) : (
        fines.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Không có phí phạt"
            description="Bạn hiện không có khoản phí nào cần thanh toán."
          />
        ) : (
          <Card noPadding className="overflow-hidden">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {fines.map((fine) => {
                const config = getStatusConfig(FINE_STATUS, fine.status);
                return (
                  <div key={fine.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                        {fine.borrowRecord?.book?.title || 'Khoản phạt'}
                      </h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">{fine.reason}</p>
                      {fine.notes && <p className="text-[11px] text-slate-400 mt-0.5">{fine.notes}</p>}
                    </div>
                    <div className="flex-shrink-0 text-right space-y-1">
                      <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{formatMoney(fine.amount)}</p>
                      <StatusBadge config={config} />
                      {(fine.status === 'pending' || fine.status === 'partial' || fine.status === 'partially_paid') && (
                        <button
                          onClick={() => setToast({ message: 'Vui lòng đến thư viện để nộp phí. Liên hệ thủ thư để được hỗ trợ.', type: 'success' })}
                          className="flex items-center gap-1 text-[11px] font-medium text-green-500 hover:text-green-600 cursor-pointer border-0 bg-transparent ml-auto"
                        >
                          <CreditCard size={10} /> Nộp phí
                        </button>
                      )}
                      {fine.borrowRecord && (
                        <button
                          onClick={() => navigate('/user/borrowings')}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer border-0 bg-transparent ml-auto"
                        >
                          Phiếu mượn <ExternalLink size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )
      )}

      {overdue.length > 0 && (
        <button
          onClick={() => navigate('/user/borrowings')}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer border-0 bg-transparent"
        >
          Đến phiếu mượn để gia hạn hoặc trả sách <ArrowRight size={14} />
        </button>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default StudentFinesPage;
