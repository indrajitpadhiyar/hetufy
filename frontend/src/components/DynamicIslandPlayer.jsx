import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Plus, Radio, 
  Maximize2, Headphones, Minimize2, Check, Sparkles, Volume2, PanelBottom
} from 'lucide-react';

export default function DynamicIslandPlayer({
  currentSong,
  isPlaying,
  setIsPlaying,
  onNext,
  onPrev,
  onToggleFavorite,
  isFavorite = false,
  currentTime = 0,
  duration = 0,
  onSeek = () => {},
  onExpandToFullPlayer = () => {},
  onRestoreBottomBar = () => {},
  theme = 'light'
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [wavePhase, setWavePhase] = useState(0);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);
  const [isPipActive, setIsPipActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const hoverTimeoutRef = useRef(null);
  const svgRef = useRef(null);
  const pipWindowRef = useRef(null);

  const audioDevices = [
    'OnePlus Bullets Wireless',
    'Hetufy Studio Audio',
    'AirPods Pro (Spatial)',
    'Stereo Hi-Fi Speakers'
  ];

  // Animate the squiggly sine wave when music is playing
  useEffect(() => {
    let animId;
    if (isPlaying) {
      const animateWave = () => {
        setWavePhase(prev => (prev + 0.12) % (Math.PI * 2));
        animId = requestAnimationFrame(animateWave);
      };
      animId = requestAnimationFrame(animateWave);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Tab switch detection: Update document title and sync state
  useEffect(() => {
    if (!currentSong) return;

    let titleInterval;
    const originalTitle = document.title;

    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Tab is hidden: update tab title with animated rhythm
        const notes = ['♪', '♫', '♬', '♩'];
        let noteIdx = 0;
        titleInterval = setInterval(() => {
          document.title = `${notes[noteIdx % notes.length]} ${currentSong.title} - ${currentSong.artist}`;
          noteIdx++;
        }, 1200);
      } else {
        if (titleInterval) clearInterval(titleInterval);
        document.title = isPlaying 
          ? `▶ ${currentSong.title} • Hetufy` 
          : 'Hetufy - Music Library';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (titleInterval) clearInterval(titleInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.title = originalTitle;
    };
  }, [currentSong, isPlaying]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return; // Keep open if pinned by click
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 450);
  };

  const handleClick = (e) => {
    // If not expanded, expand and pin
    if (!isExpanded) {
      setIsExpanded(true);
      setIsPinned(true);
    }
  };

  const togglePin = (e) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
  };

  const handleCollapse = (e) => {
    e.stopPropagation();
    setIsPinned(false);
    setIsExpanded(false);
  };

  // Cycle connected audio output device
  const cycleAudioDevice = (e) => {
    e.stopPropagation();
    const nextIdx = (activeDeviceIndex + 1) % audioDevices.length;
    setActiveDeviceIndex(nextIdx);
    setToastMessage(`Switched to: ${audioDevices[nextIdx]}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  // Interactive Squiggly Seek Bar scrubbing
  const handleSeekFromEvent = (clientX) => {
    if (!svgRef.current || !duration) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const newProgress = clickX / rect.width;
    const targetTime = newProgress * duration;
    onSeek({ target: { value: targetTime } });
  };

  const handleSeekPointerDown = (e) => {
    e.stopPropagation();
    handleSeekFromEvent(e.clientX);

    const onPointerMove = (moveEvent) => {
      handleSeekFromEvent(moveEvent.clientX);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Document Picture-in-Picture (PiP) support for true cross-tab floating
  const toggleDocumentPiP = async (e) => {
    e.stopPropagation();

    if ('documentPictureInPicture' in window) {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
        pipWindowRef.current = null;
        setIsPipActive(false);
        return;
      }

      try {
        const pipWin = await window.documentPictureInPicture.requestWindow({
          width: 390,
          height: 185
        });
        pipWindowRef.current = pipWin;
        setIsPipActive(true);

        // Copy styles to PiP window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pipWin.document.head.appendChild(style);
          } catch (e) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media;
            link.href = styleSheet.href;
            pipWin.document.head.appendChild(link);
          }
        });

        // Set PiP container HTML
        pipWin.document.body.style.margin = '0';
        pipWin.document.body.style.backgroundColor = '#0b161f';
        pipWin.document.body.style.overflow = 'hidden';
        pipWin.document.body.style.display = 'flex';
        pipWin.document.body.style.alignItems = 'center';
        pipWin.document.body.style.justifyContent = 'center';

        const container = document.createElement('div');
        container.id = 'pip-root';
        container.style.width = '100%';
        container.style.height = '100%';
        pipWin.document.body.appendChild(container);

        const renderPiPContent = () => {
          container.innerHTML = `
            <div style="position:relative; width:100%; height:100%; overflow:hidden; font-family:system-ui,sans-serif; color:white; background:url('${currentSong.cover}') center/cover no-repeat;">
              <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(14,28,38,0.95), rgba(14,28,38,0.65)); backdrop-filter:blur(12px);"></div>
              <div style="position:relative; z-index:10; padding:12px 14px; display:flex; flex-direction:column; justify-content:space-between; height:100%; box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:11px; font-weight:700; color:#c8e6f5; display:flex; align-items:center; gap:4px;">
                    ● Hetufy Mini PiP
                  </span>
                  <span style="font-size:11px; background:#c8e6f5; color:#0e2c3a; padding:2px 8px; border-radius:99px; font-weight:600;">
                    🎧 ${audioDevices[activeDeviceIndex]}
                  </span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin:4px 0;">
                  <div style="max-width:260px;">
                    <div style="font-size:16px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${currentSong.title}</div>
                    <div style="font-size:12px; color:#cbd5e1; margin-top:2px;">${currentSong.artist}</div>
                  </div>
                  <button id="pip-play-btn" style="width:44px; height:44px; border-radius:14px; background:#c8e6f5; color:#0e2c3a; border:none; cursor:pointer; font-weight:900; font-size:16px; display:flex; align-items:center; justify-content:center;">
                    ${isPlaying ? '❚❚' : '▶'}
                  </button>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; color:#94a3b8;">
                  <button id="pip-prev-btn" style="background:transparent; border:none; color:white; cursor:pointer; font-size:14px;">|◀</button>
                  <div style="flex:1; margin:0 10px; height:4px; background:rgba(255,255,255,0.2); border-radius:4px; overflow:hidden;">
                    <div style="width:${duration > 0 ? (currentTime / duration) * 100 : 0}%; height:100%; background:#c8e6f5;"></div>
                  </div>
                  <button id="pip-next-btn" style="background:transparent; border:none; color:white; cursor:pointer; font-size:14px;">▶|</button>
                </div>
              </div>
            </div>
          `;

          const playBtn = container.querySelector('#pip-play-btn');
          if (playBtn) playBtn.onclick = () => setIsPlaying(!isPlaying);

          const prevBtn = container.querySelector('#pip-prev-btn');
          if (prevBtn) prevBtn.onclick = () => onPrev();

          const nextBtn = container.querySelector('#pip-next-btn');
          if (nextBtn) nextBtn.onclick = () => onNext();
        };

        renderPiPContent();

        pipWin.addEventListener('pagehide', () => {
          pipWindowRef.current = null;
          setIsPipActive(false);
        });

      } catch (err) {
        console.warn('Document PiP request was blocked or failed:', err);
        onExpandToFullPlayer();
      }
    } else {
      // Fallback: Expand to Full Screen Player
      onExpandToFullPlayer();
    }
  };

  if (!currentSong) return null;

  // Calculate Squiggly Progress
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const seekbarWidth = 175; // SVG coordinate width
  const playedX = Math.round(progressRatio * seekbarWidth);

  // Generate sinusoidal squiggly path for the played portion
  const generateSquigglePath = () => {
    if (playedX <= 0) return 'M 0 12';
    
    // If paused, straight line; if playing, lively sine wave
    if (!isPlaying) {
      return `M 0 12 L ${playedX} 12`;
    }

    const amplitude = 3.2; // wave height
    const wavelength = 16; // wave period length
    let path = 'M 0 12 ';
    
    const steps = Math.max(1, Math.floor(playedX / 2));
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * playedX;
      const y = 12 + Math.sin((x / wavelength) * Math.PI * 2 - wavePhase) * amplitude;
      path += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return path;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <motion.div
        layout
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 28,
          mass: 0.8
        }}
        className={`relative overflow-hidden cursor-pointer shadow-2xl transition-shadow ${
          isExpanded
            ? 'w-[370px] sm:w-[390px] h-[175px] rounded-[28px] ring-1 ring-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.65)]'
            : 'w-14 h-14 rounded-full ring-2 ring-cyan-400/50 shadow-[0_8px_30px_rgba(6,182,212,0.35)]'
        }`}
        style={{
          background: '#0b1620'
        }}
      >
        {/* ================= COMPACT STATE ("ek chhote se round me") ================= */}
        {!isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full flex items-center justify-center p-1"
          >
            {/* Spinning Vinyl Album Art */}
            <div className="relative w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
              <img 
                src={currentSong.cover} 
                alt={currentSong.title}
                className={`w-full h-full object-cover rounded-full ${isPlaying ? 'animate-vinyl' : ''}`}
              />
              
              {/* Vinyl center hole & specular sheen */}
              <div className="absolute w-3.5 h-3.5 rounded-full bg-[#0b1620] border-2 border-white/60 flex items-center justify-center shadow-inner">
                <div className="w-1 h-1 rounded-full bg-cyan-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
            </div>

            {/* Live pulsing soundwave aura when playing */}
            {isPlaying && (
              <span className="absolute -inset-1 rounded-full ring-2 ring-cyan-400/40 animate-ping opacity-60 pointer-events-none" />
            )}

            {/* Miniature audio equalizer bars overlay */}
            <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md rounded-full px-1.5 py-0.5 flex items-center gap-[2px] border border-white/20">
              <span className={`w-[2px] bg-cyan-400 rounded-full transition-all ${isPlaying ? 'h-2 animate-bounce' : 'h-1'}`} />
              <span className={`w-[2px] bg-cyan-300 rounded-full transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1.5'}`} />
              <span className={`w-[2px] bg-cyan-400 rounded-full transition-all ${isPlaying ? 'h-2 animate-bounce delay-100' : 'h-1'}`} />
            </div>
          </motion.div>
        )}

        {/* ================= EXPANDED STATE (Matching Reference Image) ================= */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex flex-col justify-between p-4 overflow-hidden text-white"
          >
            {/* Blurred Album Art Background (Exact tone from Reference Image) */}
            <div 
              className="absolute inset-0 bg-cover bg-center scale-105 filter blur-[2px] brightness-[0.55] saturate-[1.25]"
              style={{ backgroundImage: `url(${currentSong.cover})` }}
            />
            {/* Gradient Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1822]/95 via-[#0e212f]/70 to-[#0e212f]/40 pointer-events-none" />

            {/* TOP BAR: Spotify Logo (Left) & Device Pill (Right) */}
            <div className="relative z-10 flex items-center justify-between">
              
              {/* Spotify Logo */}
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
                  title="Hetufy Spotify Edition"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
              </div>

              {/* Top-Right: Device Pill & Window Controls */}
              <div className="flex items-center space-x-2">
                {/* Connected Audio Device Pill */}
                <button
                  onClick={cycleAudioDevice}
                  className="bg-[#c8e6f5] hover:bg-[#b5e0f5] text-[#0f2c3a] font-semibold text-[11px] px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  title="Click to switch audio output device"
                >
                  <Headphones className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="max-w-[140px] truncate">{audioDevices[activeDeviceIndex]}</span>
                </button>

                {/* Restore Bottom Bar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestoreBottomBar();
                  }}
                  className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Dock as Bottom Player Bar"
                >
                  <PanelBottom className="w-3.5 h-3.5" />
                </button>

                {/* Close/Minimize Button */}
                <button
                  onClick={handleCollapse}
                  className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Minimize to Round Island Bubble"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* MIDDLE SECTION: Song Title, [E] Badge, Artist & Big Play/Pause Button */}
            <div className="relative z-10 flex items-center justify-between my-auto">
              
              {/* Title & Artist Information */}
              <div className="overflow-hidden pr-3 max-w-[260px]">
                <h4 className="font-bold text-[19px] sm:text-[20px] text-white tracking-tight leading-tight truncate drop-shadow-sm">
                  {currentSong.title}
                </h4>
                
                <div className="flex items-center mt-1">
                  {/* [E] Explicit Badge matching reference */}
                  <span className="border border-white/70 text-white/90 text-[10px] font-bold px-1 py-0.5 rounded-[3px] leading-none mr-2 select-none">
                    E
                  </span>
                  <p className="text-[13px] text-zinc-200 font-medium truncate drop-shadow-sm">
                    {currentSong.artist}
                  </p>
                </div>
              </div>

              {/* Big Rounded Play/Pause Button (Light Cyan Squircle) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="w-12 h-12 rounded-2xl bg-[#c8e6f5] hover:bg-[#b0dfec] text-[#0f2c3a] flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer flex-shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-5 bg-[#0f2c3a] rounded-sm" />
                    <div className="w-1.5 h-5 bg-[#0f2c3a] rounded-sm" />
                  </div>
                ) : (
                  <Play className="w-5 h-5 fill-[#0f2c3a] text-[#0f2c3a] ml-0.5" />
                )}
              </button>

            </div>

            {/* BOTTOM SECTION: Skip Previous, Squiggly Seek Bar, Skip Next, +, Radio & PiP */}
            <div className="relative z-10 flex items-center justify-between gap-1.5 pt-1">
              
              {/* Skip Back Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="p-1 text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Interactive Squiggly / Wavy Seek Bar (Android 13 / Spotify Style) */}
              <div 
                ref={svgRef}
                onPointerDown={handleSeekPointerDown}
                className="relative flex-1 h-6 flex items-center cursor-pointer group mx-1"
                title="Click or drag to seek"
              >
                <svg
                  viewBox={`0 0 ${seekbarWidth} 24`}
                  className="w-full h-6 overflow-visible pointer-events-none"
                  preserveAspectRatio="none"
                >
                  {/* Played Wavy Path */}
                  <path
                    d={generateSquigglePath()}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Scrubber Thumb (Vertical Rounded Bar) */}
                  <rect
                    x={Math.max(1, Math.min(seekbarWidth - 4, playedX - 1.5))}
                    y="5"
                    width="3.5"
                    height="14"
                    rx="1.75"
                    fill="#ffffff"
                    className="drop-shadow-md"
                  />

                  {/* Remaining Faded Straight Track */}
                  <line
                    x1={Math.min(seekbarWidth, playedX + 2)}
                    y1="12"
                    x2={seekbarWidth}
                    y2="12"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Skip Forward Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="p-1 text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Plus Circle (Add to Playlist / Favorites) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(currentSong.id);
                  setToastMessage(isFavorite ? 'Removed from favorites' : 'Added to favorites');
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
                className={`p-1 rounded-full transition-transform active:scale-90 cursor-pointer ${
                  isFavorite ? 'text-amber-300' : 'text-white/90 hover:text-white'
                }`}
                title={isFavorite ? 'Saved in Library' : 'Add to Playlist / Favorites'}
              >
                <div className={`w-5 h-5 rounded-full border-[1.8px] flex items-center justify-center ${
                  isFavorite ? 'border-amber-300 bg-amber-300/20' : 'border-current'
                }`}>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>

              {/* Broadcast / Radio Wave Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToastMessage('Surround Sound Active 3D');
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
                className="p-1 text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Surround Broadcast Audio"
              >
                <Radio className="w-5 h-5" />
              </button>

              {/* Picture-in-Picture / Corner Expand Icon (From Reference Image) */}
              <button
                onClick={toggleDocumentPiP}
                className="p-1 text-white/70 hover:text-white hover:scale-110 transition-transform cursor-pointer"
                title="Picture-in-Picture (Float across browser tabs)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

            </div>

            {/* Dynamic Toast Feedback Overlay */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-x-3 bottom-14 py-1.5 px-3 bg-black/90 backdrop-blur-md rounded-xl text-center text-xs font-semibold text-cyan-300 border border-white/20 z-30 shadow-xl"
                >
                  {toastMessage}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
