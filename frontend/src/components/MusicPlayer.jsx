import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, Download, Heart
} from 'lucide-react';

export default function MusicPlayer({
  currentSong,
  isPlaying,
  setIsPlaying,
  onNext,
  onPrev,
  onDownload,
  isFavorite,
  onToggleFavorite
}) {
  const audioRef = useRef(null);

  // Audio Player State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');

  // Handle current song changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audio;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Audio autoplay prevented:', err));
      }
    }
  }, [currentSong]);

  // Handle play/pause state synchronization
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentSong?.duration || 0);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      onNext(isShuffle);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const cycleRepeatMode = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentSong) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Persistent Floating Bottom Audio Player */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-12 md:right-12 z-50 max-w-[1340px] mx-auto"
        >
          <div className="relative rounded-2xl liquid-glass-panel p-3.5 md:px-6">
            
            {/* Liquid Specular Sheen & Caustic Flow Layers */}
            <div className="liquid-glass-sheen" />
            <div className="liquid-glass-flow" />

            {/* Main Player Grid */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Left: Song Artwork & Details */}
              <div className="flex items-center justify-between w-full md:w-1/4">
                <div className="flex items-center space-x-3 overflow-hidden">
                  {/* Vinyl Disc Thumbnail */}
                  <div className="relative w-10 h-10 rounded-full bg-[#1c1b18] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md ring-2 ring-white/60">
                    <img 
                      src={currentSong.cover} 
                      alt={currentSong.title} 
                      className={`w-6 h-6 rounded-full object-cover ${isPlaying ? 'animate-vinyl' : ''}`}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
                  </div>

                  <div className="overflow-hidden">
                    <h4 className="font-serif-editorial font-medium text-base text-[#1c1b18] truncate leading-tight">
                      {currentSong.title}
                    </h4>
                    <p className="text-xs text-[#7d776f] truncate mt-0.5 font-normal">
                      {currentSong.artist}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleFavorite(currentSong.id)}
                  className={`p-2 rounded-full transition-all ml-2 cursor-pointer ${
                    isFavorite 
                      ? 'bg-[#1c1b18] border border-[#1c1b18] text-[#f6f3eb] shadow-sm' 
                      : 'liquid-glass-pill text-[#5e584f] hover:text-[#1c1b18]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#f6f3eb]' : ''}`} />
                </button>
              </div>

              {/* Center: Playback Controls & Seeking Timeline */}
              <div className="flex flex-col items-center w-full md:w-2/4 space-y-1.5">
                
                {/* Control Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      isShuffle 
                        ? 'text-[#1c1b18] bg-white/70 shadow-sm border border-white/80' 
                        : 'text-[#7d776f] hover:text-[#1c1b18] hover:bg-white/40'
                    }`}
                    title="Shuffle"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onPrev(isShuffle)}
                    className="p-1.5 text-[#1c1b18] hover:text-black transition-colors cursor-pointer"
                  >
                    <SkipBack className="w-4 h-4 fill-[#1c1b18]" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="relative w-11 h-11 rounded-full bg-gradient-to-b from-[#2e2c28] via-[#1c1b18] to-[#121110] text-[#f6f3eb] flex items-center justify-center shadow-[0_6px_20px_rgba(28,27,24,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] ring-1 ring-white/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-[#f6f3eb]" />
                    ) : (
                      <Play className="w-4 h-4 fill-[#f6f3eb] ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onNext(isShuffle)}
                    className="p-1.5 text-[#1c1b18] hover:text-black transition-colors cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4 fill-[#1c1b18]" />
                  </button>

                  <button
                    onClick={cycleRepeatMode}
                    className={`p-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      repeatMode !== 'none' 
                        ? 'text-[#1c1b18] bg-white/70 shadow-sm border border-white/80' 
                        : 'text-[#7d776f] hover:text-[#1c1b18] hover:bg-white/40'
                    }`}
                    title="Repeat Mode"
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Progress Bar & Timestamps */}
                <div className="w-full flex items-center space-x-3 text-xs font-mono text-[#5e584f] font-medium">
                  <span className="w-8 text-right select-none">{formatTime(currentTime)}</span>
                  
                  <div className="relative flex-1 flex items-center h-4">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      style={{
                        background: `linear-gradient(to right, #1c1b18 0%, #1c1b18 ${progressPercentage}%, rgba(28, 27, 24, 0.15) ${progressPercentage}%, rgba(28, 27, 24, 0.15) 100%)`
                      }}
                      className="custom-seek-bar w-full h-1 rounded-full appearance-none cursor-pointer outline-none transition-all"
                    />
                  </div>

                  <span className="w-8 text-left select-none">{formatTime(duration)}</span>
                </div>

              </div>

              {/* Right: Equalizer, Volume & Download */}
              <div className="hidden lg:flex items-center justify-end space-x-4 w-1/4">
                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="text-[#1c1b18] hover:opacity-80 cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-700" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    style={{
                      background: `linear-gradient(to right, #1c1b18 0%, #1c1b18 ${volume * 100}%, rgba(28, 27, 24, 0.15) ${volume * 100}%, rgba(28, 27, 24, 0.15) 100%)`
                    }}
                    className="custom-volume-bar w-16 h-1 appearance-none cursor-pointer outline-none"
                  />
                </div>

                <button
                  onClick={() => onDownload(currentSong)}
                  className="p-2.5 rounded-xl liquid-glass-pill text-[#1c1b18] hover:bg-[#1c1b18] hover:text-[#f6f3eb] hover:border-[#1c1b18] transition-all cursor-pointer"
                  title="Download MP3"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}


