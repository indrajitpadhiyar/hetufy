import React, { useState } from 'react';
import { 
  Home, Search, Bell, Users, Folder, ChevronLeft, ChevronRight, 
  MoreHorizontal, LogOut, User as UserIcon 
} from 'lucide-react';

export default function SpotifyTopBar({
  searchQuery,
  setSearchQuery,
  onOpenPlaylists,
  onResetToHome,
  currentUser,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  return (
    <header className="h-12 bg-black text-zinc-300 flex items-center justify-between px-3 select-none flex-shrink-0 z-30 border-b border-white/5">
      {/* Left: Brand Logo & Navigation Arrows */}
      <div className="flex items-center space-x-3 w-60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-0.5 shadow-sm">
            <img 
              src="./idrmusic.png" 
              alt="IDRMusic" 
              className="w-full h-full object-contain"
              onError={(e) => {
                if (!e.target.src.includes('/idrmusic.png')) {
                  e.target.src = '/idrmusic.png';
                }
              }}
            />
          </div>
          <span className="font-extrabold text-sm text-white tracking-tight hidden sm:inline-block">
            IDRMusic
          </span>
        </div>

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
          className="p-1.5 rounded-full hover:bg-[#1f1f1f] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button 
          onClick={onOpenPlaylists}
          className="p-1.5 rounded-full hover:bg-[#1f1f1f] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Playlists"
        >
          <Users className="w-4 h-4" />
        </button>

        {/* Profile Avatar Badge & Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative w-8 h-8 rounded-full bg-[#181818] border-2 border-white/80 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-sm"
            title={currentUser?.name || "User Profile"}
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#1ed760] to-emerald-700 flex items-center justify-center text-xs font-bold text-black uppercase">
                {currentUser?.name ? currentUser.name[0] : 'U'}
              </div>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#1f1f23] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 text-white animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-xs font-bold truncate text-white">
                  {currentUser?.name || 'IDRMusic Listener'}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {currentUser?.email || 'member@idrmusic.com'}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-white/10 hover:text-rose-300 rounded-xl transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
