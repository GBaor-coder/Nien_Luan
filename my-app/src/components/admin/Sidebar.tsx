import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FolderOpen, PenTool, Users, BookMarked, BarChart3,
  UserCog, Shield, Settings, ChevronLeft, ChevronRight, Library, ChevronDown,
  ClipboardList, FilePlus2, BookOpenCheck, BookCheck, AlertTriangle, RotateCcw,
  History, Building2, Tag, CalendarClock, type LucideIcon,
} from 'lucide-react';
import { navItems, type NavChild, type NavItem } from '../../data/mockData';

const iconComponents: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  PenTool,
  Users,
  BookMarked,
  BarChart3,
  UserCog,
  Shield,
  Settings,
  ClipboardList,
  FilePlus2,
  BookOpenCheck,
  BookCheck,
  AlertTriangle,
  RotateCcw,
  History,
  Building2,
  Tag,
  CalendarClock,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [flyout, setFlyout] = useState<{ item: NavItem; top: number } | null>(null);

  const activeParentLabel = navItems
    .flatMap((g) => g.items)
    .find((item) => item.children?.some((c) => location.pathname.startsWith(c.path)))?.label ?? null;

  const isPathActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  const isChildActive = (child: NavChild, parentPath: string) =>
    child.path === parentPath ? location.pathname === parentPath : location.pathname.startsWith(child.path);

  const handleParentClick = (item: NavItem, e: React.MouseEvent) => {
    if (collapsed && item.children?.length) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setFlyout(flyout?.item.label === item.label ? null : { item, top: rect.top });
      return;
    }
    if (item.children?.length) {
      setOpenGroup(openGroup === item.label ? null : item.label);
      return;
    }
    navigate(item.path);
  };

  const renderChild = (child: NavChild, parentPath: string, closeFlyout?: () => void) => {
    const childActive = isChildActive(child, parentPath);
    const childHovered = hoveredItem === child.label;
    const Icon = iconComponents[child.icon] || LayoutDashboard;
    return (
      <button
        key={child.label}
        onClick={() => { navigate(child.path); closeFlyout?.(); }}
        onMouseEnter={() => setHoveredItem(child.label)}
        onMouseLeave={() => setHoveredItem(null)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-150 cursor-pointer border-0 ${
          childActive
            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
            : childHovered
              ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <span className={`flex-shrink-0 ${childActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
          <Icon size={16} />
        </span>
        <span className="text-[13px] font-medium whitespace-nowrap">{child.label}</span>
      </button>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800`}
      style={{ width: collapsed ? '76px' : '280px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm shadow-blue-600/30 flex items-center justify-center flex-shrink-0">
          <Library size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-[15px] font-bold text-slate-900 dark:text-white whitespace-nowrap block leading-tight">
              Quản lý Thư viện
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap block">
              Trường học thông minh
            </span>
          </div>
        )}
      </div>

      {/* Điều hướng */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((group) => (
          <div key={group.group} className="mb-6 last:mb-2">
            {!collapsed && (
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openGroup === item.label || activeParentLabel === item.label;
              const isParentActive = hasChildren
                ? item.children!.some((c) => isChildActive(c, item.path))
                : isPathActive(item.path);
              const isHovered = hoveredItem === item.label;
              const Icon = iconComponents[item.icon] || LayoutDashboard;

              return (
                <div key={item.label}>
                  <button
                    onClick={(e) => handleParentClick(item, e)}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={collapsed ? item.label : undefined}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 cursor-pointer border-0 ${
                      isParentActive
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : isHovered
                          ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          : 'text-slate-500 dark:text-slate-400'
                    } ${collapsed ? 'justify-center' : 'justify-start'}`}
                  >
                    {/* Thanh báo active */}
                    {isParentActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-600" />
                    )}
                    <span className={`flex-shrink-0 ${isParentActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <Icon size={20} />
                    </span>
                    {!collapsed && (
                      <>
                        <span className="text-[14px] font-medium whitespace-nowrap flex-1 text-left">{item.label}</span>
                        {hasChildren && (
                          <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">
                            <ChevronDown
                              size={16}
                              className="transition-transform duration-300"
                              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            />
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {hasChildren && !collapsed && (
                    <div
                      className="grid transition-all duration-300 ease-in-out"
                      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <div className="pl-3 pt-1 pb-1 flex flex-col gap-0.5">
                          {item.children!.map((child) => renderChild(child, item.path))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Nút thu gọn */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-150 cursor-pointer border-0 bg-transparent ${collapsed ? 'justify-center' : 'justify-start'}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-[13px] font-medium">Thu gọn</span>}
        </button>
      </div>

      {/* Flyout submenu khi thu gọn */}
      {collapsed && flyout && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setFlyout(null)} />
          <div
            className="fixed z-50 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lift py-2"
            style={{ left: 84, top: flyout.top }}
          >
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {flyout.item.label}
            </p>
            <div className="flex flex-col px-1">
              {flyout.item.children!.map((child) => renderChild(child, flyout.item.path, () => setFlyout(null)))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
