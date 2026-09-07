import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCheck, BookMarked, AlertTriangle, RotateCcw, SearchX, ArrowRight } from 'lucide-react';

export interface BorrowFlowData {
  availableBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  returnedBooks: number;
  lostBooks: number;
}

interface Stage {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  value: number;
  alert?: boolean;
}

const BorrowFlowPipeline: React.FC<{ data: BorrowFlowData }> = ({ data }) => {
  const navigate = useNavigate();

  const total =
    data.availableBooks + data.borrowedBooks + data.overdueBooks + data.returnedBooks + data.lostBooks;

  const stages: Stage[] = [
    {
      key: 'available',
      label: 'Sách có sẵn',
      description: 'Sẵn sàng cho mượn',
      icon: <BookCheck size={20} />,
      color: '#22C55E',
      path: '/dashboard/catalog',
      value: data.availableBooks,
    },
    {
      key: 'active',
      label: 'Đang mượn',
      description: 'Trong tay độc giả',
      icon: <BookMarked size={20} />,
      color: '#2563EB',
      path: '/dashboard/borrowing/active',
      value: data.borrowedBooks,
    },
    {
      key: 'overdue',
      label: 'Quá hạn',
      description: 'Cần nhắc trả & xử lý',
      icon: <AlertTriangle size={20} />,
      color: '#EF4444',
      path: '/dashboard/borrowing/overdue',
      value: data.overdueBooks,
      alert: true,
    },
    {
      key: 'returned',
      label: 'Đã trả',
      description: 'Đã hoàn trả về kho',
      icon: <RotateCcw size={20} />,
      color: '#06B6D4',
      path: '/dashboard/borrowing/returned',
      value: data.returnedBooks,
    },
    {
      key: 'lost',
      label: 'Mất / Hỏng',
      description: 'Không khai thác được',
      icon: <SearchX size={20} />,
      color: '#6B7280',
      path: '/dashboard/borrowing',
      value: data.lostBooks,
    },
  ];

  const pct = (v: number) => (total > 0 ? ((v / total) * 100).toFixed(1) : '0.0');

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div>
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100">
            Luồng xử lý Mượn - Trả
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Vòng đời của sách qua các trạng thái trong hệ thống. Nhấp vào từng bước để xem chi tiết.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[12px] font-medium text-green-600 dark:text-green-400">
            Hệ thống đang hoạt động
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch gap-1.5">
        {stages.map((stage, i) => (
          <React.Fragment key={stage.key}>
            <button
              onClick={() => navigate(stage.path)}
              className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left group hover:-translate-y-0.5 hover:shadow-card-hover"
              style={{ borderColor: stage.alert ? '#FECACA' : '#E2E8F0', backgroundColor: `${stage.color}08` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = stage.color; }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = stage.alert ? '#FECACA' : '#E2E8F0';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${stage.color}18`, color: stage.color }}
              >
                {stage.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300 truncate">{stage.label}</p>
                <p className="text-[20px] font-bold leading-tight" style={{ color: stage.color }}>
                  {stage.value.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[12px] font-semibold" style={{ color: stage.color }}>{pct(stage.value)}%</span>
                <span className="text-[11px] text-slate-400 hidden xl:block truncate">{stage.description}</span>
              </div>
            </button>
            {i < stages.length - 1 && (
              <div className="flex items-center justify-center self-center flex-shrink-0 lg:w-8 py-1 lg:py-0">
                <ArrowRight size={18} className="text-slate-300 dark:text-slate-600 rotate-90 lg:rotate-0" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BorrowFlowPipeline;
