import React from 'react';
import { Play, Pause, Download, Heart, Plus, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SpotifyMainView({
  songs = [],
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlay,
  onDownload,
  favorites = [],
  onToggleFavorite,
  onOpenAddToPlaylist,
  activeCategory,
  onSelectCategory,
  categories = [],
  isLoading = false,
  onRetry = () => {},
  currentUser = null
}) {
  // Top 6-8 songs for the quick access 2-column grid
  const quickAccessSongs = (songs || []).slice(0, 6);
  const remainingSongs = songs || [];

  // Filter chips: All, plus unique genres from actual songs
  const baseFilters = ['All', ...Array.from(new Set(categories.filter(c => c && c !== 'All')))];

  const formatDuration = (secs) => {
    if (!secs || isNaN(secs)) return '3:15';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="flex-1 h-full bg-[#121212] rounded-lg overflow-y-auto text-white select-none custom-scrollbar flex flex-col pb-36 md:pb-8">
      
      {/* Dynamic Gradient Top Accent */}
      <div className="bg-gradient-to-b from-[#252525] via-[#161616] to-[#121212] p-4 sm:p-6 pb-4">
        
        {/* Top Mobile Brand Header */}
        <div className="flex md:hidden items-center justify-between pb-3.5">
          <div className="flex items-center space-x-2">
            <img src="/idrmusic.png" alt="IDRMusic" className="w-7 h-7 object-contain rounded-md" />
            <span className="font-extrabold text-base text-white tracking-tight">IDRMusic</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden border border-white/10 flex items-center justify-center">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[11px] text-zinc-300 font-bold">ID</span>
            )}
          </div>
        </div>

        {/* Top Category Filter Chips */}
        <div className="flex items-center space-x-2 pb-4 overflow-x-auto no-scrollbar">
          {baseFilters.slice(0, 6).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#2a2a2a] hover:bg-[#333333] text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ================= 2-COLUMN QUICK ACCESS GRID (Real Backend Songs) ================= */}
        {quickAccessSongs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 mb-6">
            {quickAccessSongs.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={song.id}
                  onClick={() => {
                    if (isCurrent) onTogglePlay();
                    else onPlaySong(song);
                  }}
                  className={`group relative flex items-center bg-[#282828]/70 hover:bg-[#282828] active:scale-[0.99] rounded-[4px] overflow-hidden transition-all duration-150 cursor-pointer shadow-sm ${
                    isCurrent ? 'bg-[#333333]' : ''
                  }`}
                >
                  {/* Left Artwork */}
                  <div className="w-12 h-12 flex-shrink-0 bg-zinc-800">
                    <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Center Title */}
                  <div className="flex-1 px-3 overflow-hidden">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight group-hover:text-white">
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {song.artist}
                    </p>
                  </div>

                  {/* Right Green Spotify Play Button */}
                  <div className="pr-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) onTogglePlay();
                        else onPlaySong(song);
                      }}
                      className={`w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg transition-all duration-150 cursor-pointer ${
                        isSongPlaying
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isSongPlaying ? (
                        <Pause className="w-4 h-4 fill-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ================= RECENTS SECTION ================= */}
      {remainingSongs.length > 0 && (
        <div className="px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg sm:text-xl text-white tracking-tight">
              Recents
            </h3>
            <span className="text-xs font-bold text-zinc-400 hover:text-white cursor-pointer">
              Show all
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
            {remainingSongs.slice(0, 6).map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={`rec-${song.id}`}
                  onClick={() => {
                    if (isCurrent) onTogglePlay();
                    else onPlaySong(song);
                  }}
                  className="group p-2.5 rounded-lg bg-[#181818] hover:bg-[#282828] transition-all duration-200 cursor-pointer flex flex-col relative"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-zinc-800 mb-2.5 shadow-md">
                    <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />

                    <div className={`absolute bottom-2 right-2 transition-all duration-200 ${
                      isSongPlaying
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}>
                      <div className="w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95">
                        {isSongPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                    {song.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= FULL SONGS LIST / FEATURED LIBRARY ================= */}
      <div className="px-4 sm:px-6 py-2 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg sm:text-xl text-white tracking-tight">
            {activeCategory.startsWith('Playlist: ') ? activeCategory : 'Google Drive Music Library'}
          </h3>
          <span className="text-xs text-zinc-400 font-medium">
            {remainingSongs.length} tracks
          </span>
        </div>

        <div className="space-y-1">
          {isLoading && remainingSongs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#1ed760] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-300 font-medium">Connecting to Render Cloud Backend...</p>
              <p className="text-xs text-zinc-500 max-w-sm">Fetching your Google Drive music tracks...</p>
            </div>
          )}

          {!isLoading && remainingSongs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-[#181818] rounded-xl border border-white/5 p-6">
              <p className="text-sm text-zinc-300 font-medium">No songs available</p>
              <p className="text-xs text-zinc-500 max-w-sm">Could not find tracks or server is connecting.</p>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-[#1ed760] text-black text-xs font-bold rounded-full hover:bg-[#1db954] transition-all cursor-pointer shadow-md"
              >
                Retry Loading Songs
              </button>
            </div>
          )}

          {remainingSongs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isSongPlaying = isCurrent && isPlaying;
            const isFav = favorites.includes(song.id);

            return (
              <div
                key={`track-${song.id}-${index}`}
                onClick={() => {
                  if (isCurrent) onTogglePlay();
                  else onPlaySong(song);
                }}
                className={`group flex items-center justify-between p-2 sm:px-3 rounded-md hover:bg-[#282828] transition-colors cursor-pointer ${
                  isCurrent ? 'bg-[#242424]' : ''
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <span className="text-xs text-zinc-400 w-4 text-center font-mono">
                    {isSongPlaying ? (
                      <span className="text-[#1ed760] font-bold">▶</span>
                    ) : (
                      index + 1
                    )}
                  </span>
                  
                  <img src={song.cover} alt={song.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate font-medium ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-zinc-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className="p-1 hover:text-white"
                    title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'text-[#1ed760] fill-[#1ed760]' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddToPlaylist(song);
                    }}
                    className="p-1 hover:text-white"
                    title="Add to Playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(song);
                    }}
                    className="p-1 hover:text-white hidden sm:inline"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono hidden sm:inline ml-2">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
