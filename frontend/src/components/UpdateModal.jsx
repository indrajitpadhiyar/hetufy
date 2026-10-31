import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function UpdateModal({
  isOpen,
  onClose,
  updateInfo
}) {
  if (!isOpen || !updateInfo) return null;

  const handleDownloadUpdate = () => {
    let targetUrl = updateInfo.apkUrl || 'https://idrmusic.netlify.app/IDRMusic.apk';
    if (targetUrl.startsWith('/')) {
      targetUrl = `https://idrmusic.netlify.app${targetUrl}`;
    }
    window.open(targetUrl, '_system');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-sm bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-2xl text-white overflow-hidden"
        >
          {/* Neon Glow Accent */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#1ed760]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button (if not mandatory) */}
          {!updateInfo.mandatory && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Top Badge Icon */}
          <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mb-4 shadow-lg shadow-[#1ed760]/20">
            <Sparkles className="w-7 h-7 text-[#1ed760]" />
          </div>

          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] font-bold text-[11px] mb-2 uppercase tracking-wider">
            Update Available
          </span>

          <h3 className="text-xl font-black text-white leading-tight mb-1">
            IDRMusic v{updateInfo.latestVersion}
          </h3>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            {updateInfo.releaseNotes || 'A new version with the new Spotify mobile layout, fast lag-free loader, and performance improvements is ready to install.'}
          </p>

          <div className="bg-black/40 rounded-xl p-3 border border-white/5 mb-5 flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-[#1ed760] flex-shrink-0" />
            <div className="text-[11px] text-zinc-300">
              <span className="font-semibold text-white">Current:</span> v{updateInfo.currentVersion} → <span className="font-semibold text-[#1ed760]">Latest:</span> v{updateInfo.latestVersion}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!updateInfo.mandatory && (
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Later
              </button>
            )}

            <button
              onClick={handleDownloadUpdate}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#1ed760] hover:bg-[#1db954] active:scale-[0.98] text-xs font-bold text-black transition-all cursor-pointer shadow-lg shadow-[#1ed760]/25 flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Update Now</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

