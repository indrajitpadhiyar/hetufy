import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sun, Moon, Check, X, Server, Globe, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl } from '../config/api';
import { testBackendConnection } from '../services/api';

export default function SettingsModal({ isOpen, onClose, theme, setTheme }) {
  if (!isOpen) return null;

  const [apiUrl, setApiUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setApiUrl(getApiBaseUrl());
  }, [isOpen]);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setStatusMessage('Pinging server (Render backend may take 20-30s if waking up)...');
    const result = await testBackendConnection();
    if (result.ok) {
      setConnectionStatus('success');
      setStatusMessage('Connected successfully! Backend is active.');
    } else {
      setConnectionStatus('error');
      setStatusMessage(result.message || 'Failed to reach backend server.');
    }
  };

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl);
    handleTestConnection();
  };

  const handleResetApiUrl = () => {
    const defaultUrl = resetApiBaseUrl();
    setApiUrl(defaultUrl);
    setConnectionStatus(null);
    setStatusMessage('');
  };

  const themes = [
    {
      id: 'dark',
      name: 'Dark Spotify',
      subtitle: 'Obsidian & Forest Green',
      description: 'Sleek modern studio dark theme with vibrant accents and easy-on-the-eyes contrast.',
      icon: Moon,
      previewBg: 'bg-[#121316]',
      previewCard: 'bg-[#1a1b20] border-white/10 text-white',
      previewAccent: 'bg-[#1ed760]'
    },
    {
      id: 'light',
      name: 'Light Theme',
      subtitle: 'Clean White & Cream',
      description: 'Elegant white editorial design with crisp typography and frosted glass controls.',
      icon: Sun,
      previewBg: 'bg-[#f7f5f0]',
      previewCard: 'bg-white border-[#e5e0d8] text-[#1c1b18]',
      previewAccent: 'bg-[#1c1b18]'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-colors max-h-[90vh] overflow-y-auto ${
            theme === 'dark' 
              ? 'bg-[#181818] border-white/10 text-white' 
              : 'bg-[#fbfaf8] border-[#e2dad0] text-[#1c1b18]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                theme === 'dark' ? 'bg-white/10 text-white' : 'bg-[#eee9df] text-[#1c1b18]'
              }`}>
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  Hetufy Desktop Settings
                </h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-[#7d776f]'}`}>
                  Configure Render cloud backend & visual preferences
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

          {/* Backend API Configuration Section */}
          <div className="py-4 border-b border-black/10 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-[#1ed760]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Render / Hosted Backend API URL
                </span>
              </div>
              <button
                onClick={handleResetApiUrl}
                className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Reset Default
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Point your desktop app to your Render cloud backend (e.g. <code className="text-xs text-emerald-400">https://your-app.onrender.com/api</code>) or local development server.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://your-service.onrender.com/api"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#282828] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#1ed760]"
                />
              </div>
              <button
                onClick={handleSaveApiUrl}
                className="px-3 py-2 bg-[#1ed760] hover:bg-[#1db954] text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={handleTestConnection}
                disabled={connectionStatus === 'testing'}
                className="p-2 bg-[#282828] hover:bg-[#333333] text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Test Connection"
              >
                <RefreshCw className={`w-4 h-4 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Connection feedback message */}
            {statusMessage && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                connectionStatus === 'success' 
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : connectionStatus === 'error'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                  : 'bg-zinc-800 text-zinc-300'
              }`}>
                {connectionStatus === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                {connectionStatus === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Theme Selection Section */}
          <div className="py-4 space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">
                Appearance / Theme
              </label>
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-[#7d776f]'}`}>
                Select your preferred visual style.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                const IconComponent = t.icon;

                return (
                  <div
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`relative rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-[#1ed760] bg-[#242424] shadow-md'
                        : 'border-white/5 bg-[#1f1f1f] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#1ed760] text-black flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-white">
                        {t.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-snug">
                        {t.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Settings automatically saved
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
