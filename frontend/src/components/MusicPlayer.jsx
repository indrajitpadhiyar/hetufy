import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, Download, Heart, Maximize2, Disc,
  Mic2, Laptop2, ListMusic
} from 'lucide-react';
import FullPagePlayer from './FullPagePlayer';
import DynamicIslandPlayer from './DynamicIslandPlayer';

export default function MusicPlayer({
  currentSong,
  songList = [],
  isPlaying,
  setIsPlaying,
  onNext,
  onPrev,
  onPlaySong,
  onDownload,
  isFavorite,
  onToggleFavorite,
  isFullPlayerOpen = false,
  setIsFullPlayerOpen = () => {},
  theme = 'dark',
  setTheme = () => {},
  onOpenSettings = () => {},
  onToggleRightSidebar = () => {}
}) {
  const audioRef = useRef(null);

  // Audio Player State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [isIslandMode, setIsIslandMode] = useState(false);

  // Automatic Dynamic Island mode on browser tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentSong) {
        // Tab changed/hidden: switch to compact Dynamic Island mode in the corner
        setIsIslandMode(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentSong]);

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

      {/* Full Page Sliding Player Overlay */}
      <FullPagePlayer
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        currentSong={currentSong}
        songList={songList}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={() => onNext(isShuffle)}
        onPrev={() => onPrev(isShuffle)}
        onPlaySong={onPlaySong}
        onDownload={onDownload}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={(val) => {
          setVolume(val);
          setIsMuted(false);
        }}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        repeatMode={repeatMode}
        onCycleRepeat={cycleRepeatMode}
        formatTime={formatTime}
        progressPercentage={progressPercentage}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={onOpenSettings}
      />

      {/* Spotify Desktop Bottom Player Bar */}
      <AnimatePresence>
        {!isFullPlayerOpen && !isIslandMode && (
          <motion.footer
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-40 h-[76px] bg-black border-t border-white/10 px-4 flex items-center justify-between text-white select-none shadow-2xl"
          >
            {/* LEFT: Track Info, Cover & Add to Library */}
            <div className="flex items-center min-w-0 w-[240px] lg:w-[320px]">
              <div 
                onClick={() => setIsFullPlayerOpen(true)}
                className="relative w-14 h-14 rounded-[4px] overflow-hidden mr-3.5 shadow-md flex-shrink-0 cursor-pointer group"
                title="Expand full cover"
              >
                <img 
                  src={currentSong.cover} 
                  alt={currentSong.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="overflow-hidden mr-3">
                <h4 
                  onClick={() => setIsFullPlayerOpen(true)}
                  className="font-bold text-sm text-white truncate hover:underline cursor-pointer leading-tight"
                >
                  {currentSong.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate mt-0.5 hover:text-white hover:underline cursor-pointer">
                  {currentSong.artist}
                </p>
              </div>

              {/* Plus in circle (+) or Heart like Spotify */}
              <button
                onClick={() => onToggleFavorite(currentSong.id)}
                className={`p-1.5 transition-colors cursor-pointer flex-shrink-0 ${
                  isFavorite ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
                }`}
                title={isFavorite ? 'Saved to Liked Songs' : 'Save to Liked Songs'}
              >
                <div className={`w-5 h-5 rounded-full border border-current flex items-center justify-center ${
                  isFavorite ? 'border-[#1ed760] bg-[#1ed760]/20' : ''
                }`}>
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#1ed760]' : ''}`} />
                </div>
              </button>
            </div>

            {/* CENTER: Playback Controls & Timeline Slider */}
            <div className="flex flex-col items-center max-w-[722px] w-[45%] min-w-[280px]">
              
              {/* Buttons Row */}
              <div className="flex items-center space-x-5 mb-1.5">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`transition-colors cursor-pointer ${
                    isShuffle ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Enable shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onPrev(isShuffle)}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Previous"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                {/* Big White Circular Play/Pause Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => onNext(isShuffle)}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Next"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={cycleRepeatMode}
                  className={`transition-colors cursor-pointer ${
                    repeatMode !== 'none' ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Enable repeat"
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* Timeline Row */}
              <div className="w-full flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
                <span className="w-8 text-right select-none">{formatTime(currentTime)}</span>
                
                <div className="relative flex-1 flex items-center group cursor-pointer py-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progressPercentage}%, #4d4d4d ${progressPercentage}%, #4d4d4d 100%)`
                    }}
                    className="custom-seek-bar w-full h-1 rounded-full appearance-none cursor-pointer outline-none transition-all group-hover:h-1.5"
                  />
                </div>

                <span className="w-8 text-left select-none">{formatTime(duration)}</span>
              </div>

            </div>

            {/* RIGHT: Now Playing View, Download, Volume, Island & Fullscreen */}
            <div className="flex items-center justify-end space-x-3 w-[240px] lg:w-[320px] text-zinc-400">
              
              {/* Lyrics / Now Playing Toggle */}
              <button
                onClick={onToggleRightSidebar}
                className="hover:text-white transition-colors cursor-pointer p-1"
                title="Now playing view & lyrics preview"
              >
                <Mic2 className="w-4 h-4" />
              </button>

              {/* Download Button */}
              <button
                onClick={() => onDownload(currentSong)}
                className="hover:text-white transition-colors cursor-pointer p-1"
                title="Download MP3"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center space-x-2 group">
                <button onClick={toggleMute} className="hover:text-white transition-colors cursor-pointer">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
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
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${volume * 100}%, #4d4d4d ${volume * 100}%, #4d4d4d 100%)`
                  }}
                  className="custom-volume-bar w-16 lg:w-24 h-1 rounded-full appearance-none cursor-pointer outline-none group-hover:h-1.5 transition-all"
                />
              </div>

              {/* Minimize to Dynamic Island Corner Bubble */}
              <button
                onClick={() => setIsIslandMode(true)}
                className="hover:text-cyan-400 transition-colors cursor-pointer p-1"
                title="Minimize to Dynamic Island (Corner Bubble)"
              >
                <Disc className="w-4 h-4 animate-spin-slow text-cyan-400" />
              </button>

              {/* Fullscreen Player Button */}
              <button
                onClick={() => setIsFullPlayerOpen(true)}
                className="hover:text-white transition-colors cursor-pointer p-1"
                title="Full Screen Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

            </div>

          </motion.footer>
        )}
      </AnimatePresence>

      {/* Dynamic Island Corner Floating Player */}
      {!isFullPlayerOpen && isIslandMode && (
        <DynamicIslandPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNext={() => onNext(isShuffle)}
          onPrev={() => onPrev(isShuffle)}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          onExpandToFullPlayer={() => setIsFullPlayerOpen(true)}
          onRestoreBottomBar={() => setIsIslandMode(false)}
          theme={theme}
        />
      )}
    </>
  );
}


