import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Download, Heart } from 'lucide-react';

export default function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-28 right-6 z-50 glass-card px-5 py-3.5 rounded-2xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            {toast.type === 'download' ? <Download className="w-4 h-4" /> : <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toast.title}</p>
            <p className="text-[11px] text-zinc-400">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
