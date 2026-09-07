import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RecentActivity } from '../../services/dashboard.service';

interface RecentActivityTableProps {
  data?: RecentActivity[];
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  success: { bg: '#F0FDF4', color: '#16A34A', label: 'Thành công' },
  pending: { bg: '#FFFBEB', color: '#D97706', label: 'Chờ xử lý' },
  returned: { bg: '#EFF6FF', color: '#2563EB', label: 'Đã trả' },
  overdue: { bg: '#FEF2F2', color: '#DC2626', label: 'Quá hạn' },
  active: { bg: '#F0FDF4', color: '#16A34A', label: 'Đang mượn' },
  lost: { bg: '#F3F4F6', color: '#6B7280', label: 'Mất' },
};

const getStatusStyle = (status: string) => statusStyles[status] || { bg: '#F1F5F9', color: '#64748B', label: status };

const ROWS_PER_PAGE = 5;

const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ data = [] }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof RecentActivity>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let dataArr = [...data];
    if (search) {
      const q = search.toLowerCase();
      dataArr = dataArr.filter(
        (r) =>
          r.reader.toLowerCase().includes(q) ||
          r.bookTitle.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q),
      );
    }
    dataArr.sort((a, b) => {
      const av = a[sortKey] as string;
      const bv = b[sortKey] as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return dataArr;
  }, [search, sortKey, sortDir, data]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleSort = (key: keyof RecentActivity) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const columns: { key: keyof RecentActivity; label: string }[] = [
    { key: 'id', label: 'Mã giao dịch' },
    { key: 'reader', label: 'Độc giả' },
    { key: 'bookTitle', label: 'Tên sách' },
    { key: 'action', label: 'Hành động' },
    { key: 'date', label: 'Ngày' },
    { key: 'status', label: 'Trạng thái' },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between p-5 pb-0">
        <div>
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100">
            Hoạt động Gần đây
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Các giao dịch mượn trả mới nhất</p>
        </div>
        <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-blue-500/60 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors">
          <Search size={14} className="text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm giao dịch..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent border-0 outline-none text-[13px] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            style={{ width: '170px' }}
          />
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="table-head cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={12} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => {
              const st = getStatusStyle(row.status);
              return (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <td className="table-cell font-mono font-medium text-slate-900 dark:text-slate-100">{row.id}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{row.reader}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{row.bookTitle}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{row.action}</td>
                  <td className="table-cell text-slate-500 dark:text-slate-400">{row.date}</td>
                  <td className="table-cell">
                    <span
                      className="inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          Hiển thị {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)} -{' '}
          {Math.min(page * ROWS_PER_PAGE, filtered.length)} trên {filtered.length} giao dịch
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-0 ${
                p === page
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityTable;
