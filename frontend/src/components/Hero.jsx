import { motion } from 'framer-motion';
import { Play, Pause, Download, Heart, Disc, Plus } from 'lucide-react';

export default function Hero({ 
  onStartListening, 
  featuredSong, 
  isPlaying, 
  onTogglePlay, 
  onDownload, 
  isFavorite, 
  onToggleFavorite,
  songList = [],
  onPlaySong,
  onOpenAddToPlaylist
}) {
  const tracks = songList && songList.length > 0 ? songList.slice(0, 3) : [];
  const activeTrack = featuredSong || tracks[0];

  return (
    <section id="hero" className="py-8 md:py-14 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* --- LEFT COLUMN: STACKED VINTAGE KODAK E100 FILM STRIP PHOTO --- */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div className="relative group max-w-sm sm:max-w-md w-full">
            
            {/* Background Tilted Film Strip 1 */}
            <div className="absolute inset-0 bg-[#2b2723] rounded-2xl rotate-[-8deg] shadow-xl border border-[#3e3933] pointer-events-none opacity-80 transition-transform group-hover:rotate-[-10deg]">
              <div className="h-6 flex items-center justify-between px-3 border-b border-zinc-700/50">
                <span className="text-[9px] font-mono text-zinc-400 tracking-widest uppercase">KODAK E100</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-1.5 bg-zinc-800 rounded-xs" />
                  <div className="w-2 h-1.5 bg-zinc-800 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Main Polaroid Film Strip Frame (Kodak E100) */}
            <motion.div 
              initial={{ rotate: -3, y: 10 }}
              animate={{ rotate: -2, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-[#eee9df] p-4 md:p-5 rounded-2xl shadow-2xl border border-[#d3cac0] rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
            >
              {/* Top Film Sprocket Strip Header */}
              <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-[#d6cfc4] text-[10px] font-mono text-[#7d776f] tracking-widest font-bold uppercase">
                <span>KODAK E100</span>
                <div className="flex gap-2">
                  <span className="w-2.5 h-2 rounded-xs bg-[#22211e]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#22211e]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#22211e]" />
                </div>
              </div>

              {/* Vintage Photo / Album Artwork with Sepia Monochrome Filter */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-inner bg-[#22211e]">
                <img 
                  src={activeTrack?.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'} 
                  alt="Musician Studio"
                  className="w-full h-full object-cover filter grayscale contrast-125 sepia-[0.3] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Active Track Overlay Tag */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[#f6f3eb] bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg text-xs font-mono">
                  <span className="truncate max-w-[200px] font-bold">{activeTrack?.title}</span>
                  <span className="text-[10px] text-amber-200">15A</span>
                </div>
              </div>

              {/* Bottom Film Sprocket Strip Footer */}
              <div className="flex items-center justify-between px-2 pt-3 text-[10px] font-mono text-[#7d776f] font-bold">
                <span>15</span>
                <span>15A</span>
                <span>16</span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* --- RIGHT COLUMN: MASSIVE GROTESK HEADLINE & VINYL TRACK LIST --- */}
        <div className="lg:col-span-7 flex flex-col space-y-8">
          
          {/* Main Huge Headline (Exact match: "WRITTEN TO BE SUNG") */}
          <div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl sm:text-7xl xl:text-8xl font-black text-[#1c1b18] tracking-tight leading-[0.9] font-sans-grotesk uppercase"
            >
              WRITTEN<br />
              TO BE SUNG
            </motion.h1>

            {/* Subtitle (Exact match: Composer / Arranger / Producer) */}
            <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#7d776f] uppercase mt-4">
              Composer &nbsp;/&nbsp; Arranger &nbsp;/&nbsp; Producer
            </p>
          </div>

          {/* Track List (#1, #2, #3...) Exact screenshot design! */}
          <div className="space-y-4 pt-2">
            {tracks.map((song, idx) => {
              const isCurrent = activeTrack?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;

              const durationSecs = song.duration || 180;
              const durationMin = Math.floor(durationSecs / 60);
              const durationSec = String(Math.floor(durationSecs % 60)).padStart(2, '0');

              return (
                <div
                  key={song.id}
                  onClick={() => {
                    if (isCurrent) {
                      onTogglePlay();
                    } else if (onPlaySong) {
                      onPlaySong(song);
                    }
                  }}
                  className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-[#eee9df] border border-[#d6cfc4] shadow-md' 
                      : 'hover:bg-[#eee9df]/60 border border-transparent'
                  }`}
                >
                  {/* Left: Track Index + Vinyl Disc + Title */}
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    {/* Index (#1, #2) */}
                    <span className="font-serif-editorial italic text-sm text-[#7d776f] font-medium w-4">
                      #{idx + 1}
                    </span>

                    {/* Vinyl Disk Graphic Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg bg-[#22211e] overflow-hidden flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      {/* Vinyl Groove Rings */}
                      <div className="absolute inset-0 rounded-full border border-zinc-700/50 m-1" />
                      <div className="absolute inset-0 rounded-full border border-zinc-700/30 m-2.5" />
                      
                      {/* Song Cover Artwork at Center of Vinyl */}
                      <img 
                        src={song.cover} 
                        alt={song.title} 
                        className={`w-7 h-7 rounded-full object-cover shadow-sm ${
                          isSongPlaying ? 'animate-vinyl' : ''
                        }`}
                      />
                      
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSongPlaying ? (
                          <Pause className="w-4 h-4 text-white fill-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Song Titles */}
                    <div>
                      <h3 className="font-serif-editorial text-lg sm:text-xl text-[#1c1b18] leading-tight font-medium group-hover:text-black">
                        {song.title}
                      </h3>
                      <p className="text-xs text-[#7d776f] font-normal mt-0.5">
                        {song.artist || `written for Tobe, sung by 40 voices`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions & Duration */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {onOpenAddToPlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddToPlaylist(song);
                        }}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-[#dcd5c9] text-[#7d776f] hover:text-[#1c1b18] transition-colors"
                        title="Add to Playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(song);
                      }}
                      className="p-1.5 sm:p-2 rounded-full hover:bg-[#dcd5c9] text-[#7d776f] hover:text-[#1c1b18] transition-colors"
                      title="Download MP3"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono text-[#5e584f] font-medium min-w-[35px] text-right">
                      {durationMin}:{durationSec}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}



