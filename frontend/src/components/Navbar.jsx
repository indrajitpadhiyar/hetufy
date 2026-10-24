import React, { useState } from 'react';
import { Search, X, ArrowUpRight, ListMusic } from 'lucide-react';

export function SidebarDock({ activeCategory, setActiveCategory }) {
  return null;
}

export default function Navbar({ searchQuery, setSearchQuery, activeCategory, setActiveCategory, onOpenPlaylists }) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="pt-6 pb-2 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between gap-6 py-4 border-b border-[#e2dad0]">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <a href="#" className="font-serif-editorial text-2xl md:text-3xl text-[#1c1b18] tracking-tight hover:opacity-80 transition-opacity font-normal">
            Mitter music
          </a>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-[0.2em] text-[#5e584f] uppercase">
          <button 
            onClick={() => setActiveCategory('All')} 
            className={`hover:text-[#1c1b18] transition-colors cursor-pointer ${activeCategory === 'All' ? 'text-[#1c1b18] border-b border-[#1c1b18] pb-0.5' : ''}`}
          >
            About
          </button>

          <button 
            onClick={() => setActiveCategory('Drive Music')} 
            className={`hover:text-[#1c1b18] transition-colors cursor-pointer ${activeCategory === 'Drive Music' ? 'text-[#1c1b18] border-b border-[#1c1b18] pb-0.5' : ''}`}
          >
            Blog
          </button>

          <button 
            onClick={onOpenPlaylists}
            className="flex items-center gap-1 hover:text-[#1c1b18] transition-colors cursor-pointer text-[#1c1b18] font-bold"
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlists</span>
          </button>

          <button 
            onClick={() => {
              const el = document.getElementById('library');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-[#1c1b18] transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right Section: Search & Book a Call Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Toggle */}
          <div className="relative flex items-center">
            {showSearch ? (
              <div className="flex items-center gap-2 bg-[#eee9df] border border-[#d6cfc4] rounded-full px-3 py-1.5 transition-all">
                <Search className="w-3.5 h-3.5 text-[#5e584f]" />
                <input 
                  type="text" 
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-32 md:w-48 bg-transparent text-xs text-[#1c1b18] placeholder-[#7d776f] focus:outline-none"
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-[#5e584f] hover:text-[#1c1b18]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowSearch(true)}
                className="p-2 text-[#5e584f] hover:text-[#1c1b18] transition-colors cursor-pointer rounded-full hover:bg-[#eee9df]"
                title="Search tracks"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Playlists Button on Mobile / Quick Launch */}
          <button
            onClick={onOpenPlaylists}
            className="inline-flex md:hidden items-center gap-1 px-3 py-1.5 rounded-full border border-[#1c1b18] text-[#1c1b18] text-xs font-bold"
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlists</span>
          </button>

          {/* Book A Call Pill Button */}
          <a
            href="#library"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('library');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-[#1c1b18] text-[#1c1b18] text-xs font-bold tracking-wider uppercase hover:bg-[#1c1b18] hover:text-[#f6f3eb] transition-all cursor-pointer shadow-sm"
          >
            <span>Book A Call</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </header>
  );
}



