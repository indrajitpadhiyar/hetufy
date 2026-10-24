import React from 'react';

export default function Background({ theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 p-4 sm:p-6 md:p-8 overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-[#0f1013]' : 'bg-[#d3cac0]'
    }`}>
      {/* Inner Canvas */}
      <div className={`w-full h-full rounded-3xl relative overflow-hidden transition-colors duration-500 ${
        isDark 
          ? 'bg-[#15161c] border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]' 
          : 'editorial-canvas'
      }`} />
    </div>
  );
}
