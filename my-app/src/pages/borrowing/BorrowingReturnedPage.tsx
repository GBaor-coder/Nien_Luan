import React, { useState, useEffect, useCallback } from 'react';
import { BookCheck, Eye } from 'lucide-react';
import { borrowingService, type BorrowRecord } from '../../services/borrowing.service';
import PageHeader from '../../components/admin/PageHeader';
import SearchInput from '../../components/admin/SearchInput';
import StatusBadge from '../../components/admin/StatusBadge';
import BorrowRecordDetailModal from '../../components/admin/BorrowRecordDetailModal';
import { getReaderName } from '../../utils/borrowing';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';

const ROWS_PER_PAGE = 8;

const BorrowingReturnedPage: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<BorrowRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await borrowingService.getAll({ page, limit: ROWS_PER_PAGE, search: search || undefined, status: 'returned' });
      setRecords(res.data.data.records);
      setPagination({ total: res.data.data.pagination.total, page: res.data.data.pagination.page, totalPages: res.data.data.pagination.totalPages });
      setError(null);
    } catch {
      setError('Không thể tải danh sách phiếu đã trả');
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRecords(1), 300);
    return () => clearTimeout(timer);
  }, [fetchRecords]);

  const getBorrowDays = (r: BorrowRecord) => {
    const start = new Date(r.borrowDate).getTime();
    const end = r.returnDate ? new Date(r.returnDate).getTime() : new Date(r.borrowDate).getTime();
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div>
      <PageHeader title="Phiếu Đã Trả" subtitle="Danh sách phiếu mượn đã hoàn tất và trả sách." />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 pb-0">
          <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Tra cứu theo độc giả hoặc sách..." width="280px" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full mt-4">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Độc giả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Sách</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Ngày mượn</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Ngày trả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thời gian mượn</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{getReaderName(r)}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{r.book?.title || '-'}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-500">{new Date(r.borrowDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-500">{r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '-'}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-500">{getBorrowDays(r)} ngày</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3">
                    <button onClick={() => { setDetail(r); setDetailOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-0 bg-transparent" title="Xem chi tiết">
                      <Eye size={14} className="text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr><td colSpan={7} className="px-5 py-10 text-center"><div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="sm" /> <span className="text-[13px]">Đang tải...</span></div></td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={7} className="px-5 py-10"><ErrorState compact title={error} onRetry={() => fetchRecords(pagination.page)} /></td></tr>
              )}
              {!loading && !error && records.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center">
                  <span className="flex flex-col items-center gap-2 text-[13px] text-slate-400">
                    <BookCheck size={28} />
                    Chưa có phiếu mượn nào được trả
                  </span>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchRecords} />
      </div>

      <BorrowRecordDetailModal record={detail} isOpen={detailOpen} onClose={() => { setDetailOpen(false); setDetail(null); }} />
    </div>
  );
};

export default BorrowingReturnedPage;
