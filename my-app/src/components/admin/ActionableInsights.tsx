import React from 'react';
import { AlertTriangle, Wallet, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ActionableInsightsProps {
  data: {
    overdueBooks: number;
    outstandingFines: number;
    readyForPickup: number;
    totalReservations: number;
  };
}

const ActionableInsights: React.FC<ActionableInsightsProps> = ({ data }) => {
  const navigate = useNavigate();

  const insights = [
    {
      icon: <AlertTriangle size={18} className="text-red-500" />,
      label: 'Phiếu quá hạn',
      value: data.overdueBooks,
      action: data.overdueBooks > 0 ? `Cần xử lý ${data.overdueBooks} phiếu` : 'Không có phiếu quá hạn',
      onClick: () => navigate('/dashboard/borrowing/overdue'),
      hasIssue: data.overdueBooks > 0,
    },
    {
      icon: <Wallet size={18} className="text-amber-500" />,
      label: 'Phạt chưa thanh toán',
      value: data.outstandingFines,
      action: data.outstandingFines > 0 ? `Tổng ${data.outstandingFines.toLocaleString()}₫` : 'Chưa có khoản phạt',
      onClick: () => navigate('/dashboard/reports'),
      hasIssue: data.outstandingFines > 0,
    },
    {
      icon: <Clock size={18} className="text-blue-600" />,
      label: 'Sẵn sàng nhận sách',
      value: data.readyForPickup,
      action: data.readyForPickup > 0 ? `${data.readyForPickup} đơn đặt chỗ` : 'Chưa có đơn hàng nào',
      onClick: () => navigate('/dashboard/borrowing'),
      hasIssue: data.readyForPickup > 0,
    },
    {
      icon: <AlertCircle size={18} className="text-violet-500" />,
      label: 'Tổng đặt chỗ',
      value: data.totalReservations,
      action: `${data.totalReservations} phiếu đặt chỗ`,
      onClick: () => navigate('/dashboard/borrowing'),
      hasIssue: false,
    },
  ];

  return (
    <div className="card p-5">
      <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 mb-4">Cần hành động</h3>
      <div className="flex flex-col gap-2">
        {insights.map((item) => (
          <div
            key={item.label}
            className={`group flex items-center gap-3 p-3 rounded-xl transition-colors border cursor-pointer ${
              item.hasIssue
                ? 'border-red-100 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10'
                : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
            onClick={item.onClick}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                {item.label}
              </p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                {item.action}
              </p>
            </div>
            {item.hasIssue && (
              <span className="text-[13px] font-bold text-red-500 flex-shrink-0">{item.value}</span>
            )}
            <ChevronRight size={15} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionableInsights;
