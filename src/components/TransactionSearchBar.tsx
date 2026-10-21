import React from 'react';
import { Search, X, Filter, Tag } from 'lucide-react';

interface TransactionSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  totalCount: number;
  filteredCount: number;
}

export const TransactionSearchBar: React.FC<TransactionSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  totalCount,
  filteredCount,
}) => {
  const isFiltered = searchQuery.trim().length > 0 || selectedCategory !== 'all';

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0E1522] p-4 space-y-3">
      {/* Top row: Search input + Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter transactions by merchant name (e.g., Netflix, Cloudflare) or category..."
            className="w-full bg-[#111827] border border-slate-700/80 rounded-lg pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Counter & Clear All */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs text-slate-400">
          <span className="font-mono-numbers">
            Showing <strong className="text-white">{filteredCount}</strong> of {totalCount} records
          </span>
          {isFiltered && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Tag Filter Strip */}
      <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] shrink-0 font-medium">
          <Tag className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
