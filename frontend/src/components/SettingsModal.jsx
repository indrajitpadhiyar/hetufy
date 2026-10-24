import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sun, Moon, Check, X, Sparkles, Monitor } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, theme, setTheme }) {
  if (!isOpen) return null;

  const themes = [
    {
      id: 'light',
      name: 'Light Theme',
      subtitle: 'Clean White & Cream',
      description: 'Elegant white editorial design with crisp typography and frosted glass controls.',
      icon: Sun,
      previewBg: 'bg-[#f7f5f0]',
      previewCard: 'bg-white border-[#e5e0d8] text-[#1c1b18]',
      previewAccent: 'bg-[#1c1b18]'
    },
    {
      id: 'dark',
      name: 'Dark Theme',
      subtitle: 'Obsidian & Forest Green',
      description: 'Sleek modern studio dark theme with vibrant accents and easy-on-the-eyes contrast.',
      icon: Moon,
      previewBg: 'bg-[#121316]',
      previewCard: 'bg-[#1a1b20] border-white/10 text-white',
      previewAccent: 'bg-emerald-500'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border transition-colors ${
            theme === 'dark' 
              ? 'bg-[#18191f] border-white/10 text-white' 
              : 'bg-[#fbfaf8] border-[#e2dad0] text-[#1c1b18]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${
                theme === 'dark' ? 'bg-white/10 text-white' : 'bg-[#eee9df] text-[#1c1b18]'
              }`}>
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  Settings
                </h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-[#7d776f]'}`}>
                  Customize your listening experience & visual theme
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                theme === 'dark' 
                  ? 'hover:bg-white/10 text-zinc-400 hover:text-white' 
                  : 'hover:bg-[#eee9df] text-[#7d776f] hover:text-[#1c1b18]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Selection Section */}
          <div className="py-6 space-y-4">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider block mb-1">
                Appearance / Theme
              </label>
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-[#7d776f]'}`}>
                Select your preferred theme for the entire app and full-page player.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                const IconComponent = t.icon;

                return (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme(t.id)}
                    className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? theme === 'dark'
                          ? 'border-emerald-500 bg-white/5 shadow-md shadow-emerald-500/10'
                          : 'border-[#1c1b18] bg-white shadow-md'
                        : theme === 'dark'
                          ? 'border-white/5 bg-white/[0.02] hover:border-white/20'
                          : 'border-[#e5e0d8] bg-[#f5f2eb] hover:border-[#1c1b18]/40'
                    }`}
                  >
                    {/* Top Row: Icon + Checkmark */}
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl flex items-center justify-center ${
                        isSelected 
                          ? theme === 'dark' ? 'bg-emerald-500 text-black' : 'bg-[#1c1b18] text-[#f6f3eb]'
                          : theme === 'dark' ? 'bg-white/10 text-zinc-400' : 'bg-[#e4ded4] text-[#5e584f]'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {isSelected && (
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          theme === 'dark' ? 'bg-emerald-500 text-black' : 'bg-[#1c1b18] text-[#f6f3eb]'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Preview Box */}
                    <div className={`w-full h-16 rounded-xl p-2.5 flex items-center justify-between ${t.previewBg} border border-black/5 dark:border-white/10 overflow-hidden shadow-inner`}>
                      <div className={`w-1/2 h-full rounded-lg p-1.5 flex flex-col justify-between ${t.previewCard} shadow-xs`}>
                        <div className="w-10 h-1 rounded-full bg-current opacity-40" />
                        <div className="w-6 h-1 rounded-full bg-current opacity-20" />
                      </div>
                      <div className={`w-6 h-6 rounded-full ${t.previewAccent} shadow-sm`} />
                    </div>

                    {/* Label & Description */}
                    <div>
                      <h4 className="font-bold text-sm leading-tight">
                        {t.name}
                      </h4>
                      <p className={`text-[11px] mt-0.5 leading-snug ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-[#7d776f]'
                      }`}>
                        {t.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-[#8a847b]'}`}>
              Theme auto-saved
            </span>
            <button
              onClick={onClose}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-[#1c1b18] text-[#f6f3eb] hover:bg-black'
              }`}
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
