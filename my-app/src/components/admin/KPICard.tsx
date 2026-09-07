import React from 'react';
import { BookOpen, BookMarked, AlertTriangle, Users, TrendingUp, TrendingDown, Package, Wallet, Clock, UserCheck } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen size={22} />,
  BookMarked: <BookMarked size={22} />,
  AlertTriangle: <AlertTriangle size={22} />,
  Users: <Users size={22} />,
  Package: <Package size={22} />,
  Wallet: <Wallet size={22} />,
  Clock: <Clock size={22} />,
  UserCheck: <UserCheck size={22} />,
};

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, trend, icon, color }) => {
  const isUp = trend === 'up';

  return (
    <div className="card card-hover p-5 relative overflow-hidden group">
      {/* Điểm nhấn trang trí */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-[0.12] group-hover:opacity-[0.2] transition-opacity"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center relative"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {iconMap[icon]}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[12px] font-medium ${
              isUp ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-red-50 dark:bg-red-500/10 text-red-500'
            }`}
          >
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>

      <p className="text-[28px] font-bold text-slate-900 dark:text-white leading-tight mb-1 tracking-tight">
        {value}
      </p>
      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{title}</p>
    </div>
  );
};

export default KPICard;
