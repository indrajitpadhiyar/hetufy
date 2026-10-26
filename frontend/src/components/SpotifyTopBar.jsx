import React from 'react';
import { 
  Home, Search, Bell, Users, Folder, ChevronLeft, ChevronRight, 
  Minus, Square, X, MoreHorizontal, Sparkles 
} from 'lucide-react';

export default function SpotifyTopBar({
  searchQuery,
  setSearchQuery,
  onOpenSettings,
  onOpenPlaylists,
  onResetToHome
}) {
  return (
    <header className="h-12 bg-black text-zinc-300 flex items-center justify-between px-3 select-none flex-shrink-0 z-30 border-b border-white/5">
      {/* Left: Window Dots & Navigation Arrows */}
      <div className="flex items-center space-x-3 w-60">
        <button 
          onClick={onOpenSettings}
          className="text-zinc-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
          title="App Menu"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1.5 ml-1">
          <button 
            onClick={() => window.history.back()}
            className="w-7 h-7 rounded-full bg-[#131313] hover:bg-[#1f1f1f] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => window.history.forward()}
            className="w-7 h-7 rounded-full bg-[#131313] hover:bg-[#1f1f1f] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Go forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Home Button & Central Search Bar */}
      <div className="flex items-center space-x-2 max-w-[520px] w-full justify-center">
        {/* Home Button Pill */}
        <button
          onClick={onResetToHome}
          className="w-10 h-10 rounded-full bg-[#1f1f1f] hover:bg-[#282828] hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shadow-md flex-shrink-0"
          title="Home"
        >
          <Home className="w-5 h-5 fill-current" />
        </button>

        {/* Search Pill Input */}
        <div className="relative flex-1 max-w-[420px]">
          <div className="flex items-center bg-[#1f1f1f] hover:bg-[#282828] focus-within:bg-[#242424] focus-within:ring-2 focus-within:ring-white rounded-full px-3.5 py-2 transition-all">
            <Search className="w-4 h-4 text-zinc-400 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to play?"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-400 outline-none font-normal"
            />
            <div className="h-4 w-[1px] bg-zinc-600 mx-2" />
            <button 
              onClick={onOpenPlaylists}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Browse Library"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Friends, Profile & Windows Control Buttons */}
      <div className="flex items-center justify-end space-x-3 w-60">
        <button 
          onClick={onOpenSettings}
          className="p-1.5 rounded-full hover:bg-[#1f1f1f] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="What's New"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button 
          onClick={onOpenPlaylists}
          className="p-1.5 rounded-full hover:bg-[#1f1f1f] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Friend Activity"
        >
          <Users className="w-4 h-4" />
        </button>

        {/* Profile Avatar Badge (with Apple/Icon from reference) */}
        <button 
          onClick={onOpenSettings}
          className="relative w-8 h-8 rounded-full bg-[#181818] border-2 border-white/80 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-sm"
          title="Indrajit Padhiyar Profile"
        >
          <div className="w-full h-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white">
            🍎
          </div>
        </button>

        {/* Windows OS Window Controls */}
        <div className="flex items-center space-x-2 pl-2 border-l border-white/10 text-zinc-400">
          <button 
            onClick={() => window.electronAPI?.minimizeWindow?.()}
            className="p-1 hover:text-white transition-colors cursor-pointer" 
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => window.electronAPI?.maximizeWindow?.()}
            className="p-1 hover:text-white transition-colors cursor-pointer" 
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button 
            onClick={() => window.electronAPI?.closeWindow?.()}
            className="p-1 hover:text-rose-400 transition-colors cursor-pointer" 
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
