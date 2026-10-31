import React, { useEffect, useState, useRef } from 'react';

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(15);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    // Smooth progress simulation: 15% -> 100% in ~800ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + 18);
      });
    }, 100);

    // Hard guarantee: finish cleanly in 950ms max so mobile never lags or freezes
    const safetyTimer = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        if (onFinishRef.current) {
          onFinishRef.current();
        }
      }, 150);
    }, 950);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[200] bg-[#0c0c0e] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ backgroundColor: '#0c0c0e' }}
    >
      {/* Lightweight subtle radial background glow */}
      <div 
        className="absolute w-72 h-72 rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #1ed760 0%, transparent 70%)',
          transform: 'translateZ(0)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* App Logo with subtle pulsing ring */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-[#1ed760]/20 animate-ping opacity-40 scale-105" />
          <div className="relative w-24 h-24 rounded-2xl bg-black/60 border border-white/10 p-2 shadow-2xl flex items-center justify-center">
            <img
              src="/idrmusic.png"
              alt="IDRMusic"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          IDRMusic
        </h1>
        <p className="text-xs text-zinc-400 mb-6 font-medium tracking-wide">
          Written to be Sung
        </p>

        {/* 4-Bar Equalizer Wave (Smooth CSS Hardware Animation) */}
        <div className="flex items-center space-x-1.5 h-6 mb-6">
          <span 
            className="w-1 bg-[#1ed760] rounded-full animate-bounce" 
            style={{ animationDuration: '0.8s', height: '14px' }} 
          />
          <span 
            className="w-1 bg-[#1ed760] rounded-full animate-bounce" 
            style={{ animationDuration: '0.6s', animationDelay: '0.15s', height: '22px' }} 
          />
          <span 
            className="w-1 bg-[#1ed760] rounded-full animate-bounce" 
            style={{ animationDuration: '0.7s', animationDelay: '0.3s', height: '18px' }} 
          />
          <span 
            className="w-1 bg-[#1ed760] rounded-full animate-bounce" 
            style={{ animationDuration: '0.5s', animationDelay: '0.45s', height: '12px' }} 
          />
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1ed760] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%`, transform: 'translateZ(0)' }}
          />
        </div>
      </div>
    </div>
  );
}
