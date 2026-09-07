import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import Button from './ui/Button';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../utils/error';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateUsername = (value: string): boolean => {
    return /^[A-Za-z0-9@.\-_]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { username?: string; password?: string; general?: string } = {};

    if (!username) {
      newErrors.username = 'Mã đăng nhập là bắt buộc';
    } else if (!validateUsername(username)) {
      newErrors.username = 'Mã đăng nhập không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await login(username, password);
        localStorage.setItem('rememberMe', String(rememberMe));
        const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        const targetPath = storedUser.role === 'admin' ? '/dashboard' : '/user';
        navigate(targetPath, { replace: true });
      } catch (err) {
        const msg = getErrorMessage(err, 'Đăng nhập thất bại. Vui lòng thử lại.');
        setErrors({ general: msg });
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('rememberMe', String(rememberMe));
  }, [rememberMe]);

  return (
    <div className="animate-fade-in w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
          Chào mừng trở lại
        </h1>
        <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Vui lòng đăng nhập để truy cập hệ thống. Tài khoản do quản trị viên tạo.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lỗi chung */}
        {errors.general && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-50 dark:bg-danger-700/20 border border-red-200 dark:border-danger-700/40 text-danger-600 dark:text-red-300 text-[13px]">
            <AlertCircle size={16} className="flex-shrink-0" />
            {errors.general}
          </div>
        )}

        {/* Mã đăng nhập */}
        <div>
          <label className="label-field" htmlFor="username">
            Mã đăng nhập<span className="text-danger ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail size={18} className={errors.username ? 'text-danger' : 'text-slate-400 dark:text-slate-500'} />
            </div>
            <input
              id="username"
              type="text"
              value={username}
              placeholder="Nhập mã đăng nhập"
              required
              className={`input-field pl-11 ${errors.username ? 'input-error' : ''}`}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
              }}
            />
          </div>
          {errors.username && (
            <p className="mt-1.5 text-[13px] text-danger-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertCircle size={14} className="flex-shrink-0" />
              {errors.username}
            </p>
          )}
        </div>

        {/* Mật khẩu */}
        <div>
          <label className="label-field" htmlFor="password">
            Mật khẩu<span className="text-danger ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock size={18} className={errors.password ? 'text-danger' : 'text-slate-400 dark:text-slate-500'} />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder="••••••••"
              required
              className={`input-field pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer border-0 bg-transparent"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-[13px] text-danger-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertCircle size={14} className="flex-shrink-0" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Ghi nhớ */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 accent-primary-600 cursor-pointer"
            />
            <span className="text-[14px] text-slate-500 dark:text-slate-400">Ghi nhớ đăng nhập</span>
          </label>
        </div>

        {/* Nút đăng nhập */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
          leftIcon={<LogIn size={18} />}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* Ghi chú */}
      <p className="mt-6 text-center text-[13px] text-slate-400 dark:text-slate-500">
        Tài khoản được tạo bởi quản trị viên. Vui lòng liên hệ thủ thư để được cấp tài khoản.
      </p>

      {/* Chân trang */}
      <p className="mt-6 text-center text-[12px] text-slate-400 dark:text-slate-600">
        &copy; 2026 Library Management System. All rights reserved.
      </p>
    </div>
  );
};

export default LoginForm;
