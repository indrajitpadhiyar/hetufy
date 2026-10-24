import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, resultCount, theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div className="relative max-w-xl mx-auto mb-6">
      <div className="relative flex items-center">
        <Search className={`w-4 h-4 absolute left-4 pointer-events-none ${isDark ? 'text-zinc-500' : 'text-[#7d776f]'}`} />
        <input
          type="text"
          placeholder="Search by title, artist, or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-11 pr-24 py-3 rounded-full text-xs transition-all shadow-sm focus:outline-none ${
            isDark 
              ? 'bg-[#1a1b24] border border-white/10 text-white placeholder-zinc-500 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30' 
              : 'bg-[#eee9df] border border-[#d6cfc4] text-[#1c1b18] placeholder-[#7d776f] focus:border-[#1c1b18]'
          }`}
        />
        
        {/* Right Info / Clear controls */}
        <div className="absolute right-3 flex items-center space-x-2">
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white' 
                  : 'bg-[#dcd5c9] text-[#1c1b18] hover:bg-[#1c1b18] hover:text-[#f6f3eb]'
              }`}
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono hidden sm:flex items-center space-x-1 ${
              isDark ? 'bg-white/5 border border-white/10 text-zinc-400' : 'bg-[#e4ded4] border border-[#d6cfc4] text-[#7d776f]'
            }`}>
              <SlidersHorizontal className="w-3 h-3" />
              <span>SEARCH</span>
            </div>
          )}

          {resultCount !== undefined && searchQuery && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
              isDark ? 'bg-amber-400 text-black' : 'bg-[#1c1b18] text-[#f6f3eb]'
            }`}>
              {resultCount} {resultCount === 1 ? 'track' : 'tracks'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

