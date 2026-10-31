import React from 'react';
import { Plus, Check, X, MoreHorizontal, ExternalLink } from 'lucide-react';

export default function SpotifyNowPlayingSidebar({
  currentSong,
  isFavorite,
  onToggleFavorite,
  onClose,
  onOpenAddToPlaylist
}) {
  if (!currentSong) return null;

  return (
    <aside className="hidden md:flex w-72 lg:w-80 h-full bg-[#121212] rounded-lg flex-col overflow-hidden text-white select-none flex-shrink-0 border border-white/5 shadow-xl">
      
      {/* Top Header: Track Title & Close Button */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <h4 className="font-bold text-sm text-white truncate max-w-[200px]">
          {currentSong.title}
        </h4>
        <div className="flex items-center space-x-1 text-zinc-400">
          <button 
            onClick={() => onOpenAddToPlaylist(currentSong)}
            className="p-1 hover:text-white rounded-full transition-colors cursor-pointer"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:text-white rounded-full transition-colors cursor-pointer"
            title="Close Now Playing View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {/* Featured Visual Banner matching reference image */}
        <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg bg-[#181818] group">
          <img 
            src={currentSong.cover} 
            alt={currentSong.title}
            className="w-full h-full object-cover filter grayscale contrast-125 brightness-90 group-hover:scale-105 transition-transform duration-500" 
          />
          
          {/* Subtle text overlay at top of visual matching reference image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 p-4 flex flex-col justify-between">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-300">
                IF YOU LIKED '{currentSong.title.toUpperCase()}'
              </p>
              <p className="text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5">
                STREAM IN STUDIO HI-FI AUDIO
              </p>
            </div>
            
            {/* Bottom Credits on photo */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">
                ORIGINAL MASTER RECORDING
              </p>
            </div>
          </div>
        </div>

        {/* Title, Artist & Plus Button */}
        <div className="flex items-start justify-between">
          <div className="overflow-hidden pr-2">
            <h3 className="font-bold text-xl text-white tracking-tight leading-snug truncate hover:underline cursor-pointer">
              {currentSong.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 font-medium truncate hover:text-white hover:underline cursor-pointer">
              {currentSong.artist}
            </p>
          </div>

          <button
            onClick={() => onOpenAddToPlaylist(currentSong)}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Add to playlist"
          >
            <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center hover:border-emerald-400 hover:text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Lyrics Preview Card matching reference image */}
        <div className="bg-[#241f17] rounded-xl p-4 text-[#e6ded5] shadow-md border border-amber-950/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-300 tracking-tight">
              Lyrics preview
            </span>
            <span className="text-[10px] text-zinc-400 font-medium hover:text-white cursor-pointer">
              Show lyrics
            </span>
          </div>

          <p className="font-serif-editorial text-lg md:text-xl font-bold leading-relaxed text-[#f3ece2]">
            {currentSong.lyricsPreview || 'Mm, खुशबुएँ ना गुलाब, बोतलें ना शराबें'}
          </p>

          <p className="font-serif-editorial text-sm font-medium text-[#c4b9aa] mt-2">
            धुन में तेरी बहकते हैं, रात के ये फ़साने...
          </p>
        </div>

        {/* About the Artist Card */}
        <div className="bg-[#181818] rounded-xl p-4 text-white">
          <h4 className="text-sm font-bold text-white mb-2">About the artist</h4>
          <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2">
            <img src={currentSong.cover} alt={currentSong.artist} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-2 font-bold text-sm">
              {currentSong.artist}
            </div>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-3">
            Genre: {currentSong.genre || 'Indie / Bollywood'}. Stream high resolution master tracks curated exclusively for IDRMusic.
          </p>
        </div>

      </div>

    </aside>
  );
}
