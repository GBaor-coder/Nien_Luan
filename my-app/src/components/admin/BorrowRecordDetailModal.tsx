import React from 'react';
import {
  User, BookOpen, Calendar, Clock, RefreshCw, Tag, Hash, FileText, Mail,
} from 'lucide-react';
import type { BorrowRecord } from '../../services/borrowing.service';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { getReaderName, getReaderTypeLabel } from '../../utils/borrowing';

interface BorrowRecordDetailModalProps {
  record: BorrowRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const cardStyle: React.CSSProperties = { backgroundColor: 'transparent', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' };

const BorrowRecordDetailModal: React.FC<BorrowRecordDetailModalProps> = ({ record, isOpen, onClose }) => {
  if (!record) return null;
  const readerEmail = record.reader?.email || record.student?.user?.email || record.teacher?.user?.email || '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Phiếu Mượn" width="640px">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-2"><User size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Độc giả</span></div>
            <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{getReaderName(record)}</p>
            <p className="text-[12px] text-slate-500">{getReaderTypeLabel(record)}</p>
            {readerEmail && (
              <p className="flex items-center gap-1.5 mt-1.5 text-[12px] text-slate-500"><Mail size={12} />{readerEmail}</p>
            )}
          </div>
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-2"><BookOpen size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Sách</span></div>
            <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{record.book?.title || '-'}</p>
            <p className="text-[12px] text-slate-500">ID: {record.bookId}</p>
            {record.book?.author && <p className="text-[12px] text-slate-500">Tác giả: {record.book.author.name}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-2"><Calendar size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Ngày mượn</span></div>
            <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{new Date(record.borrowDate).toLocaleDateString()}</p>
          </div>
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Hạn trả</span></div>
            <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{new Date(record.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
        {record.returnDate && (
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-2"><RefreshCw size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Ngày trả</span></div>
            <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{new Date(record.returnDate).toLocaleDateString()}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-2"><Tag size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Trạng thái</span></div>
            <StatusBadge status={record.status} />
          </div>
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-2"><Hash size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Gia hạn</span></div>
            <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100">{record.renewalCount || 0} / {record.maxRenewals || 2}</p>
          </div>
        </div>
        {record.notes && (
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-2"><FileText size={14} className="text-slate-500" /><span className="text-[12px] text-slate-500 uppercase font-semibold">Ghi chú</span></div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300">{record.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BorrowRecordDetailModal;
