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
  categories = []
}) {
  // Top 8 songs for the quick access 2-column grid
  const quickAccessSongs = songs.slice(0, 8);
  const remainingSongs = songs;

  // Filter chips: All, Music, Podcasts + genres
  const baseFilters = ['All', 'Music', 'Podcasts'];
  const allFilters = Array.from(new Set([...baseFilters, ...categories.slice(0, 5)]));

  const formatDuration = (secs) => {
    if (!secs || isNaN(secs)) return '3:15';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="flex-1 h-full bg-[#121212] rounded-lg overflow-y-auto text-white select-none custom-scrollbar flex flex-col">
      
      {/* Dynamic Gradient Top Accent */}
      <div className="bg-gradient-to-b from-[#252525] via-[#161616] to-[#121212] p-6 pb-4">
        
        {/* Top Category Filter Chips */}
        <div className="flex items-center space-x-2 pb-6 overflow-x-auto no-scrollbar">
          {allFilters.map((cat) => {
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

        {/* ================= 2-COLUMN QUICK ACCESS GRID (Exact Spotify Desktop) ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2.5 mb-8">
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
                className={`group relative flex items-center bg-[#282828]/60 hover:bg-[#282828] rounded-[4px] overflow-hidden transition-all duration-200 cursor-pointer shadow-sm ${
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
                </div>

                {/* Right Green Spotify Play Button (Appears on Hover) */}
                <div className="pr-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) onTogglePlay();
                      else onPlaySong(song);
                    }}
                    className={`w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer ${
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

      {/* ================= recents ================= */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-white tracking-tight hover:underline cursor-pointer">
            recents  
          </h3>
          <span className="text-xs font-bold text-zinc-400 hover:text-white hover:underline cursor-pointer">
            Show all
          </span>
        </div>

        {/* Horizontal Card Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {songs.slice(0, 6).map((song) => {
            const isCurrent = currentSong?.id === song.id;
            const isSongPlaying = isCurrent && isPlaying;

            return (
              <div
                key={`rec-${song.id}`}
                onClick={() => {
                  if (isCurrent) onTogglePlay();
                  else onPlaySong(song);
                }}
                className="group p-3 rounded-lg bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer flex flex-col relative"
              >
                {/* Artwork Container */}
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-zinc-800 mb-3 shadow-md">
                  <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />

                  {/* Floating Green Play Button */}
                  <div className={`absolute bottom-2 right-2 transition-all duration-300 ${
                    isSongPlaying
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) onTogglePlay();
                        else onPlaySong(song);
                      }}
                      className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {isSongPlaying ? (
                        <Pause className="w-4 h-4 fill-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Title & Artist */}
                <h4 className="font-bold text-sm text-white truncate group-hover:underline">
                  {song.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 truncate">
                  {song.artist}
                </p>
              </div>
            );
          })}
        </div>

        {/* ================= ALL SONGS TABLE / PLAYLIST VIEW ================= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-white tracking-tight">
              {activeCategory.startsWith('Playlist: ') ? activeCategory : 'Featured Library'}
            </h3>
            <span className="text-xs text-zinc-400">
              {remainingSongs.length} tracks
            </span>
          </div>

          <div className="space-y-1">
            {remainingSongs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;
              const isFav = favorites.includes(song.id);

              return (
                <div
                  key={`list-${song.id}`}
                  onClick={() => {
                    if (isCurrent) onTogglePlay();
                    else onPlaySong(song);
                  }}
                  className={`group flex items-center px-4 py-2.5 rounded-md hover:bg-[#282828] transition-colors cursor-pointer text-zinc-300 text-xs sm:text-sm ${
                    isCurrent ? 'bg-[#282828] text-[#1ed760]' : ''
                  }`}
                >
                  {/* Track Index or Play Icon */}
                  <div className="w-6 flex items-center justify-center font-mono text-zinc-400 group-hover:text-white mr-3">
                    <span className="group-hover:hidden">
                      {isSongPlaying ? '▶' : index + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) onTogglePlay();
                        else onPlaySong(song);
                      }}
                      className="hidden group-hover:inline-block cursor-pointer text-white"
                    >
                      {isSongPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    </button>
                  </div>

                  {/* Thumbnail & Title/Artist */}
                  <div className="flex items-center flex-1 min-w-0 pr-4">
                    <img src={song.cover} alt={song.title} className="w-10 h-10 rounded object-cover mr-3 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className={`font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                        {song.title}
                      </div>
                      <div className="text-xs text-zinc-400 truncate mt-0.5">
                        {song.artist}
                      </div>
                    </div>
                  </div>

                  {/* Album / Genre */}
                  <div className="hidden md:block w-40 truncate text-zinc-400 text-xs pr-4">
                    {song.album || song.genre}
                  </div>

                  {/* Action Icons: Favorite, Download, Add to Playlist */}
                  <div className="flex items-center space-x-3 text-zinc-400 pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(song.id);
                      }}
                      className={`hover:text-white transition-colors cursor-pointer ${
                        isFav ? 'text-[#1ed760]' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title={isFav ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddToPlaylist(song);
                      }}
                      className="hover:text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Add to Playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(song);
                      }}
                      className="hover:text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Download MP3"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Duration */}
                  <div className="w-12 text-right font-mono text-zinc-400 text-xs">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
