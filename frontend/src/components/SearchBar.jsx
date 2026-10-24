import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, resultCount }) {
  return (
    <div className="relative max-w-xl mx-auto mb-6">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#7d776f] absolute left-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title, artist, or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-24 py-3 rounded-full bg-[#eee9df] border border-[#d6cfc4] text-xs text-[#1c1b18] placeholder-[#7d776f] focus:outline-none focus:border-[#1c1b18] transition-all shadow-sm"
        />
        
        {/* Right Info / Clear controls */}
        <div className="absolute right-3 flex items-center space-x-2">
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full bg-[#dcd5c9] text-[#1c1b18] hover:bg-[#1c1b18] hover:text-[#f6f3eb] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-2 py-0.5 rounded-full bg-[#e4ded4] border border-[#d6cfc4] text-[10px] font-mono text-[#7d776f] hidden sm:flex items-center space-x-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>SEARCH</span>
            </div>
          )}

          {resultCount !== undefined && searchQuery && (
            <span className="px-2 py-0.5 rounded-full bg-[#1c1b18] text-xs font-mono text-[#f6f3eb]">
              {resultCount} {resultCount === 1 ? 'track' : 'tracks'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

