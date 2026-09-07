import React from 'react';
import { BookPlus, UserPlus, FilePlus, BarChart3, FolderCog, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quickActions } from '../../data/mockData';

const iconMap: Record<string, React.ReactNode> = {
  BookPlus: <BookPlus size={18} />,
  UserPlus: <UserPlus size={18} />,
  FilePlus: <FilePlus size={18} />,
  BarChart3: <BarChart3 size={18} />,
  FolderCog: <FolderCog size={18} />,
};

const actionPaths: Record<string, string> = {
  1: '/dashboard/catalog',
  2: '/dashboard/readers',
  3: '/dashboard/borrowing/create',
  4: '/dashboard/reports',
  5: '/dashboard/categories',
};

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="card p-5">
      <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 mb-4">Thao tác nhanh</h3>
      <div className="flex flex-col gap-1.5">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(actionPaths[action.id] ?? '/dashboard')}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer border-0 bg-transparent text-left w-full
              hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
              style={{ backgroundColor: `${action.color}12`, color: action.color }}
            >
              {iconMap[action.icon]}
            </div>
            <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300 flex-1">
              {action.label}
            </span>
            <ChevronRight
              size={15}
              className="text-slate-300 dark:text-slate-600 transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
