import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  width?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Tìm kiếm...', width = '220px' }) => {
  return (
    <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-blue-500/60 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors">
      <Search size={15} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-0 outline-none text-[13px] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        style={{ width }}
      />
    </div>
  );
};

export default SearchInput;
