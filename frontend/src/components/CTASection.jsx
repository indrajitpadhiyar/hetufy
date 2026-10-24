import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function CTASection({ onExploreClick }) {
  return (
    <section className="py-12 px-6 md:px-12 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="editorial-card rounded-2xl p-8 md:p-12 border border-[#d6cfc4] bg-[#eee9df] text-center"
      >
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#1c1b18] tracking-tight mb-3 font-normal">
            Ready to listen to compositions?
          </h2>
          <p className="text-xs sm:text-sm text-[#7d776f] font-normal mb-6 leading-relaxed">
            Discover the full repertoire, stream high quality vinyl recordings, and download tracks directly to your library.
          </p>

          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-[#f6f3eb] bg-[#1c1b18] hover:bg-black transition-all cursor-pointer shadow-md"
          >
            <span>Explore Collection</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}


