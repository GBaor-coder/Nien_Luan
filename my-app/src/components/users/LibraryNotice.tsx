import React from 'react';
import { Megaphone, ArrowRight, BookPlus, Wrench, FileText, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { libraryNotices } from '../../data/studentData';

const LibraryNotice: React.FC = () => {
  const navigate = useNavigate();

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'new_collection':
        return { icon: BookPlus, color: '#2563EB', bg: '#EFF6FF' };
      case 'maintenance':
        return { icon: Wrench, color: '#D97706', bg: '#FFFBEB' };
      case 'policy':
        return { icon: FileText, color: '#8B5CF6', bg: '#F3E8FF' };
      case 'event':
        return { icon: PartyPopper, color: '#16A34A', bg: '#F0FDF4' };
      default:
        return { icon: Megaphone, color: '#64748B', bg: '#F1F5F9' };
    }
  };

  return (
    <div className="col-span-12 lg:col-span-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Megaphone size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Thông báo thư viện</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{libraryNotices.filter(n => n.isNew).length} mới</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/notifications')}
            className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer border-0 bg-transparent"
          >
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {libraryNotices.slice(0, 4).map((notice) => {
            const config = getTypeConfig(notice.type);
            const Icon = config.icon;
            return (
              <div
                key={notice.id}
                className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                onClick={() => navigate('/user/notifications')}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon size={16} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">{notice.title}</h4>
                      {notice.isNew && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white flex-shrink-0">
                          MỚI
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notice.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(notice.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LibraryNotice;
