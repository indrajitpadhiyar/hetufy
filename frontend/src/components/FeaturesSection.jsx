import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Compass, DownloadCloud, Sparkles } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Radio,
      title: "Lossless Audio Playback",
      desc: "Stream original uncompressed audio recordings with smooth controls, instant response, and zero lag."
    },
    {
      icon: Compass,
      title: "Cloud Drive Integration",
      desc: "Automatically sync audio files directly from your Google Drive storage with smart search and tagging."
    },
    {
      icon: DownloadCloud,
      title: "One-Click MP3 Download",
      desc: "Download high quality MP3 recordings directly to your computer or phone with one click."
    },
    {
      icon: Sparkles,
      title: "Vinyl & Editorial Design",
      desc: "Inspired by vintage film strips, vinyl discs, and classic studio record layout aesthetics."
    }
  ];

  return (
    <section id="features" className="py-12 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div>
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#7d776f] uppercase mb-2">
            Studio Standards
          </p>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#1c1b18] font-normal tracking-tight">
            Crafted for Listening
          </h2>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="editorial-card p-6 border border-[#d6cfc4] bg-[#eee9df] hover:bg-[#e4ded4]"
              >
                {/* Icon Container */}
                <div className="w-10 h-10 rounded-full bg-[#1c1b18] text-[#f6f3eb] flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <h3 className="font-serif-editorial text-lg text-[#1c1b18] mb-2 font-medium">
                  {item.title}
                </h3>
                <p className="text-xs text-[#7d776f] leading-relaxed font-normal">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}


