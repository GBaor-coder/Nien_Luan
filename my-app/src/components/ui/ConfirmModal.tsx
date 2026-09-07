import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Spinner from './Spinner';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md p-6"
        style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-50 dark:bg-red-500/20' : 'bg-blue-50 dark:bg-blue-500/20'}`}>
          <AlertTriangle size={24} className={danger ? 'text-red-500' : 'text-blue-600'} />
        </div>
        <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[13px] font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer border-0"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 rounded-lg text-white text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer border-0 disabled:opacity-50 inline-flex items-center gap-2 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading && <Spinner size="xs" />}
            {loading ? 'Đang xử lý…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
