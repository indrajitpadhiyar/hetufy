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
  // Top 8 songs for the quick access 2-column grid
  const quickAccessSongs = songs.slice(0, 8);
  const remainingSongs = songs;

  // Chill section songs
  const chillSongs = (songs || []).filter(s => 
    (s?.genre || '').toLowerCase().includes('chill') || 
    (s?.title || '').toLowerCase().includes('chill') || 
    (s?.genre || '').toLowerCase() === 'pop'
  ).slice(0, 8);
  const displayChillSongs = chillSongs.length >= 2 ? chillSongs : (songs || []).slice(0, 6);

  // Recommendation section songs ("More like...")
  const moreLikeSongs = (songs || []).slice(2, 8);

  // Filter chips: All, Music, Podcasts
  const baseFilters = ['All', 'Music', 'Podcasts'];

  const formatDuration = (secs) => {
    if (!secs || isNaN(secs)) return '3:15';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="flex-1 h-full bg-[#121212] rounded-lg overflow-y-auto text-white select-none custom-scrollbar flex flex-col pb-28 md:pb-8">
      
      {/* Top Header & Quick Access Section */}
      <div className="bg-gradient-to-b from-[#252525] via-[#161616] to-[#121212] p-4 sm:p-6 pb-4">
        
        {/* Top Category Filter Chips with Profile Avatar */}
        <div className="flex items-center space-x-2.5 pb-5 overflow-x-auto no-scrollbar">
          {/* User Profile Avatar / Logo Badge */}
          <div className="w-8 h-8 rounded-full bg-[#242424] overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center shadow-sm">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <img src="/idrmusic.png" alt="IDRMusic" className="w-6 h-6 object-contain" />
            )}
          </div>

          {baseFilters.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1ed760] text-black shadow-md font-bold'
                    : 'bg-[#282828] hover:bg-[#333333] text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ================= 2-COLUMN QUICK ACCESS GRID (8 Items, Exact Mobile UI) ================= */}
        <div className="grid grid-cols-2 gap-2 mb-6">
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
                className={`group relative flex items-center bg-[#282828]/80 hover:bg-[#2e2e2e] active:scale-[0.98] rounded-md overflow-hidden transition-all duration-150 cursor-pointer shadow-sm h-14 ${
                  isCurrent ? 'bg-[#383838]' : ''
                }`}
              >
                {/* Left Artwork */}
                <div className="w-14 h-14 flex-shrink-0 bg-neutral-800">
                  <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                </div>

                {/* Center Title */}
                <div className="flex-1 px-2.5 overflow-hidden">
                  <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-tight">
                    {song.title}
                  </h4>
                </div>

                {/* Right Green Spotify Play Button (Desktop Hover or Mobile Playing) */}
                <div className="pr-2 hidden sm:block">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) onTogglePlay();
                      else onPlaySong(song);
                    }}
                    className={`w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer ${
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

      </div>

      {/* ================= SECTION: CHILL (Horizontal Carousel) ================= */}
      <div className="px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xl text-white tracking-tight">
            Chill
          </h3>
          <span className="text-xs font-bold text-zinc-400 hover:text-white cursor-pointer">
            Show all
          </span>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex space-x-3.5 overflow-x-auto no-scrollbar pb-3">
          {displayChillSongs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            const isSongPlaying = isCurrent && isPlaying;

            return (
              <div
                key={`chill-${song.id}`}
                onClick={() => {
                  if (isCurrent) onTogglePlay();
                  else onPlaySong(song);
                }}
                className="w-36 sm:w-44 flex-shrink-0 group cursor-pointer"
              >
                {/* Artwork */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-800 shadow-md">
                  <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                  
                  {/* Top-left IDR logo badge */}
                  <div className="absolute top-2 left-2 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center p-0.5">
                    <img src="/idrmusic.png" alt="IDR" className="w-full h-full object-contain" />
                  </div>

                  {/* Play Button */}
                  <div className={`absolute bottom-2 right-2 transition-all duration-200 ${
                    isSongPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className="w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg">
                      {isSongPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                    </div>
                  </div>
                </div>

                {/* Title & Artist */}
                <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-2">
                  {song.title}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {song.artist}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SECTION: MORE LIKE BOLLYWOOD & CHILL ================= */}
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-9 h-9 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0">
            <img src={quickAccessSongs[3]?.cover || quickAccessSongs[0]?.cover} alt="Thumb" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 uppercase font-semibold tracking-wider">More like</p>
            <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
              Bollywood & Chill
            </h3>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex space-x-3.5 overflow-x-auto no-scrollbar pb-3">
          {moreLikeSongs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            const isSongPlaying = isCurrent && isPlaying;

            return (
              <div
                key={`more-${song.id}`}
                onClick={() => {
                  if (isCurrent) onTogglePlay();
                  else onPlaySong(song);
                }}
                className="w-36 sm:w-44 flex-shrink-0 group cursor-pointer"
              >
                {/* Artwork */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-800 shadow-md">
                  <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />

                  <div className={`absolute bottom-2 right-2 transition-all duration-200 ${
                    isSongPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className="w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg">
                      {isSongPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                    </div>
                  </div>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-2">
                  {song.title}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {song.artist}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= ALL SONGS TABLE / PLAYLIST VIEW ================= */}
      <div className="px-4 sm:px-6 py-3 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-white tracking-tight">
            {activeCategory.startsWith('Playlist: ') ? activeCategory : 'Featured Library'}
          </h3>
          <span className="text-xs text-zinc-400">
            {remainingSongs.length} tracks
          </span>
        </div>

        <div className="space-y-1">
          {isLoading && remainingSongs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#1ed760] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-300 font-medium">Connecting to Render Cloud Backend...</p>
              <p className="text-xs text-zinc-500 max-w-sm">Fetching your live music tracks.</p>
            </div>
          )}

          {!isLoading && remainingSongs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-[#181818] rounded-xl border border-white/5 p-6">
              <p className="text-sm text-zinc-300 font-medium">No songs currently showing</p>
              <p className="text-xs text-zinc-500 max-w-sm">Could not find tracks for this category.</p>
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
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'text-[#1ed760] fill-[#1ed760]' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddToPlaylist(song);
                    }}
                    className="p-1 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
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
