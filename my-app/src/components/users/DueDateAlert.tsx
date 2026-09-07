import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BorrowRecord } from '../../services/student.service';
import Spinner from '../ui/Spinner';

interface DueDateAlertProps {
  borrowings: BorrowRecord[];
  loading: boolean;
}

const DueDateAlert: React.FC<DueDateAlertProps> = ({ borrowings, loading }) => {
  const navigate = useNavigate();

  const getRemainingHours = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60));
  };

  const alerts = borrowings
    .map(b => ({
      ...b,
      remainingHours: getRemainingHours(b.dueDate),
      level: getRemainingHours(b.dueDate) < 0 ? 'overdue' : getRemainingHours(b.dueDate) < 72 ? 'critical' : 'warning',
    }))
    .filter(b => b.level === 'overdue' || b.level === 'critical')
    .slice(0, 3);

  const formatTime = (hours: number) => {
    if (hours < 0) {
      const days = Math.ceil(Math.abs(hours) / 24);
      return `Quá hạn ${days} ngày`;
    }
    const days = Math.ceil(hours / 24);
    return `Còn ${days} ngày`;
  };

  const levelStyle = (level: string) =>
    level === 'overdue'
      ? { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' }
      : { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' };

  if (loading) {
    return (
      <div className="col-span-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) return null;

  const config = levelStyle(alerts[0].level);

  return (
    <div className="col-span-12">
      <div className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4" style={{ backgroundColor: config.bg, borderColor: config.border }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'white' }}>
            <AlertTriangle size={20} style={{ color: config.text }} />
          </div>
          <div>
            <p className="text-[14px] font-bold" style={{ color: config.text }}>
              {alerts.length} cuốn sách {alerts[0].level === 'overdue' ? 'quá hạn trả' : 'sắp đến hạn trả'}
            </p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              {alerts.map(a => a.book?.title).filter(Boolean).join(', ')} — {alerts[0].remainingHours < 0 ? 'vui lòng trả ngay để tránh phát sinh phí phạt' : 'hãy gia hạn hoặc trả sách đúng hạn'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0">
          {alerts.map((a) => {
            const lvl = levelStyle(a.level);
            return (
              <span key={a.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[12px] font-bold" style={{ color: lvl.text }}>
                <Clock size={13} /> {formatTime(a.remainingHours)}
              </span>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/user/fines')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[13px] font-semibold transition-colors cursor-pointer border-0 flex-shrink-0"
          style={{ backgroundColor: config.text }}
        >
          Xem chi tiết <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default DueDateAlert;
