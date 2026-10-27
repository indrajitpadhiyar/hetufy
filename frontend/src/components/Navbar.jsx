import React, { useState } from 'react';
import { Search, X, ArrowUpRight, ListMusic } from 'lucide-react';

export function SidebarDock({ activeCategory, setActiveCategory }) {
  return null;
}

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory, 
  onOpenPlaylists,
  theme = 'dark',
  setTheme = () => {}
}) {
  const [showSearch, setShowSearch] = useState(false);
  const isDark = theme === 'dark';

  return (
    <header className="pt-6 pb-2 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className={`flex items-center justify-between gap-6 py-4 border-b transition-colors duration-300 ${
        isDark ? 'border-white/10' : 'border-[#e2dad0]'
      }`}>
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <img 
            src="./idrmusic.png" 
            alt="IDRMusic" 
            className="w-8 h-8 rounded-lg object-contain" 
            onError={(e) => { 
              if (!e.target.src.includes('/idrmusic.png')) e.target.src = '/idrmusic.png'; 
            }} 
          />
          <a href="#" className={`font-serif-editorial text-2xl md:text-3xl tracking-tight hover:opacity-80 transition-all font-bold ${
            isDark ? 'text-white' : 'text-[#1c1b18]'
          }`}>
            IDRMusic
          </a>
        </div>

        {/* Navigation Links */}
        <nav className={`hidden md:flex items-center space-x-8 text-xs font-semibold tracking-[0.2em] uppercase transition-colors ${
          isDark ? 'text-zinc-400' : 'text-[#5e584f]'
        }`}>
          <button 
            onClick={() => setActiveCategory('All')} 
            className={`transition-colors cursor-pointer ${
              activeCategory === 'All' 
                ? (isDark ? 'text-white border-b border-amber-400 pb-0.5' : 'text-[#1c1b18] border-b border-[#1c1b18] pb-0.5')
                : (isDark ? 'hover:text-white' : 'hover:text-[#1c1b18]')
            }`}
          >
            About
          </button>

          <button 
            onClick={() => setActiveCategory('Drive Music')} 
            className={`transition-colors cursor-pointer ${
              activeCategory === 'Drive Music' 
                ? (isDark ? 'text-white border-b border-amber-400 pb-0.5' : 'text-[#1c1b18] border-b border-[#1c1b18] pb-0.5')
                : (isDark ? 'hover:text-white' : 'hover:text-[#1c1b18]')
            }`}
          >
            Blog
          </button>

          <button 
            onClick={onOpenPlaylists}
            className={`flex items-center gap-1 transition-colors cursor-pointer font-bold ${
              isDark ? 'text-zinc-200 hover:text-white' : 'text-[#1c1b18] hover:text-black'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlists</span>
          </button>

          <button 
            onClick={() => {
              const el = document.getElementById('library');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
            className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-[#1c1b18]'}`}
          >
            Contact
          </button>
        </nav>

        {/* Right Section: Search & Book a Call Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Toggle */}
          <div className="relative flex items-center">
            {showSearch ? (
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                isDark ? 'bg-[#1e2029] border border-white/15' : 'bg-[#eee9df] border border-[#d6cfc4]'
              }`}>
                <Search className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-400' : 'text-[#5e584f]'}`} />
                <input 
                  type="text" 
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className={`w-32 md:w-48 bg-transparent text-xs focus:outline-none ${
                    isDark ? 'text-white placeholder-zinc-500' : 'text-[#1c1b18] placeholder-[#7d776f]'
                  }`}
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className={`${isDark ? 'text-zinc-400 hover:text-white' : 'text-[#5e584f] hover:text-[#1c1b18]'}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowSearch(true)}
                className={`p-2 transition-colors cursor-pointer rounded-full ${
                  isDark ? 'text-zinc-300 hover:text-white hover:bg-white/10' : 'text-[#5e584f] hover:text-[#1c1b18] hover:bg-[#eee9df]'
                }`}
                title="Search tracks"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>


          {/* Playlists Button on Mobile / Quick Launch */}
          <button
            onClick={onOpenPlaylists}
            className={`inline-flex md:hidden items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold ${
              isDark ? 'border-white/20 text-white bg-white/5' : 'border-[#1c1b18] text-[#1c1b18]'
            }`}
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
            className={`hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full border text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm ${
              isDark 
                ? 'border-white/20 text-white hover:bg-white/10 hover:border-white/40' 
                : 'border-[#1c1b18] text-[#1c1b18] hover:bg-[#1c1b18] hover:text-[#f6f3eb]'
            }`}
          >
            <span>Book A Call</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}



