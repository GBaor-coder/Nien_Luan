import React from 'react';
import { BookOpen, Library, Search, CalendarClock, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden animate-fade-in-left bg-[#0F2A6D]">
      {/* Nền gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB]" />

      {/* Lưới nền mờ */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* Khối sáng trang trí */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-[-80px] w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-1/4 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl" />

      {/* Thẻ nổi trang trí */}
      <div className="hidden xl:block absolute top-24 right-16 animate-float">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-tight">1.250+</p>
            <p className="text-[11px] text-white/70 leading-tight">Đầu sách số</p>
          </div>
        </div>
      </div>
      <div className="hidden xl:block absolute bottom-28 right-24 animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Search size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-tight">Tìm kiếm nhanh</p>
            <p className="text-[11px] text-white/70 leading-tight">Tất cả các loại tài liệu</p>
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 md:px-12 lg:px-16">
        <div className="max-w-lg text-center">
          {/* Logo */}
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
            <Library size={32} className="text-white" />
          </div>

          {/* Nhãn giới thiệu */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/15 mb-6">
            <Sparkles size={14} className="text-amber-300" />
            <span className="text-[12px] font-medium text-white/90">Thư viện thông minh cho giáo dục hiện đại</span>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-[34px] md:text-[42px] lg:text-[44px] font-bold text-white mb-5 leading-[1.15] tracking-tight">
            Hệ thống Quản lý
            <br />
            Thư viện Trường học
          </h1>

          {/* Mô tả */}
          <p className="text-[15px] md:text-[16px] text-white/75 leading-relaxed max-w-md mx-auto mb-8">
            Nền tảng quản lý thư viện toàn diện — giúp thủ thư quản lý kho sách, theo dõi mượn trả
            và kết nối bạn đọc với nguồn tri thức một cách hiệu quả.
          </p>

          {/* Danh sách tính năng */}
          <div className="flex flex-col items-center gap-3 mb-10">
            {[
              { icon: BookOpen, label: 'Mục lục số đầy đủ' },
              { icon: Search, label: 'Tìm kiếm thông minh' },
              { icon: CalendarClock, label: 'Đặt chỗ & gia hạn trực tuyến' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 w-full max-w-xs"
              >
                <Icon size={16} className="text-sky-200 flex-shrink-0" />
                <span className="text-[13px] font-medium text-white/90">{label}</span>
                <ArrowRight size={14} className="text-white/40 ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Dòng thống kê */}
          <div className="flex items-center justify-center gap-6 text-white">
            <div className="text-center">
              <p className="text-[22px] font-bold leading-tight">10k+</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wide mt-0.5">Độc giả</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-[22px] font-bold leading-tight">99%</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wide mt-0.5">Hài lòng</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-[22px] font-bold leading-tight">24/7</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wide mt-0.5">Truy cập</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chuyển màu xuống đáy */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroSection;
