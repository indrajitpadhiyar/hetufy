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
  onOpenAddToPlaylist
}) {
  const isCurrent = currentSong?.id === song.id;
  const isSongPlaying = isCurrent && isPlaying;

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
      className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer editorial-card ${
        isCurrent
          ? 'bg-[#eee9df] border-[#1c1b18] shadow-lg ring-1 ring-[#1c1b18]'
          : 'bg-[#f0ebe0] border-[#d6cfc4] hover:bg-[#eee9df]'
      }`}
    >
      {/* Vinyl Disc Container Artwork */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3.5 bg-[#22211e] shadow-md group/cover flex items-center justify-center p-3">
        {/* Outer Vinyl Grooves */}
        <div className="absolute inset-2 rounded-full border border-zinc-700/50" />
        <div className="absolute inset-5 rounded-full border border-zinc-700/30" />
        
        {/* Cover Photo at Center Label */}
        <img
          src={song.cover}
          alt={song.title}
          className={`w-28 h-28 md:w-32 md:h-32 rounded-full object-cover shadow-md transition-transform duration-700 ${
            isSongPlaying ? 'animate-vinyl' : 'group-hover/cover:scale-105'
          }`}
        />

        {/* Add to Playlist Pill (Top Left) */}
        {onOpenAddToPlaylist && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddToPlaylist(song);
              }}
              className="p-1.5 rounded-full bg-black/40 text-white hover:bg-[#1c1b18] backdrop-blur-md transition-all active:scale-90 cursor-pointer"
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
            className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
              isFavorite 
                ? 'bg-[#1c1b18] text-[#f6f3eb]' 
                : 'bg-black/40 text-white hover:bg-[#1c1b18]'
            }`}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#f6f3eb]' : ''}`} />
          </button>
        </div>

        {/* Hover Play Button */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-12 h-12 rounded-full bg-[#f6f3eb] text-[#1c1b18] flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
          >
            {isSongPlaying ? (
              <Pause className="w-5 h-5 fill-[#1c1b18]" />
            ) : (
              <Play className="w-5 h-5 fill-[#1c1b18] ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Song Info */}
      <div className="flex items-start justify-between">
        <div className="pr-2 overflow-hidden">
          <h3 className="font-serif-editorial text-lg text-[#1c1b18] truncate leading-tight font-medium group-hover:text-black">
            {song.title}
          </h3>
          <p className="text-xs text-[#7d776f] truncate mt-0.5">{song.artist}</p>
        </div>

        {/* Download Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(song);
          }}
          className="p-2 rounded-lg hover:bg-[#dcd5c9] text-[#7d776f] hover:text-[#1c1b18] transition-colors shrink-0 cursor-pointer"
          title="Download MP3"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Footer */}
      <div className="mt-3 pt-2.5 border-t border-[#dcd5c9] flex items-center justify-between text-[11px] text-[#7d776f]">
        <span className="flex items-center space-x-1 font-mono">
          <Clock className="w-3 h-3 text-[#7d776f]" />
          <span>{Math.floor(cardDuration / 60)}:{String(Math.floor(cardDuration % 60)).padStart(2, '0')}</span>
        </span>
        <span className="font-sans-grotesk text-[10px] font-bold text-[#5e584f] uppercase tracking-wider">
          {song.genre || 'Vinyl Track'}
        </span>
      </div>
    </motion.div>
  );
}



