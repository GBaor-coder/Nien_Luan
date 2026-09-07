import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { History, BookOpen, BookCheck, RotateCcw, User } from 'lucide-react';
import { borrowingService } from '../../services/borrowing.service';
import { getReaderName } from '../../utils/borrowing';
import PageHeader from '../../components/admin/PageHeader';
import SearchInput from '../../components/admin/SearchInput';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';

interface HistoryEvent {
  id: string;
  action: 'borrow' | 'return' | 'renew';
  date: string;
  reader: string;
  book: string;
  actor: string;
  note?: string;
}

const actionConfig: Record<HistoryEvent['action'], { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  borrow: { label: 'Mượn sách', bg: '#EFF6FF', text: '#1D4ED8', icon: <BookOpen size={14} /> },
  return: { label: 'Trả sách', bg: '#F0FDF4', text: '#16A34A', icon: <BookCheck size={14} /> },
  renew: { label: 'Gia hạn', bg: '#FFFBEB', text: '#D97706', icon: <RotateCcw size={14} /> },
};

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'borrow', label: 'Mượn' },
  { key: 'return', label: 'Trả' },
  { key: 'renew', label: 'Gia hạn' },
];

const BorrowingHistoryPage: React.FC = () => {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await borrowingService.getAll({ page: 1, limit: 100 });
      const list: HistoryEvent[] = [];
      res.data.data.records.forEach((r) => {
        const reader = getReaderName(r);
        const book = r.book?.title || '-';
        list.push({ id: `${r.id}-b`, action: 'borrow', date: r.borrowDate, reader, book, actor: 'Admin' });
        const renewCount = r.renewalCount || 0;
        for (let i = 1; i <= renewCount; i++) {
          list.push({ id: `${r.id}-r${i}`, action: 'renew', date: r.dueDate, reader, book, actor: 'Admin', note: `Gia hạn lần ${i}` });
        }
        if (r.returnDate) {
          list.push({ id: `${r.id}-t`, action: 'return', date: r.returnDate, reader, book, actor: 'Admin' });
        }
      });
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(list);
      setError(null);
    } catch {
      setError('Không thể tải lịch sử mượn trả');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchHistory, 0);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchFilter = filter === 'all' || e.action === filter;
      const matchSearch = !q || e.reader.toLowerCase().includes(q) || e.book.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [events, filter, search]);

  const counts = useMemo(() => ({
    all: events.length,
    borrow: events.filter((e) => e.action === 'borrow').length,
    return: events.filter((e) => e.action === 'return').length,
    renew: events.filter((e) => e.action === 'renew').length,
  }), [events]);

  return (
    <div>
      <PageHeader title="Lịch Sử Mượn Trả" subtitle="Nhật ký toàn bộ hoạt động mượn và trả sách." />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer border-0"
                style={{
                  backgroundColor: filter === t.key ? '#2563EB' : 'transparent',
                  color: filter === t.key ? '#fff' : '#64748B',
                }}
              >
                {t.label} ({counts[t.key as keyof typeof counts]})
              </button>
            ))}
          </div>
          <div className="sm:ml-auto">
            <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Tìm theo độc giả hoặc sách..." width="260px" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thời gian</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Thao tác</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Độc giả</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Sách</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-400">Người thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="sm" /> <span className="text-[13px]">Đang tải...</span></div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10"><ErrorState compact title={error} onRetry={fetchHistory} /></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-slate-400">
                    <span className="flex flex-col items-center gap-2"><History size={28} /> Không có hoạt động nào khớp</span>
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const cfg = actionConfig[e.action];
                  return (
                    <tr key={e.id} className="border-b border-[#F8FAFC] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <td className="px-5 py-3 text-[13px] text-slate-500 whitespace-nowrap">
                        {new Date(e.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                        <span className="text-[11px] text-slate-400 ml-1.5">{new Date(e.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{e.reader}</td>
                      <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300 max-w-[220px] truncate">
                        {e.book}
                        {e.note && <span className="block text-[11px] text-slate-400">{e.note}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-[12px] text-slate-500"><User size={12} /> {e.actor}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <p className="px-5 py-3 text-[12px] text-slate-400">Hiển thị {filtered.length}/{events.length} sự kiện</p>
        )}
      </div>
    </div>
  );
};

export default BorrowingHistoryPage;
