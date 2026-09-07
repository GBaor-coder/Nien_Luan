import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Bell, Sun, Moon, Menu, ChevronDown, LogOut, User, Settings, ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../context/useAuth';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/dashboard/catalog': 'Kho sách',
  '/dashboard/categories': 'Quản lý danh mục',
  '/dashboard/authors': 'Tác giả',
  '/dashboard/publishers': 'Nhà xuất bản',
  '/dashboard/tags': 'Quản lý thẻ',
  '/dashboard/readers': 'Độc giả',
  '/dashboard/borrowing': 'Phiếu mượn',
  '/dashboard/reports': 'Báo cáo & Phân tích',
  '/dashboard/users': 'Quản lý Người dùng',
  '/dashboard/roles': 'Vai trò & Quyền hạn',
  '/dashboard/settings': 'Cài đặt',
};

interface TopNavProps {
  onMenuToggle: () => void;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const TopNav: React.FC<TopNavProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const title = pageTitles[location.pathname] || 'Tổng quan';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
      border-b border-slate-200 dark:border-slate-800">
      {/* Trái */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[19px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Phải */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tìm kiếm */}
        <div className="hidden md:flex items-center gap-2 pl-3 pr-2 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-blue-500/60 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors w-[240px] lg:w-[280px]">
          <Search size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-transparent border-0 outline-none text-[13px] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 w-full"
          />
          <kbd className="hidden lg:inline text-[11px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
            /
          </kbd>
        </div>

        {/* Đổi chủ đề */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer border-0 bg-transparent"
          title={isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Thông báo */}
        <button className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Hồ sơ */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
              {getInitials(user?.name || 'AD')}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                {user?.name || 'Người dùng'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{user?.email || ''}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lift border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {user?.name || 'Người dùng'}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{user?.email || ''}</p>
                </div>
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent text-left">
                  <User size={15} className="text-slate-400" />
                  Hồ sơ của tôi
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent text-left">
                  <ShieldCheck size={15} className="text-slate-400" />
                  Quyền & vai trò
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent text-left">
                  <Settings size={15} className="text-slate-400" />
                  Cài đặt
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer border-0 bg-transparent text-left"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
