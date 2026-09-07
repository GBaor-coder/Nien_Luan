import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lift border border-slate-200 dark:border-slate-700 w-full mx-4 max-w-[400px] animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-[17px] font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">{message}</p>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary px-4"
            >
              Hủy
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="btn bg-red-500 text-white hover:bg-red-600 px-5 shadow-sm shadow-red-500/30"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
