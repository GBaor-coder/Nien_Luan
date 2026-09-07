import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Library, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { studentNavItems, teacherNavItems } from '../../data/studentNav';
import { useAuth } from '../../context/useAuth';

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

  const isActive = (path: string) =>
    path === '/user' ? location.pathname === '/user' : location.pathname.startsWith(path);

  return (
    <aside
      className="fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
      style={{ width: collapsed ? '76px' : '280px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-sm shadow-violet-600/30 flex items-center justify-center flex-shrink-0">
          <Library size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-[15px] font-bold text-slate-900 dark:text-white whitespace-nowrap block leading-tight">
              Thư viện số
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap block">
              Cổng Độc giả
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-6">
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const active = isActive(item.path);
            const hovered = hoveredItem === item.label;
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                title={collapsed ? item.label : undefined}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 cursor-pointer border-0 ${
                  active
                    ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    : hovered
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      : 'text-slate-500 dark:text-slate-400'
                } ${collapsed ? 'justify-center' : 'justify-start'}`}
              >
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-violet-600" />
                )}
                <span className={`flex-shrink-0 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  <Icon size={20} />
                </span>
                {!collapsed && (
                  <span className="text-[14px] font-medium whitespace-nowrap text-left flex-1">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse + Logout */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 space-y-1">
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }); }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150 cursor-pointer border-0 bg-transparent ${collapsed ? 'justify-center' : 'justify-start'}`}
          title="Đăng xuất"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-[13px] font-medium">Đăng xuất</span>}
        </button>
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-150 cursor-pointer border-0 bg-transparent ${collapsed ? 'justify-center' : 'justify-start'}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-[13px] font-medium">Thu gọn</span>}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
