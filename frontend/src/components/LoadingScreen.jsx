import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isLogoRevealed, setIsLogoRevealed] = useState(false);

  useEffect(() => {
    // Reveal 3D filled logo after the drawing sketch forms
    const logoTimer = setTimeout(() => {
      setIsLogoRevealed(true);
    }, 1100);

    // Smooth progress simulation from 0% to 100% in ~2.0 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 350);
          return 100;
        }
        const increment = Math.floor(Math.random() * 12) + 8;
        return Math.min(100, prev + increment);
      });
    }, 130);

    return () => {
      clearTimeout(logoTimer);
      clearInterval(interval);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#08080a] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background radial atmosphere & neon green glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.28, 0.15]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] bg-[#1ed760] rounded-full blur-[140px] pointer-events-none"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,215,96,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Drawing Animation Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center relative z-10"
      >
        {/* Animated Drawing Canvas */}
        <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
          
          {/* SVG Vector Drawing Lines */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full absolute inset-0 z-20 overflow-visible"
            fill="none"
          >
            <defs>
              {/* Vibrant neon glow filter */}
              <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="drawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#1ed760" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            {/* 1. Outer App Squircle Outline Drawing */}
            <motion.rect
              x="12"
              y="12"
              width="176"
              height="176"
              rx="40"
              stroke="url(#drawGrad)"
              strokeWidth="2.5"
              strokeDasharray="600"
              strokeDashoffset="600"
              filter="url(#neon-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0.8] }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />

            {/* 2. Left Equalizer Soundwave Bars Drawing */}
            {[
              { x: 32, y: 88, h: 24, delay: 0.1 },
              { x: 43, y: 74, h: 52, delay: 0.2 },
              { x: 54, y: 60, h: 80, delay: 0.3 },
              { x: 65, y: 78, h: 44, delay: 0.4 }
            ].map((bar, i) => (
              <motion.rect
                key={`left-bar-${i}`}
                x={bar.x}
                y={bar.y}
                width="5.5"
                height={bar.h}
                rx="2.75"
                stroke="#1ed760"
                strokeWidth="2"
                filter="url(#neon-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: bar.delay, ease: 'easeOut' }}
              />
            ))}

            {/* 3. Right Equalizer Soundwave Bars Drawing */}
            {[
              { x: 130, y: 78, h: 44, delay: 0.4 },
              { x: 141, y: 60, h: 80, delay: 0.3 },
              { x: 152, y: 74, h: 52, delay: 0.2 },
              { x: 163, y: 88, h: 24, delay: 0.1 }
            ].map((bar, i) => (
              <motion.rect
                key={`right-bar-${i}`}
                x={bar.x}
                y={bar.y}
                width="5.5"
                height={bar.h}
                rx="2.75"
                stroke="#1ed760"
                strokeWidth="2"
                filter="url(#neon-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: bar.delay, ease: 'easeOut' }}
              />
            ))}

            {/* 4. Main "ID" Ribbon Outline Path */}
            <motion.path
              d="M 82 142 L 82 60 C 82 60, 102 54, 118 64 C 132 73, 134 94, 134 104 C 134 126, 122 142, 98 142 Z"
              stroke="#1ed760"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neon-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
            />

            {/* 5. 3D Ribbon Fold Curve */}
            <motion.path
              d="M 94 57 L 118 48 C 126 45, 132 50, 134 56 L 124 64"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#neon-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeInOut' }}
            />

            {/* 6. Musical Note Stem & Hook Drawing */}
            <motion.path
              d="M 112 118 L 112 70 C 112 70, 118 64, 126 66 C 128 67, 130 70, 128 73 C 125 74, 119 74, 117 80 L 117 106"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neon-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5, ease: 'easeInOut' }}
            />

            {/* 7. Circular Notehead Drawing */}
            <motion.circle
              cx="103"
              cy="118"
              r="14"
              stroke="#1ed760"
              strokeWidth="3"
              filter="url(#neon-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeInOut' }}
            />

            {/* 8. Play Triangle ▶ inside notehead Drawing */}
            <motion.polygon
              points="99,111 110,118 99,125"
              stroke="#ffffff"
              strokeWidth="2"
              fill="rgba(30,215,96,0.3)"
              strokeLinejoin="round"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9, ease: 'backOut' }}
            />
          </svg>

          {/* Full High-Res 3D Logo revealed smoothly once lines form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{
              opacity: isLogoRevealed ? 1 : 0,
              scale: isLogoRevealed ? [0.95, 1.02, 1] : 0.88
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-36 h-36 rounded-3xl overflow-hidden p-1 bg-black/60 shadow-[0_0_55px_rgba(30,215,96,0.65)] border border-[#1ed760]/30 z-10 flex items-center justify-center relative"
          >
            <img
              src="./idrmusic.png"
              alt="IDRMusic Logo"
              className="w-full h-full object-contain rounded-2xl"
              onError={(e) => {
                if (!e.target.src.includes('/idrmusic.png')) {
                  e.target.src = '/idrmusic.png';
                }
              }}
            />

            {/* Radiant light sweep over the logo */}
            {isLogoRevealed && (
              <motion.div
                initial={{ x: '-100%', opacity: 0.8 }}
                animate={{ x: '200%', opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
              />
            )}
          </motion.div>

          {/* Expanding Neon Shockwave ring */}
          {isLogoRevealed && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 rounded-3xl border-2 border-[#1ed760] pointer-events-none"
            />
          )}
        </div>

        {/* Brand Name with Animated Underline */}
        <div className="flex flex-col items-center mb-1">
          <motion.h1
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-black text-white tracking-tight flex items-center gap-2"
          >
            <span>IDRMusic</span>
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2.5 h-2.5 rounded-full bg-[#1ed760] shadow-[0_0_10px_#1ed760]"
            />
          </motion.h1>

          {/* Glowing line drawing under text */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
            className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#1ed760] to-transparent mt-1.5"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-xs text-zinc-400 font-medium tracking-widest uppercase mb-6"
        >
          Written to be Sung
        </motion.p>

        {/* Dynamic Equalizer Bar Visualizer */}
        <div className="flex items-center gap-1.5 h-6 mb-7">
          {[0.5, 1.2, 0.7, 1.6, 0.9, 1.4, 0.6, 1.1, 0.4].map((heightScale, i) => (
            <motion.span
              key={i}
              animate={{ scaleY: [0.25, heightScale, 0.25] }}
              transition={{
                repeat: Infinity,
                duration: 0.7 + (i % 4) * 0.15,
                ease: 'easeInOut'
              }}
              className="w-1 bg-[#1ed760] rounded-full h-5 origin-bottom shadow-[0_0_6px_rgba(30,215,96,0.6)]"
            />
          ))}
        </div>

        {/* Sleek Progress Bar with Glowing Head */}
        <div className="w-64 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden mb-3 relative p-[1px] border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-[#1db954] via-[#1ed760] to-[#55f28b] rounded-full relative"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          >
            {/* Bright leading tip */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          </motion.div>
        </div>

        {/* Loading status & percentage counter */}
        <div className="flex items-center justify-between w-64 text-[11px] text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-ping" />
            <span>Loading sound engine...</span>
          </span>
          <span className="text-zinc-300 font-bold">{progress}%</span>
        </div>
      </motion.div>
    </div>
  );
}

