import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, Download, Heart, ChevronDown, 
  Minimize2, Music, Sparkles, ListMusic
} from 'lucide-react';

const CURATED_PLAYLISTS = [
  {
    id: 'dejavu',
    name: 'DejaVu',
    tracks: '30 tracks',
    gradient: 'from-[#b86124] to-[#7a390e]',
    textColor: 'text-amber-100',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'day',
    name: 'Playlist of the day',
    tracks: '25 tracks',
    gradient: 'from-[#1e4c75] to-[#102a43]',
    textColor: 'text-blue-100',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'new',
    name: 'Something new',
    tracks: '37 tracks',
    gradient: 'from-[#654e80] to-[#3f2f53]',
    textColor: 'text-purple-100',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'exclusive',
    name: 'Exclusive show',
    tracks: '17 tracks',
    gradient: 'from-[#3e563d] to-[#243523]',
    textColor: 'text-emerald-100',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'
  }
];

// Stagger Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 24,
      stiffness: 280
    }
  }
};

export default function FullPagePlayer({
  isOpen,
  onClose,
  currentSong,
  songList = [],
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onPlaySong,
  onDownload,
  isFavorite,
  onToggleFavorite,
  currentTime = 0,
  duration = 0,
  onSeek,
  volume = 0.8,
  onVolumeChange,
  isMuted = false,
  onToggleMute,
  isShuffle = false,
  onToggleShuffle,
  repeatMode = 'none',
  onCycleRepeat,
  formatTime,
  progressPercentage = 0,
  theme = 'light',
  setTheme = () => {}
}) {
  if (!currentSong) return null;

  const isDark = theme === 'dark';

  // Recommendations (excluding current song)
  const recommendations = songList.filter(s => s.id !== currentSong.id).slice(0, 4);
  const queueTracks = songList.length > 0 ? songList : [currentSong];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="fullpage-player-overlay"
          initial={{ y: "100%", opacity: 0.3 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.3 }}
          transition={{
            type: "spring",
            damping: 32,
            stiffness: 260,
            mass: 0.9
          }}
          className={`fixed inset-0 z-50 flex flex-col overflow-hidden font-sans select-none transition-colors duration-300 ${
            isDark ? 'bg-[#121316] text-[#e6e8ec]' : 'bg-[#fbfaf8] text-[#1c1b18]'
          }`}
        >
          {/* Top Header Bar */}
          <div className={`flex items-center justify-between px-6 md:px-10 py-4 border-b shrink-0 z-20 backdrop-blur-md transition-colors ${
            isDark 
              ? 'border-white/5 bg-[#121316]/80 text-white' 
              : 'border-[#e8e2d8] bg-[#fbfaf8]/85 text-[#1c1b18]'
          }`}>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                <span>Main</span>
                <span className={`text-xs font-normal px-2.5 py-0.5 rounded-full ${
                  isDark ? 'bg-white/10 text-zinc-400' : 'bg-[#ede8df] text-[#5e584f]'
                }`}>
                  Now Playing
                </span>
              </h1>
            </div>

            {/* Right Top Header Actions: Theme Quick-Toggle, Settings, Minimize */}
            <div className="flex items-center gap-2.5">
              

              {/* Collapse / Minimize Action */}
              <button
                onClick={onClose}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer active:scale-95 text-xs font-medium ${
                  isDark 
                    ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white' 
                    : 'bg-[#1c1b18] text-[#f6f3eb] hover:bg-black border-[#1c1b18]'
                }`}
                title="Minimize to floating player"
              >
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                <span className="hidden sm:inline">Minimize</span>
              </button>

            </div>
          </div>

          {/* Main Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-10 py-6 pb-32">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* ========================================================
                  LEFT COLUMN: Featured Banner, Playlists, You May Like
                  ======================================================== */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                
                {/* 1. Featured Big Hero Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="relative rounded-3xl bg-gradient-to-r from-[#1b4330] via-[#24543d] to-[#163827] p-6 sm:p-8 md:p-10 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[220px] md:min-h-[250px] border border-emerald-500/20 text-white"
                >
                  {/* Stylized Starburst Graphic in Background */}
                  <div className="absolute right-6 sm:right-16 md:right-24 top-1/2 -translate-y-1/2 w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 pointer-events-none opacity-90">
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                      viewBox="0 0 200 200"
                      className="w-full h-full text-[#ff4c3b] fill-current"
                    >
                      <path d="M100 0 L115 65 L180 35 L135 90 L200 100 L135 110 L180 165 L115 135 L100 200 L85 135 L20 165 L65 110 L0 100 L65 90 L20 35 L85 65 Z" />
                    </motion.svg>
                  </div>

                  {/* Cutout/Cover Artwork on the Right */}
                  <div className="absolute right-4 sm:right-10 md:right-16 bottom-0 w-36 sm:w-48 md:w-56 h-40 sm:h-52 md:h-60 flex items-end justify-center pointer-events-none z-10">
                    <motion.img
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      src={currentSong.cover}
                      alt={currentSong.title}
                      className="w-full h-full object-cover object-top rounded-2xl shadow-2xl ring-2 ring-white/20"
                    />
                  </div>

                  {/* Left Hero Content */}
                  <div className="relative z-10 max-w-[60%] sm:max-w-[65%] flex flex-col justify-between h-full">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-200/90 uppercase mb-1">
                        {currentSong.artist || 'Featured Artist'}
                      </p>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md">
                        {currentSong.title}
                      </h2>
                    </div>

                    <div className="pt-6 sm:pt-8">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={onTogglePlay}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#121316] font-bold text-xs sm:text-sm shadow-xl hover:bg-zinc-100 transition-all cursor-pointer"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                            <span>Listen now</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* 2. "Playlists for you" Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-[#1c1b18]'
                    }`}>
                      Playlists for you
                    </h3>
                    <span className={`text-xs transition-colors cursor-pointer font-medium ${
                      isDark ? 'text-zinc-400 hover:text-white' : 'text-[#7d776f] hover:text-[#1c1b18]'
                    }`}>
                      View all
                    </span>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                  >
                    {CURATED_PLAYLISTS.map((pl) => (
                      <motion.div
                        key={pl.id}
                        variants={itemVariants}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group relative rounded-2xl bg-gradient-to-br ${pl.gradient} p-3 sm:p-4 aspect-square flex flex-col justify-between overflow-hidden cursor-pointer shadow-lg border border-white/10`}
                      >
                        <div className="relative z-10">
                          <h4 className="font-bold text-sm sm:text-base text-white leading-tight">
                            {pl.name}
                          </h4>
                          <p className={`text-[11px] ${pl.textColor} opacity-80 mt-0.5 font-medium`}>
                            {pl.tracks}
                          </p>
                        </div>

                        {/* Artist photo embedded inside card */}
                        <div className="relative w-full flex justify-end mt-2">
                          <img
                            src={pl.image}
                            alt={pl.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* 3. "You may also like" Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-[#1c1b18]'
                    }`}>
                      You may also like
                    </h3>
                    <span className={`text-xs transition-colors cursor-pointer font-medium ${
                      isDark ? 'text-zinc-400 hover:text-white' : 'text-[#7d776f] hover:text-[#1c1b18]'
                    }`}>
                      View all
                    </span>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {recommendations.map((song) => (
                      <motion.div
                        key={`rec-${song.id}`}
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onPlaySong(song)}
                        className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                          isDark
                            ? 'bg-[#1a1b20] hover:bg-[#22242b] border-white/5 hover:border-white/15'
                            : 'bg-white hover:bg-[#f6f2ea] border-[#e8e2d8] hover:border-[#1c1b18]/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-800 shadow-sm">
                            <img
                              src={song.cover}
                              alt={song.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Play className="w-4 h-4 text-white fill-current" />
                            </div>
                          </div>

                          <div className="overflow-hidden">
                            <h4 className={`text-sm font-semibold truncate transition-colors ${
                              isDark ? 'text-white group-hover:text-emerald-400' : 'text-[#1c1b18] group-hover:text-black font-medium'
                            }`}>
                              {song.title}
                            </h4>
                            <p className={`text-xs truncate mt-0.5 ${
                              isDark ? 'text-zinc-400' : 'text-[#7d776f]'
                            }`}>
                              {song.artist}
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-mono shrink-0 pl-3 ${
                          isDark ? 'text-zinc-400' : 'text-[#7d776f]'
                        }`}>
                          {formatTime(song.duration || 180)}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

              </div>

              {/* ========================================================
                  RIGHT COLUMN: "Now playing" / Animated Queue List
                  ======================================================== */}
              <div className={`lg:col-span-4 rounded-3xl p-5 md:p-6 border shadow-xl flex flex-col transition-colors ${
                isDark 
                  ? 'bg-[#18191f] border-white/5' 
                  : 'bg-white border-[#e8e2d8] shadow-md'
              }`}>
                
                {/* Header */}
                <div className={`flex items-center justify-between pb-4 mb-2 border-b ${
                  isDark ? 'border-white/5' : 'border-[#e8e2d8]'
                }`}>
                  <div className="flex items-center gap-2">
                    <ListMusic className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h3 className={`text-base font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-[#1c1b18]'
                    }`}>
                      Now playing
                    </h3>
                  </div>
                  <span className={`text-xs transition-colors cursor-pointer font-medium ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-[#7d776f] hover:text-[#1c1b18]'
                  }`}>
                    View all
                  </span>
                </div>

                {/* Animated Song Queue */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-1.5 overflow-y-auto max-h-[620px] pr-1"
                >
                  {queueTracks.map((song, idx) => {
                    const isTrackActive = currentSong.id === song.id;

                    return (
                      <motion.div
                        key={`queue-${song.id || idx}`}
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onPlaySong(song)}
                        className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                          isTrackActive
                            ? isDark
                              ? 'bg-white/10 text-white shadow-inner border border-white/10'
                              : 'bg-[#eee9df] text-[#1c1b18] border border-[#d6cfc4] shadow-xs font-semibold'
                            : isDark
                              ? 'hover:bg-white/5 text-zinc-300 hover:text-white'
                              : 'hover:bg-[#f7f4ed] text-[#3e3b35] hover:text-[#1c1b18]'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Artwork Thumbnail */}
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-800 shadow-sm">
                            <img
                              src={song.cover}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Soundwave equalizer indicator if active and playing */}
                            {isTrackActive && isPlaying && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-0.5 px-2">
                                <motion.span
                                  animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                                  transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
                                  className="w-0.5 bg-emerald-400 rounded-full"
                                />
                                <motion.span
                                  animate={{ height: ["70%", "30%", "90%", "20%", "70%"] }}
                                  transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                                  className="w-0.5 bg-emerald-400 rounded-full"
                                />
                                <motion.span
                                  animate={{ height: ["40%", "80%", "20%", "100%", "40%"] }}
                                  transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut" }}
                                  className="w-0.5 bg-emerald-400 rounded-full"
                                />
                              </div>
                            )}
                          </div>

                          <div className="overflow-hidden">
                            <h4 className={`text-sm font-semibold truncate leading-tight ${
                              isTrackActive 
                                ? isDark ? 'text-white' : 'text-[#1c1b18]' 
                                : isDark ? 'text-zinc-200' : 'text-[#2e2b26]'
                            }`}>
                              {song.title}
                            </h4>
                            <p className={`text-xs truncate mt-0.5 font-normal ${
                              isDark ? 'text-zinc-400' : 'text-[#7d776f]'
                            }`}>
                              {song.artist}
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-mono shrink-0 pl-2 ${
                          isDark ? 'text-zinc-400' : 'text-[#7d776f]'
                        }`}>
                          {formatTime(song.duration || 180)}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>

              </div>

            </div>
          </div>

          {/* ========================================================
              BOTTOM BAR: Integrated Player Controls & Timeline
              ======================================================== */}
          <div className={`fixed bottom-0 left-0 right-0 z-30 border-t px-4 sm:px-8 py-3.5 shadow-2xl backdrop-blur-xl transition-colors ${
            isDark 
              ? 'bg-[#16171b]/95 border-white/10 text-white' 
              : 'bg-white/95 border-[#e8e2d8] text-[#1c1b18]'
          }`}>
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Left: Current Track Details */}
              <div className="flex items-center justify-between w-full md:w-1/4">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-800 shadow-md">
                    <img
                      src={currentSong.cover}
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="overflow-hidden">
                    <h4 className={`text-sm font-bold truncate leading-tight ${
                      isDark ? 'text-white' : 'text-[#1c1b18]'
                    }`}>
                      {currentSong.title}
                    </h4>
                    <p className={`text-xs truncate mt-0.5 ${
                      isDark ? 'text-zinc-400' : 'text-[#7d776f]'
                    }`}>
                      {currentSong.artist}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleFavorite(currentSong.id)}
                  className={`p-2 rounded-full transition-all ml-2 cursor-pointer ${
                    isFavorite
                      ? 'text-rose-500 fill-rose-500'
                      : isDark ? 'text-zinc-400 hover:text-white' : 'text-[#7d776f] hover:text-[#1c1b18]'
                  }`}
                  title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Center: Controls & Timeline */}
              <div className="flex flex-col items-center w-full md:w-2/4 space-y-1">
                {/* Controls */}
                <div className="flex items-center space-x-5">
                  <button
                    onClick={onToggleShuffle}
                    className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      isShuffle 
                        ? isDark ? 'text-white' : 'text-[#1c1b18]' 
                        : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-[#7d776f] hover:text-[#1c1b18]'
                    }`}
                    title="Shuffle"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onPrev}
                    className={`p-1.5 transition-colors cursor-pointer ${
                      isDark ? 'text-zinc-300 hover:text-white' : 'text-[#1c1b18] hover:text-black'
                    }`}
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={onTogglePlay}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer ${
                      isDark 
                        ? 'bg-white text-[#121316]' 
                        : 'bg-[#1c1b18] text-[#f6f3eb]'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={onNext}
                    className={`p-1.5 transition-colors cursor-pointer ${
                      isDark ? 'text-zinc-300 hover:text-white' : 'text-[#1c1b18] hover:text-black'
                    }`}
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={onCycleRepeat}
                    className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      repeatMode !== 'none' 
                        ? isDark ? 'text-white' : 'text-[#1c1b18]' 
                        : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-[#7d776f] hover:text-[#1c1b18]'
                    }`}
                    title="Repeat Mode"
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Seek Timeline */}
                <div className={`w-full flex items-center space-x-3 text-xs font-mono ${
                  isDark ? 'text-zinc-400' : 'text-[#7d776f]'
                }`}>
                  <span className="w-8 text-right">{formatTime(currentTime)}</span>
                  
                  <div className="relative flex-1 flex items-center h-4">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={onSeek}
                      style={{
                        background: isDark
                          ? `linear-gradient(to right, #ffffff 0%, #ffffff ${progressPercentage}%, rgba(255, 255, 255, 0.2) ${progressPercentage}%, rgba(255, 255, 255, 0.2) 100%)`
                          : `linear-gradient(to right, #1c1b18 0%, #1c1b18 ${progressPercentage}%, rgba(28, 27, 24, 0.15) ${progressPercentage}%, rgba(28, 27, 24, 0.15) 100%)`
                      }}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer outline-none transition-all"
                    />
                  </div>

                  <span className="w-8 text-left">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: Volume, Settings & Minimize */}
              <div className="hidden lg:flex items-center justify-end space-x-3 w-1/4">
                {/* Volume Slider */}
                <div className="flex items-center space-x-2">
                  <button onClick={onToggleMute} className={`cursor-pointer ${
                    isDark ? 'text-zinc-300 hover:text-white' : 'text-[#1c1b18] hover:text-black'
                  }`}>
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    style={{
                      background: isDark
                        ? `linear-gradient(to right, #ffffff 0%, #ffffff ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%, rgba(255, 255, 255, 0.2) 100%)`
                        : `linear-gradient(to right, #1c1b18 0%, #1c1b18 ${volume * 100}%, rgba(28, 27, 24, 0.15) ${volume * 100}%, rgba(28, 27, 24, 0.15) 100%)`
                    }}
                    className="w-16 h-1 rounded-lg appearance-none cursor-pointer outline-none"
                  />
                </div>

                {/* Download */}
                <button
                  onClick={() => onDownload(currentSong)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/15 border-white/10 text-zinc-300 hover:text-white'
                      : 'bg-[#eee9df] hover:bg-[#e4ded4] border-[#d6cfc4] text-[#1c1b18]'
                  }`}
                  title="Download MP3"
                >
                  <Download className="w-4 h-4" />
                </button>


                {/* Minimize Toggle */}
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                      : 'bg-[#1c1b18] text-[#f6f3eb] hover:bg-black border-[#1c1b18]'
                  }`}
                  title="Minimize Player"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>


        </motion.div>
      )}
    </AnimatePresence>
  );
}
