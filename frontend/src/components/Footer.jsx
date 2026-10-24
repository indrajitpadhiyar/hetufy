import React from 'react';

export default function Footer({ theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <footer className={`pt-12 pb-24 border-t px-6 md:px-12 max-w-[1400px] mx-auto transition-colors duration-300 ${
      isDark ? 'border-white/10 text-zinc-500' : 'border-[#e2dad0] text-[#7d776f]'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-normal">
        <div>
          <span className={`font-serif-editorial text-lg font-normal mr-2 ${
            isDark ? 'text-white' : 'text-[#1c1b18]'
          }`}>
            Mitter music
          </span>
          <span>— Written to be sung</span>
        </div>

        <p>© {new Date().getFullYear()} Mitter Music. All rights reserved.</p>
      </div>
    </footer>
  );
}


