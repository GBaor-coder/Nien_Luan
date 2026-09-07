import React, { useState } from 'react';
import { Bell, Shield, Globe, Moon, Sun, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import Card from '../../components/ui/Card';

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
    <span className="text-[13px] text-slate-900 dark:text-slate-100">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer border-0 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
      aria-pressed={checked}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  </div>
);

interface Prefs {
  dueReminder: boolean;
  reservationUpdate: boolean;
  newBooks: boolean;
  libraryNews: boolean;
}

const DEFAULT_PREFS: Prefs = { dueReminder: true, reservationUpdate: true, newBooks: false, libraryNews: true };

const StudentSettingsPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      const saved = localStorage.getItem('settingsPrefs');
      return saved ? { ...DEFAULT_PREFS, ...(JSON.parse(saved) as Partial<Prefs>) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });
  const [saved, setSaved] = useState(false);

  const handlePrefChange = (key: keyof typeof prefs) => (value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('settingsPrefs', JSON.stringify(next));
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    {
      icon: Bell,
      bg: '#EFF6FF',
      color: '#2563EB',
      title: 'Thông báo',
      description: 'Chọn loại thông báo bạn muốn nhận',
      children: (
        <>
          <ToggleRow label="Nhắc nhở hạn trả" checked={prefs.dueReminder} onChange={handlePrefChange('dueReminder')} />
          <ToggleRow label="Cập nhật đặt chỗ" checked={prefs.reservationUpdate} onChange={handlePrefChange('reservationUpdate')} />
          <ToggleRow label="Thông báo sách mới" checked={prefs.newBooks} onChange={handlePrefChange('newBooks')} />
          <ToggleRow label="Thông báo thư viện" checked={prefs.libraryNews} onChange={handlePrefChange('libraryNews')} />
        </>
      ),
    },
    {
      icon: Shield,
      bg: '#F3E8FF',
      color: '#8B5CF6',
      title: 'Bảo mật & an toàn',
      description: 'Quản lý cài đặt bảo mật tài khoản',
      children: (
        <>
          <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
            <span className="text-[13px] text-slate-900 dark:text-slate-100">Đổi mật khẩu</span>
            <span className="text-[12px] text-blue-600 font-medium">Đặt lại</span>
          </div>
          <ToggleRow label="Xác thực hai yếu tố" checked={false} onChange={() => {}} />
        </>
      ),
    },
    {
      icon: Globe,
      bg: '#FFFBEB',
      color: '#D97706',
      title: 'Ngôn ngữ & khu vực',
      description: 'Đặt ngôn ngữ và tùy chỉnh khu vực',
      children: (
        <>
          {[
            ['Ngôn ngữ', 'Tiếng Việt'],
            ['Định dạng ngày', 'DD/MM/YYYY'],
            ['Múi giờ', 'Tự động (GMT+7)'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
              <span className="text-[13px] text-slate-900 dark:text-slate-100">{label}</span>
              <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{value}</span>
            </div>
          ))}
        </>
      ),
    },
    {
      icon: isDark ? Moon : Sun,
      bg: isDark ? '#334155' : '#F1F5F9',
      color: isDark ? '#93C5FD' : '#2563EB',
      title: 'Giao diện',
      description: 'Tùy chỉnh chế độ hiển thị',
      children: (
        <ToggleRow label="Chế độ tối" checked={isDark} onChange={() => toggleTheme()} />
      ),
    },
  ];

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">Cài đặt</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">Quản lý tùy chỉnh tài khoản của bạn</p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-[12px] font-semibold">
            <CheckCircle size={14} /> Đã lưu
          </span>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <Card key={i} noPadding className="overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: section.bg }}>
                  <Icon size={18} style={{ color: section.color }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">{section.title}</h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">{section.description}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">{section.children}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSettingsPage;
