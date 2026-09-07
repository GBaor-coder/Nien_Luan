import React, { useState } from 'react';
import { Save, Bell, Globe, Database, Shield } from 'lucide-react';
import { useTheme } from '../context/useTheme';
import PageHeader from '../components/admin/PageHeader';

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
  <button onClick={onToggle} className="relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0"
    style={{ backgroundColor: enabled ? '#2563EB' : '#CBD5E1' }}>
    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
      style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }} />
  </button>
);

const SettingsPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const tabs = [
    { key: 'general', label: 'Chung', icon: <Globe size={16} /> },
    { key: 'notifications', label: 'Thông báo', icon: <Bell size={16} /> },
    { key: 'security', label: 'Bảo mật', icon: <Shield size={16} /> },
    { key: 'system', label: 'Hệ thống', icon: <Database size={16} /> },
  ];

  const inputStyle: React.CSSProperties = { width: '100%', height: '40px', padding: '0 12px', fontSize: '14px', border: '2px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: 'transparent', color: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#475569' };
  const sectionStyle: React.CSSProperties = { marginBottom: '32px' };
  const sectionTitle: React.CSSProperties = { fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' };

  return (
    <div>
      <PageHeader title="Cài đặt" subtitle="Cấu hình hệ thống quản lý thư viện." />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-0 text-left"
                style={{
                  backgroundColor: activeTab === tab.key ? '#EFF6FF' : 'transparent',
                  color: activeTab === tab.key ? '#2563EB' : '#64748B',
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {activeTab === 'general' && (
              <>
                <h3 style={sectionTitle}>Cài đặt Chung</h3>
                <div style={sectionStyle}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label style={labelStyle}>Tên Thư viện</label><input style={inputStyle} defaultValue="Thư viện Đại học" /></div>
                    <div><label style={labelStyle}>Email Liên hệ</label><input style={inputStyle} type="email" defaultValue="admin@lib.edu" /></div>
                    <div><label style={labelStyle}>Điện thoại</label><input style={inputStyle} defaultValue="0123-456-789" /></div>
                    <div><label style={labelStyle}>Địa chỉ</label><input style={inputStyle} defaultValue="123 Đường Đại học" /></div>
                  </div>
                </div>

                <h3 style={sectionTitle}>Giao diện</h3>
                <div style={sectionStyle}>
                  <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9] dark:border-slate-700">
                    <div>
                      <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">Chế độ Tối</p>
                      <p className="text-[12px] text-slate-500">Chuyển đổi giữa giao diện sáng và tối</p>
                    </div>
                    <Toggle enabled={isDark} onToggle={toggleTheme} />
                  </div>
                </div>

                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
                  <Save size={15} /> {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
                </button>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h3 style={sectionTitle}>Tùy chọn Thông báo</h3>
                <div style={sectionStyle} className="flex flex-col gap-1">
                  {[
                    { label: 'Thông báo Email', desc: 'Nhận cảnh báo qua email cho các sự kiện quan trọng', default: true },
                    { label: 'Nhắc nhở Quá hạn', desc: 'Thông báo khi sách quá hạn trả', default: true },
                    { label: 'Cảnh báo Thành viên mới', desc: 'Thông báo khi độc giả mới đăng ký', default: false },
                    { label: 'Cập nhật Hệ thống', desc: 'Nhận thông báo về thay đổi hệ thống', default: true },
                    { label: 'Báo cáo Hàng tuần', desc: 'Nhận báo cáo tổng hợp hàng tuần qua email', default: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] dark:border-slate-700 last:border-0">
                      <div>
                        <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                        <p className="text-[12px] text-slate-500">{item.desc}</p>
                      </div>
                      <Toggle enabled={item.default} onToggle={() => {}} />
                    </div>
                  ))}
                </div>
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
                  <Save size={15} /> {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
                </button>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h3 style={sectionTitle}>Cài đặt Bảo mật</h3>
                <div style={sectionStyle}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label style={labelStyle}>Mật khẩu Hiện tại</label><input style={inputStyle} type="password" placeholder="••••••••" /></div>
                    <div><label style={labelStyle}>Mật khẩu Mới</label><input style={inputStyle} type="password" placeholder="••••••••" /></div>
                  </div>
                </div>
                <h3 style={sectionTitle}>Cài đặt Phiên</h3>
                <div style={sectionStyle}>
                  <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9] dark:border-slate-700">
                    <div>
                      <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">Xác thực Hai yếu tố</p>
                      <p className="text-[12px] text-slate-500">Thêm lớp bảo mật bổ sung</p>
                    </div>
                    <Toggle enabled={false} onToggle={() => {}} />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">Đăng xuất Tự động</p>
                      <p className="text-[12px] text-slate-500">Đăng xuất tự động sau 30 phút không hoạt động</p>
                    </div>
                    <Toggle enabled={true} onToggle={() => {}} />
                  </div>
                </div>
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
                  <Save size={15} /> {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
                </button>
              </>
            )}

            {activeTab === 'system' && (
              <>
                <h3 style={sectionTitle}>Thông tin Hệ thống</h3>
                <div style={sectionStyle}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Phiên bản', value: '2.4.0' },
                      { label: 'Cập nhật lần cuối', value: '2026-07-16' },
                      { label: 'Cơ sở dữ liệu', value: 'PostgreSQL 16' },
                      { label: 'Dung lượng đã dùng', value: '2.4 GB / 10 GB' },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                        <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <h3 style={sectionTitle}>Bảo trì</h3>
                <div style={sectionStyle}>
                  <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9] dark:border-slate-700">
                    <div>
                      <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">Sao lưu Tự động</p>
                      <p className="text-[12px] text-slate-500">Sao lưu hàng ngày lúc 2:00 sáng</p>
                    </div>
                    <Toggle enabled={true} onToggle={() => {}} />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">Bộ nhớ đệm</p>
                      <p className="text-[12px] text-slate-500">Xóa bộ nhớ đệm hệ thống để giải phóng dung lượng</p>
                    </div>
                    <button onClick={() => alert('Đã xóa bộ nhớ đệm!')} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer bg-transparent">
                      Xóa bộ nhớ đệm
                    </button>
                  </div>
                </div>
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors cursor-pointer border-0">
                  <Save size={15} /> {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
