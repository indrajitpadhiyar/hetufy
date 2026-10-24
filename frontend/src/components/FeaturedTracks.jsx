import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Clock, Disc, 
  ChevronLeft, ChevronRight, Music, HardDrive, Sparkles 
} from 'lucide-react';

export default function FeaturedTracks({ 
  songs, currentSong, isPlaying, onPlaySong, onTogglePlay, onDownload, favorites, onToggleFavorite 
}) {
  if (!songs || songs.length === 0) return null;

  const displayTrack = currentSong || songs[0];

  return (
    <section className="relative z-20 py-4 max-w-[1440px] mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT WIDGET: LIBRARY HIGHLIGHTS & SOURCE STATS --- */}
        <div className="lg:col-span-4 glass-card-curved p-6 border border-white/10 flex flex-col justify-between gap-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-amber-400" />
                Cloud Collection
              </span>
              <span className="text-xs text-zinc-400 font-medium">Google Drive Audio</span>
            </div>
            
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              Music Vault
            </h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed mb-4">
              Stream and download lossless audio synced directly from your storage.
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                {songs.length} Tracks Ready
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                Instant MP3 Download
              </span>
            </div>
          </div>

          {/* Quick Active Song Card */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Active Track</p>
              <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[180px]">{displayTrack.title}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
          </div>
        </div>

        {/* --- CENTER WIDGET: EMBEDDED MINI PLAYER --- */}
        <div className="lg:col-span-4 glass-card-curved p-6 border border-white/10 flex flex-col items-center justify-between gap-5 shadow-xl relative overflow-hidden">
          {/* Album Artwork Card */}
          <div className="w-full aspect-square max-h-[200px] rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 group">
            <img 
              src={displayTrack.cover} 
              alt={displayTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <div>
                <p className="text-xs font-bold text-amber-300 truncate max-w-[220px]">{displayTrack.title}</p>
                <p className="text-[11px] text-zinc-300 truncate">{displayTrack.artist}</p>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full bg-white/5 border border-white/10 p-3 rounded-full flex items-center justify-around shadow-lg backdrop-blur-md">
            <button 
              onClick={() => onPlaySong(songs[(songs.findIndex(s => s.id === displayTrack.id) - 1 + songs.length) % songs.length])}
              className="text-amber-400 hover:text-amber-300 transition-colors p-2 cursor-pointer"
            >
              <SkipBack className="w-5 h-5 fill-amber-400" />
            </button>

            <button 
              onClick={() => onTogglePlay()}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black translate-x-0.5" />}
            </button>

            <button 
              onClick={() => onPlaySong(songs[(songs.findIndex(s => s.id === displayTrack.id) + 1) % songs.length])}
              className="text-amber-400 hover:text-amber-300 transition-colors p-2 cursor-pointer"
            >
              <SkipForward className="w-5 h-5 fill-amber-400" />
            </button>
          </div>
        </div>

        {/* --- RIGHT WIDGET: RECENT TRACKS SELECTOR --- */}
        <div className="lg:col-span-4 glass-card-curved p-6 border border-white/10 flex flex-col justify-between gap-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              Recent Collection
            </h4>
            <span className="text-[11px] text-zinc-400 font-mono">
              {songs.length} Items
            </span>
          </div>

          {/* Album Media Previews Grid */}
          <div className="grid grid-cols-3 gap-3">
            {songs.slice(0, 3).map((song, i) => (
              <div 
                key={song.id || i}
                onClick={() => onPlaySong(song)}
                className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border transition-all ${
                  displayTrack.id === song.id 
                    ? 'border-amber-400 shadow-lg shadow-amber-500/30 scale-105' 
                    : 'border-white/10 hover:border-white/30 opacity-80 hover:opacity-100'
                }`}
              >
                <img 
                  src={song.cover} 
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                {displayTrack.id === song.id && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Info Footer */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between text-xs text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Drive Sync Active</span>
            </span>
            <span className="text-amber-400 font-semibold">Lossless Audio</span>
          </div>
        </div>

      </div>
    </section>
  );
}

