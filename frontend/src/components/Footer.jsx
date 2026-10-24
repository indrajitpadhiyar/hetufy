import React from 'react';

export default function Footer() {
  return (
    <footer className="pt-12 pb-24 border-t border-[#e2dad0] px-6 md:px-12 max-w-[1400px] mx-auto text-[#7d776f]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-normal">
        <div>
          <span className="font-serif-editorial text-lg text-[#1c1b18] font-normal mr-2">Mitter music</span>
          <span>— Written to be sung</span>
        </div>

        <p>© {new Date().getFullYear()} Mitter Music. All rights reserved.</p>
      </div>
    </footer>
  );
}


