import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function CTASection({ onExploreClick, theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <section className="py-12 px-6 md:px-12 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`editorial-card rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
          isDark 
            ? 'bg-[#1a1b24] border border-white/10 text-white shadow-xl' 
            : 'border border-[#d6cfc4] bg-[#eee9df]'
        }`}
      >
        <div className="max-w-xl mx-auto">
          <h2 className={`font-serif-editorial text-3xl sm:text-4xl tracking-tight mb-3 font-normal ${
            isDark ? 'text-white' : 'text-[#1c1b18]'
          }`}>
            Ready to listen to compositions?
          </h2>
          <p className={`text-xs sm:text-sm font-normal mb-6 leading-relaxed ${
            isDark ? 'text-zinc-400' : 'text-[#7d776f]'
          }`}>
            Discover the full repertoire, stream high quality vinyl recordings, and download tracks directly to your library.
          </p>

          <button
            onClick={onExploreClick}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
              isDark 
                ? 'bg-amber-400 text-black hover:bg-amber-300' 
                : 'text-[#f6f3eb] bg-[#1c1b18] hover:bg-black'
            }`}
          >
            <span>Explore Collection</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}


