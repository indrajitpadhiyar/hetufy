import React, { useState, useEffect } from 'react';
import {
  Download, Monitor, Smartphone, Play, Pause, Music, Heart,
  Sparkles, ShieldCheck, Zap, Radio, CheckCircle2, ChevronRight,
  ChevronDown, Sun, Moon, Leaf, ExternalLink, RefreshCw, Volume2,
  HardDrive, SmartphoneNfc, ListMusic, Layers, ArrowUpRight
} from 'lucide-react';

export default function App() {
  // Theme State: 'dark' | 'light' | 'green'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('idrmusic_download_theme') || 'dark';
  });

  // Interactive Mockup Player state
  const [isPlayingMockup, setIsPlayingMockup] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [openFaq, setOpenFaq] = useState(0);
  const [trackProgress, setTrackProgress] = useState(38);

  useEffect(() => {
    localStorage.setItem('idrmusic_download_theme', theme);
  }, [theme]);

  // Simulate audio track progress
  useEffect(() => {
    if (!isPlayingMockup) return;
    const interval = setInterval(() => {
      setTrackProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 800);
    return () => clearInterval(interval);
  }, [isPlayingMockup]);

  // Theme configuration object
  const themes = {
    dark: {
      id: 'dark',
      name: 'Dark Studio',
      icon: Moon,
      bg: 'bg-[#0a0b0e]',
      text: 'text-zinc-100',
      textMuted: 'text-zinc-400',
      cardBg: 'bg-[#12141a]/90',
      cardBorder: 'border-white/10',
      cardHover: 'hover:border-cyan-500/50',
      navBg: 'bg-[#0a0b0e]/80',
      accentGradient: 'from-cyan-400 via-sky-500 to-indigo-500',
      accentColor: 'text-cyan-400',
      accentBg: 'bg-cyan-500',
      accentButton: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold shadow-[0_0_25px_rgba(6,182,212,0.4)]',
      glow: 'rgba(6, 182, 212, 0.15)',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      mockupBg: 'bg-[#0d0f14]'
    },
    light: {
      id: 'light',
      name: 'Light Ivory',
      icon: Sun,
      bg: 'bg-[#f8fafc]',
      text: 'text-slate-900',
      textMuted: 'text-slate-500',
      cardBg: 'bg-white/95',
      cardBorder: 'border-slate-200',
      cardHover: 'hover:border-blue-500/50',
      navBg: 'bg-[#f8fafc]/80',
      accentGradient: 'from-blue-600 via-indigo-600 to-sky-500',
      accentColor: 'text-blue-600',
      accentBg: 'bg-blue-600',
      accentButton: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)]',
      glow: 'rgba(59, 130, 246, 0.12)',
      badge: 'bg-blue-50 text-blue-600 border-blue-200',
      mockupBg: 'bg-slate-100'
    },
    green: {
      id: 'green',
      name: 'Spotify Green',
      icon: Leaf,
      bg: 'bg-[#050f0a]',
      text: 'text-zinc-100',
      textMuted: 'text-emerald-200/60',
      cardBg: 'bg-[#0a1e14]/90',
      cardBorder: 'border-emerald-500/20',
      cardHover: 'hover:border-emerald-400/50',
      navBg: 'bg-[#050f0a]/80',
      accentGradient: 'from-emerald-400 via-green-500 to-teal-400',
      accentColor: 'text-[#1ed760]',
      accentBg: 'bg-[#1ed760]',
      accentButton: 'bg-gradient-to-r from-[#1ed760] to-emerald-500 hover:from-[#22e76a] hover:to-emerald-400 text-black font-bold shadow-[0_0_25px_rgba(30,215,96,0.4)]',
      glow: 'rgba(30, 215, 96, 0.2)',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      mockupBg: 'bg-[#081810]'
    }
  };

  const t = themes[theme];

  const features = [
    {
      icon: Zap,
      title: 'Studio-Grade Lossless Audio',
      desc: 'Crystal clear 320kbps streaming & uncompressed playback engineered for professional audio monitors and audiophile headphones.'
    },
    {
      icon: Smartphone,
      title: 'Native Android Background Play',
      desc: 'Music continues uninterrupted when your screen locks or app minimizes. Includes lockscreen player and notification controls.'
    },
    {
      icon: HardDrive,
      title: 'Windows Portable & Setup .EXE',
      desc: 'Download the standard installer with desktop shortcuts or the zero-install portable build ready to run directly from any folder.'
    },
    {
      icon: RefreshCw,
      title: 'Real-Time Cloud Synchronization',
      desc: 'Your created playlists, liked tracks, and resume playback timestamps synchronize seamlessly across desktop, phone, and web.'
    },
    {
      icon: ShieldCheck,
      title: '100% Ad-Free & Privacy First',
      desc: 'No commercial interruptions, no banner advertisements, and no tracking scripts. Just pure musical immersion.'
    },
    {
      icon: Layers,
      title: 'Dynamic Island & Lyrics Bar',
      desc: 'Floating mini-player widget, interactive waveforms, and expandable full-page canvas for every song.'
    }
  ];

  const faqs = [
    {
      q: 'Which Windows versions are supported?',
      a: 'IDRMusic is built for 64-bit Windows 11 and Windows 10. You can choose between the full Setup wizard (IDRMusic-Setup-1.0.0.exe) or the instant Portable edition (IDRMusic-Portable-1.0.0.exe).'
    },
    {
      q: 'How do I install the Android APK?',
      a: 'Download the IDRMusic.apk file, tap Open on your phone, and allow "Install from this source" in your Android settings if prompted. The app works on Android 8.0 up to Android 15.'
    },
    {
      q: 'Does Android playback work when the screen is locked?',
      a: 'Yes! The Android app includes integrated MediaSession support and Android foreground service permissions. Album art, seek bar, pause, play, next, and previous buttons work right from your lock screen.'
    },
    {
      q: 'Will my playlists and songs sync between PC and Android?',
      a: 'Yes, your playlists, saved favorites, and playback states sync automatically via your IDRMusic cloud profile or Google Sign-In.'
    }
  ];

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-500 flex flex-col selection:bg-emerald-400 selection:text-black`}>
      
      {/* Background Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] transition-all duration-700 animate-pulse-glow"
          style={{ background: t.glow }}
        />
        <div 
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[140px] transition-all duration-700 animate-pulse-glow"
          style={{ background: t.glow }}
        />
        <div 
          className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-700"
          style={{ background: t.glow }}
        />
      </div>

      {/* Navigation Header */}
      <header className={`sticky top-0 z-50 ${t.navBg} glass-panel border-b ${t.cardBorder} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/20 p-0.5 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 animate-float">
              <img src="/idrmusic.png" alt="IDRMusic Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                IDRMusic
              </span>
              <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.badge}`}>
                v1.0.0
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            <a href="#features" className="hover:opacity-100 opacity-75 transition-opacity">Features</a>
            <a href="#mockup" className="hover:opacity-100 opacity-75 transition-opacity">Experience</a>
            <a href="#downloads" className="hover:opacity-100 opacity-75 transition-opacity">Downloads</a>
            <a href="#faq" className="hover:opacity-100 opacity-75 transition-opacity">FAQ</a>
          </nav>

          {/* Right Actions: Theme Selector & CTA Button */}
          <div className="flex items-center space-x-3">
            {/* 3-Theme Switcher Toggle */}
            <div className={`flex items-center p-1 rounded-full border ${t.cardBorder} ${t.cardBg} shadow-inner`}>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-cyan-500 text-black shadow-md' : `${t.textMuted} hover:text-white`
                }`}
                title="Dark Studio Theme"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === 'light' ? 'bg-blue-600 text-white shadow-md' : `${t.textMuted} hover:text-black`
                }`}
                title="Light Ivory Theme"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('green')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === 'green' ? 'bg-[#1ed760] text-black shadow-md' : `${t.textMuted} hover:text-white`
                }`}
                title="Spotify Green Theme"
              >
                <Leaf className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Download CTA */}
            <a
              href="#downloads"
              className={`hidden sm:flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-transform hover:scale-105 active:scale-95 ${t.accentButton}`}
            >
              <Download className="w-4 h-4" />
              <span>Get App</span>
            </a>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Animated Badge */}
        <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-8 animate-float ${t.badge}`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>High-Fidelity Studio Music Player • Windows & Android</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Music, Elevated to <br className="hidden sm:inline" />
          <span className={`bg-gradient-to-r ${t.accentGradient} bg-clip-text text-transparent`}>
            Pure Studio Master Sound.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className={`text-base sm:text-xl ${t.textMuted} max-w-2xl mb-10 leading-relaxed font-normal`}>
          Experience IDRMusic natively on your Windows desktop and Android phone. Lossless streaming, dynamic audio visualizers, background playback, and cloud playlist synchronization with zero ads.
        </p>

        {/* Hero Action Download Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <a
            href="#windows-download"
            className={`w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl text-sm font-extrabold transition-all hover:scale-105 active:scale-95 shadow-xl ${t.accentButton}`}
          >
            <Monitor className="w-5 h-5" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 leading-none">Download For</div>
              <div className="text-base leading-tight font-extrabold">Windows Desktop</div>
            </div>
            <ArrowUpRight className="w-4 h-4 ml-1 opacity-70" />
          </a>

          <a
            href="#android-download"
            className={`w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl text-sm font-extrabold border ${t.cardBorder} ${t.cardBg} hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg`}
          >
            <Smartphone className={`w-5 h-5 ${t.accentColor}`} />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 leading-none">Download For</div>
              <div className="text-base leading-tight font-extrabold">Android APK</div>
            </div>
            <ArrowUpRight className="w-4 h-4 ml-1 opacity-70" />
          </a>
        </div>

        {/* Animated Equalizer Waveform preview */}
        <div className="flex items-center space-x-1.5 h-10 px-6 py-2 rounded-full border border-white/10 bg-white/5 glass-panel">
          <Radio className={`w-4 h-4 mr-2 ${t.accentColor}`} />
          <span className="text-xs font-bold mr-3 tracking-wide">STUDIO HI-FI ENGINE</span>
          <div className={`w-1 rounded-full ${t.accentBg} animate-wave-1`} />
          <div className={`w-1 rounded-full ${t.accentBg} animate-wave-2`} />
          <div className={`w-1 rounded-full ${t.accentBg} animate-wave-3`} />
          <div className={`w-1 rounded-full ${t.accentBg} animate-wave-4`} />
          <div className={`w-1 rounded-full ${t.accentBg} animate-wave-5`} />
          <div className={`w-1 rounded-full ${t.accentBg} animate-wave-2`} />
          <div className={`w-1 rounded-full ${t.accentBg} animate-wave-4`} />
          <div className={`w-1 rounded-full ${t.accentBg} animate-wave-1`} />
          <span className={`ml-3 text-xs font-mono font-bold ${t.accentColor}`}>320 kbps / FLAC</span>
        </div>

      </section>

      {/* Interactive App Mockup Showcase Section */}
      <section id="mockup" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Designed for Audiophiles, Everywhere.
          </h2>
          <p className={`${t.textMuted} text-base max-w-xl mx-auto`}>
            A unified, fluid experience across your monitor and mobile device.
          </p>
        </div>

        {/* Dual Mockup Container: Desktop Window + Mobile Device */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Main Desktop App Mockup Window */}
          <div className={`rounded-3xl border ${t.cardBorder} ${t.mockupBg} shadow-2xl overflow-hidden glass-panel transition-all duration-300`}>
            
            {/* Window Titlebar */}
            <div className="h-10 px-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-400">
                <img src="/idrmusic.png" alt="IDRMusic icon" className="w-4 h-4 object-contain" />
                <span>IDRMusic Desktop — Now Playing</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Window Content: 3-column UI replica */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] p-4 gap-4">
              
              {/* Mockup Left Sidebar: Library */}
              <div className="hidden md:flex md:col-span-4 flex-col justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-4">
                    <span>YOUR LIBRARY</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.badge}`}>Sync Active</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2 rounded-xl bg-white/10">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
                        <Heart className="w-5 h-5 fill-white text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Liked Songs</div>
                        <div className="text-[10px] text-zinc-400">Playlist • 48 tracks</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600/30 flex items-center justify-center border border-emerald-500/30">
                        <ListMusic className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Studio Favorites</div>
                        <div className="text-[10px] text-zinc-400">Playlist • Indrajit</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-zinc-400">
                  <div className="font-semibold text-white mb-1">🎧 320kbps Lossless DAC</div>
                  <div>Direct hardware audio buffer output enabled.</div>
                </div>
              </div>

              {/* Mockup Center & Right Area: Track Details */}
              <div className="col-span-12 md:col-span-8 flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-b from-black/20 to-black/60 border border-white/5">
                
                {/* Hero Song Banner inside mockup */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group">
                    <img 
                      src="/idrmusic.png" 
                      alt="Cover Art" 
                      className="w-full h-full object-cover bg-black"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setIsPlayingMockup(!isPlayingMockup)}
                        className={`w-10 h-10 rounded-full ${t.accentBg} text-black flex items-center justify-center shadow-lg`}
                      >
                        {isPlayingMockup ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${t.accentColor}`}>Master Audio</span>
                    <h3 className="text-xl sm:text-2xl font-extrabold truncate">Jadu Tona</h3>
                    <p className="text-xs text-zinc-400">Umar Quadri • Studio Master</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white font-mono">Hi-Fi</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white font-mono">24-bit/48kHz</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Waveform & Timeline */}
                <div className="space-y-2 mb-4">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    setTrackProgress(Math.round((clickX / rect.width) * 100));
                  }}>
                    <div 
                      className={`h-full ${t.accentBg} transition-all duration-300 rounded-full`}
                      style={{ width: `${trackProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>1:14</span>
                    <span>3:12</span>
                  </div>
                </div>

                {/* Controls Bar inside Mockup */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setIsPlayingMockup(!isPlayingMockup)}
                      className={`w-10 h-10 rounded-full ${t.accentBg} text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer`}
                    >
                      {isPlayingMockup ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                    </button>
                    <button className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
                      <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-zinc-400 text-xs">
                    <Volume2 className="w-4 h-4" />
                    <div className="w-16 bg-white/20 h-1 rounded-full">
                      <div className="w-3/4 bg-white h-full rounded-full" />
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Floating Mobile Android Mockup Card */}
          <div className="hidden lg:block absolute -bottom-10 -right-6 w-64 rounded-3xl border border-white/20 bg-black/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-float-delayed z-20">
            {/* Phone Speaker Notch */}
            <div className="w-16 h-3 bg-zinc-800 rounded-full mx-auto mb-3" />
            
            {/* Android Lockscreen / Background Notification Player Card */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Background Active
                </span>
                <span>IDRMusic</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <img src="/idrmusic.png" alt="Song" className="w-10 h-10 rounded-lg object-contain bg-zinc-900 border border-white/10" />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">Jadu Tona</div>
                  <div className="text-[10px] text-zinc-400 truncate">Umar Quadri</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 pt-1 text-white">
                <button className="text-xs opacity-70">⏮</button>
                <button 
                  onClick={() => setIsPlayingMockup(!isPlayingMockup)}
                  className={`w-7 h-7 rounded-full ${t.accentBg} text-black flex items-center justify-center text-xs font-bold shadow-md`}
                >
                  {isPlayingMockup ? '⏸' : '▶'}
                </button>
                <button className="text-xs opacity-70">⏭</button>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-[10px] text-zinc-400 font-medium">Android Notification Media Player</span>
            </div>
          </div>

        </div>

      </section>

      {/* Main Download Hub Section */}
      <section id="downloads" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${t.badge}`}>
            <Download className="w-3.5 h-3.5" />
            <span>OFFICIAL RELEASES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Download IDRMusic for Your Device
          </h2>
          <p className={`${t.textMuted} text-base sm:text-lg`}>
            Select your platform below to download verified binaries. Always clean, free, and up-to-date.
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Windows Download Card */}
          <div 
            id="windows-download"
            className={`rounded-3xl border ${t.cardBorder} ${t.cardBg} p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl relative group overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Monitor className="w-36 h-36" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                  <Monitor className="w-7 h-7" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Windows 11 / 10
                </span>
              </div>

              <h3 className="text-2xl font-extrabold mb-2">Windows Desktop</h3>
              <p className={`text-sm ${t.textMuted} mb-6`}>
                High-performance desktop audio player with hardware sound acceleration, multi-column workspace, and tray controls.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
                  <span>Architecture: x64 (Intel & AMD 64-bit)</span>
                </div>
                <div className="flex items-center text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
                  <span>Version: 1.0.0 Stable</span>
                </div>
                <div className="flex items-center text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
                  <span>Includes offline playback & cloud playlist sync</span>
                </div>
              </div>
            </div>

            {/* 2 Windows Download Options: Setup & Portable */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              
              {/* Option 1: Setup Installer */}
              <a
                href="/release/IDRMusic-Setup-1.0.0.exe"
                download="IDRMusic-Setup-1.0.0.exe"
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98] ${t.accentButton}`}
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div>Setup Installer (.EXE)</div>
                    <div className="text-[10px] font-normal opacity-80">Full setup with desktop shortcuts • ~129 MB</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </a>

              {/* Option 2: Portable .EXE */}
              <a
                href="/release/IDRMusic-Portable-1.0.0.exe"
                download="IDRMusic-Portable-1.0.0.exe"
                className={`w-full flex items-center justify-between px-6 py-3.5 rounded-2xl text-xs font-bold border ${t.cardBorder} hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className="flex items-center space-x-3">
                  <HardDrive className="w-4 h-4 opacity-80" />
                  <div className="text-left">
                    <div>Portable Single-File (.EXE)</div>
                    <div className={`text-[10px] ${t.textMuted}`}>No installation required • ~116 MB</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </a>

            </div>

          </div>

          {/* Android Download Card */}
          <div 
            id="android-download"
            className={`rounded-3xl border ${t.cardBorder} ${t.cardBg} p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl relative group overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Smartphone className="w-36 h-36" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Smartphone className="w-7 h-7" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Android 8.0 to 15
                </span>
              </div>

              <h3 className="text-2xl font-extrabold mb-2">Android Mobile App</h3>
              <p className={`text-sm ${t.textMuted} mb-6`}>
                Optimized mobile music experience with lock screen playback, notification controls, touch gestures, and notch safe-area support.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
                  <span>Package: in.idrmusic.app</span>
                </div>
                <div className="flex items-center text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
                  <span>Background Audio Playback Service</span>
                </div>
                <div className="flex items-center text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
                  <span>Lockscreen Artwork & Seek Controls</span>
                </div>
              </div>
            </div>

            {/* Android APK Download Action */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              
              <a
                href="/IDRMusic.apk"
                download="IDRMusic.apk"
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98] ${t.accentButton}`}
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div>Download Android APK</div>
                    <div className="text-[10px] font-normal opacity-80">Direct standalone APK install • Fast download</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </a>

              <div className={`p-3 rounded-xl border border-white/5 bg-white/5 text-[11px] ${t.textMuted} flex items-center space-x-2`}>
                <SmartphoneNfc className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Compatible with Samsung, Xiaomi, Pixel, OnePlus, Vivo & all Android phones.</span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Engineered for Audio Perfection
          </h2>
          <p className={`${t.textMuted} text-base`}>
            Every feature is crafted to give you the most satisfying listening experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border ${t.cardBorder} ${t.cardBg} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
              >
                <div className={`w-12 h-12 rounded-xl mb-5 flex items-center justify-center ${t.badge} shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-2 text-white">{feat.title}</h4>
                <p className={`text-xs sm:text-sm ${t.textMuted} leading-relaxed`}>{feat.desc}</p>
              </div>
            );
          })}
        </div>

      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className={`${t.textMuted} text-sm`}>
            Everything you need to know about installing and running IDRMusic.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className={`rounded-2xl border ${t.cardBorder} ${t.cardBg} overflow-hidden transition-all`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm sm:text-base cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`px-6 pb-5 text-xs sm:text-sm ${t.textMuted} leading-relaxed border-t border-white/5 pt-3`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${t.cardBorder} py-12 px-4 sm:px-6 lg:px-8 mt-auto`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
          
          <div className="flex items-center space-x-3">
            <img src="/idrmusic.png" alt="IDRMusic Logo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-white text-sm">IDRMusic</span>
            <span>• Written to be Sung</span>
          </div>

          <div className="flex items-center space-x-6 font-semibold">
            <a href="#downloads" className="hover:text-white transition-colors">Windows</a>
            <a href="#downloads" className="hover:text-white transition-colors">Android</a>
            <a href="https://github.com/indrajitpadhiyar/IDRMUSIC" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>

          <div>
            © {new Date().getFullYear()} IDRMusic. Designed & Engineered by Indrajit Padhiyar.
          </div>

        </div>
      </footer>

    </div>
  );
}
