import React, { useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { studentService, type Notification } from '../../services/student.service';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

const StudentNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [notifRes, countRes] = await Promise.all([
        studentService.getMyNotifications({ limit: 50 }),
        studentService.getUnreadCount(),
      ]);
      setNotifications(notifRes.data.data.notifications);
      setUnreadCount(countRes.data.data.count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchNotifications(), 0);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await studentService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await studentService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'warning': return { icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB' };
      case 'error': return { icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2' };
      case 'success': return { icon: CheckCircle, color: '#16A34A', bg: '#F0FDF4' };
      default: return { icon: Info, color: '#2563EB', bg: '#EFF6FF' };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">Thông báo</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 dark:bg-slate-700 text-[13px] font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer border-0"
          >
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState label="Đang tải thông báo..." minHeight={320} />
      ) : error ? (
        <ErrorState
          title="Không thể tải thông báo"
          description="Đã có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại."
          onRetry={fetchNotifications}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Chưa có thông báo nào"
          description="Các cập nhật về phiếu mượn, đặt chỗ và thông báo thư viện sẽ hiển thị tại đây."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {notifications.map((notif) => {
              const config = getTypeConfig(notif.type);
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''} hover:bg-slate-50 dark:hover:bg-slate-900`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.bg }}>
                    <Icon size={18} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{notif.title}</h4>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />}
                    </div>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatTime(notif.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentNotificationsPage;
