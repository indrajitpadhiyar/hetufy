import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[IDRMusic Crash Guard caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[300] bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4 p-2">
            <img src="/idrmusic.png" alt="IDRMusic" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-xs text-zinc-400 max-w-xs mb-4">
            The application encountered a small glitch. Tap below to reload your music library cleanly.
          </p>
          {this.state.error && (
            <p className="text-[10px] text-red-400/90 font-mono bg-red-950/40 border border-red-800/30 px-3 py-1.5 rounded-lg max-w-xs truncate mb-4">
              {this.state.error.message || String(this.state.error)}
            </p>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('hetufy_last_playback');
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-full bg-[#1ed760] text-black font-bold text-xs hover:bg-[#1db954] cursor-pointer shadow-lg"
          >
            Restart IDRMusic
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

