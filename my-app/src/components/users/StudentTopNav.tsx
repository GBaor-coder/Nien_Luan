import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, ChevronDown, LogOut, User, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/useTheme';
import { studentService } from '../../services/student.service';

const pageTitles: Record<string, string> = {
  '/user': 'Tổng quan',
  '/user/catalog': 'Tìm & mượn sách',
  '/user/borrowings': 'Phiếu mượn của tôi',
  '/user/reservations': 'Đặt chỗ',
  '/user/fines': 'Quá hạn & Phí',
  '/user/resources': 'Tài nguyên Số',
  '/user/history': 'Lịch sử Đọc',
  '/user/notifications': 'Thông báo',
  '/user/profile': 'Hồ sơ',
  '/user/settings': 'Cài đặt',
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

interface StudentTopNavProps {
  onMenuToggle: () => void;
}

const StudentTopNav: React.FC<StudentTopNavProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const title = pageTitles[location.pathname] || 'Tổng quan';

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await studentService.getUnreadCount();
      setUnreadCount(res.data.data.count);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchUnreadCount(), 0);
    return () => clearTimeout(timer);
  }, [fetchUnreadCount, location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/user/catalog?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    } else {
      navigate('/user/catalog');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
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
        <div>
          <h1 className="text-[19px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 leading-tight">
            {getGreeting()}, {user?.name?.split(' ').pop() || 'bạn'}
          </p>
        </div>
      </div>

      {/* Phải */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tìm sách */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center gap-2 pl-3 pr-2 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-violet-500/60 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors w-[220px] lg:w-[260px]"
        >
          <Search size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm sách, tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-0 outline-none text-[13px] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 w-full"
          />
        </form>

        {/* Đổi chủ đề */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer border-0 bg-transparent"
          title={isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Thông báo */}
        <button
          onClick={() => navigate('/user/notifications')}
          className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
          title="Thông báo"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Hồ sơ */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                {user?.name || 'Độc giả'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{user?.email || ''}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 hidden md:block" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lift border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {user?.name || 'Độc giả'}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => { setShowProfile(false); navigate('/user/profile'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent text-left"
                >
                  <User size={15} className="text-slate-400" />
                  Hồ sơ của tôi
                </button>
                <button
                  onClick={() => { setShowProfile(false); navigate('/user/settings'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent text-left"
                >
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

export default StudentTopNav;
