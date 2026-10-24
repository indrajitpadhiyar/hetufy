import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, Heart, Clock, Plus } from 'lucide-react';

export default function MusicCard({ 
  song, 
  currentSong, 
  isPlaying, 
  onPlaySong, 
  onTogglePlay, 
  onDownload, 
  isFavorite, 
  onToggleFavorite,
  onOpenAddToPlaylist,
  theme = 'light'
}) {
  const isCurrent = currentSong?.id === song.id;
  const isSongPlaying = isCurrent && isPlaying;
  const isDark = theme === 'dark';

  const [cardDuration, setCardDuration] = useState(song.duration || 180);

  useEffect(() => {
    if (song.audio) {
      const audio = new Audio();
      audio.src = song.audio;
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setCardDuration(Math.round(audio.duration));
        }
      };
    }
  }, [song.audio]);

  const handleCardClick = () => {
    if (isCurrent) {
      onTogglePlay();
    } else {
      onPlaySong(song);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
        isDark
          ? (isCurrent
              ? 'bg-[#222432] border border-amber-400/60 shadow-xl ring-1 ring-amber-400/40 text-white'
              : 'bg-[#1a1b24] border border-white/5 hover:border-white/20 hover:bg-[#20222e] text-white shadow-md')
          : (isCurrent
              ? 'bg-[#eee9df] border-[#1c1b18] shadow-lg ring-1 ring-[#1c1b18]'
              : 'bg-[#f0ebe0] border-[#d6cfc4] hover:bg-[#eee9df]')
      }`}
    >
      {/* Full Artwork Cover Container */}
      <div className={`relative aspect-square rounded-xl overflow-hidden mb-3.5 shadow-md group/cover ${
        isDark ? 'bg-zinc-800' : 'bg-[#e4ded4]'
      }`}>
        {/* Full-bleed Cover Image */}
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-105"
        />

        {/* Add to Playlist Pill (Top Left) */}
        {onOpenAddToPlaylist && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddToPlaylist(song);
              }}
              className="p-1.5 rounded-full bg-black/55 text-white hover:bg-amber-400 hover:text-black backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-sm"
              title="Add to Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Favorite Action Pill (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(song.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-sm ${
              isFavorite 
                ? (isDark ? 'bg-amber-400 text-black' : 'bg-[#1c1b18] text-[#f6f3eb]')
                : 'bg-black/55 text-white hover:bg-[#1c1b18]'
            }`}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? (isDark ? 'fill-black' : 'fill-[#f6f3eb]') : ''}`} />
          </button>
        </div>

        {/* Hover / Playing Play Button Overlay */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-300 ${
          isSongPlaying ? 'opacity-100' : 'opacity-0 group-hover/cover:opacity-100'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer ${
              isDark ? 'bg-amber-400 text-black' : 'bg-[#f6f3eb] text-[#1c1b18]'
            }`}
          >
            {isSongPlaying ? (
              <Pause className={`w-5 h-5 ${isDark ? 'fill-black' : 'fill-[#1c1b18]'}`} />
            ) : (
              <Play className={`w-5 h-5 ml-0.5 ${isDark ? 'fill-black' : 'fill-[#1c1b18]'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Song Info */}
      <div className="flex items-start justify-between">
        <div className="pr-2 overflow-hidden">
          <h3 className={`font-serif-editorial text-lg truncate leading-tight font-medium ${
            isDark ? 'text-white group-hover:text-amber-300' : 'text-[#1c1b18] group-hover:text-black'
          }`}>
            {song.title}
          </h3>
          <p className={`text-xs truncate mt-0.5 ${
            isDark ? 'text-zinc-400' : 'text-[#7d776f]'
          }`}>
            {song.artist}
          </p>
        </div>

        {/* Download Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(song);
          }}
          className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
            isDark 
              ? 'hover:bg-white/10 text-zinc-400 hover:text-white' 
              : 'hover:bg-[#dcd5c9] text-[#7d776f] hover:text-[#1c1b18]'
          }`}
          title="Download MP3"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Footer */}
      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
        isDark ? 'border-white/10 text-zinc-500' : 'border-[#dcd5c9] text-[#7d776f]'
      }`}>
        <span className="flex items-center space-x-1 font-mono">
          <Clock className={`w-3 h-3 ${isDark ? 'text-zinc-500' : 'text-[#7d776f]'}`} />
          <span>{Math.floor(cardDuration / 60)}:{String(Math.floor(cardDuration % 60)).padStart(2, '0')}</span>
        </span>
        <span className={`font-sans-grotesk text-[10px] font-bold uppercase tracking-wider ${
          isDark ? 'text-zinc-400' : 'text-[#5e584f]'
        }`}>
          {song.genre || 'Vinyl Track'}
        </span>
      </div>
    </motion.div>
  );
}



