import React from 'react';
import { Tag } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader';

const TagsPage: React.FC = () => {
  const sampleTags = [
    'Giao khoa', 'Tham khao', 'Tieu thuyet', 'Khoa hoc', 'Van hoc',
    'Ngoai ngu', 'Lap trinh', 'Phat trien ban than', 'Lich su', 'Tri hoc',
  ];

  return (
    <div>
      <PageHeader title="Quản lý thẻ" subtitle="Quản lý tag và nhãn phân loại sách." />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {sampleTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-[#1E3A8A]/20 text-blue-600 dark:text-[#93C5FD] text-[13px] font-medium border border-[#BFDBFE] dark:border-[#1E40AF]/30">
              <Tag size={13} />
              {tag}
            </span>
          ))}
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} className="text-amber-600 dark:text-amber-400" />
            <h4 className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">Tính năng đang phát triển</h4>
          </div>
          <p className="text-[12px] text-amber-700 dark:text-amber-400/80">
            Quản lý thẻ (tags) sẽ sớm được bổ sung đầy đủ chức năng: thêm, sửa, xóa tag và phân bổ tag cho sách.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
