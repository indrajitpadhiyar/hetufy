import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Play, Trash2, ListMusic, Music, Disc } from 'lucide-react';

export default function PlaylistModal({ 
  isOpen, 
  onClose, 
  playlists, 
  songs, 
  onCreatePlaylist, 
  onDeletePlaylist, 
  onRemoveFromPlaylist,
  onPlaySong,
  onSelectPlaylistFilter,
  theme = 'light'
}) {
  const isDark = theme === 'dark';
  const [activePlaylistId, setActivePlaylistId] = useState(playlists[0]?.id || null);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!isOpen) return null;

  const currentPlaylist = playlists.find(p => p.id === activePlaylistId) || playlists[0];
  const playlistSongs = currentPlaylist 
    ? songs.filter(s => currentPlaylist.songIds.includes(s.id))
    : [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const newPl = onCreatePlaylist(nameInput.trim(), descInput.trim());
    if (newPl) {
      setActivePlaylistId(newPl.id);
    }
    setNameInput('');
    setDescInput('');
    setShowCreateForm(false);
  };

  const handlePlayAll = () => {
    if (playlistSongs.length > 0 && onPlaySong) {
      onPlaySong(playlistSongs[0]);
      onClose();
    }
  };

  const handleFilterGrid = () => {
    if (currentPlaylist && onSelectPlaylistFilter) {
      onSelectPlaylistFilter(`Playlist: ${currentPlaylist.name}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-3xl p-6 md:p-8 border shadow-2xl rounded-2xl max-h-[85vh] flex flex-col transition-colors duration-300 ${
            isDark 
              ? 'bg-[#181922] border-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)]' 
              : 'border-[#d6cfc4] bg-[#f6f3eb] text-[#1c1b18]'
          }`}
        >
          {/* Top Bar */}
          <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${
            isDark ? 'border-white/10' : 'border-[#e2dad0]'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-amber-400 text-black' : 'bg-[#1c1b18] text-[#f6f3eb]'
              }`}>
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`font-serif-editorial text-2xl font-medium ${isDark ? 'text-white' : 'text-[#1c1b18]'}`}>Your Playlists</h2>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-[#7d776f]'}`}>Organize and stream your custom audio mixes</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-[#7d776f] hover:text-[#1c1b18] hover:bg-[#eee9df]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Grid Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 overflow-hidden flex-1">
            
            {/* Left Column: Playlist Tabs & Create Button */}
            <div className={`md:col-span-5 flex flex-col justify-between space-y-4 border-r md:pr-4 overflow-y-auto max-h-[50vh] ${
              isDark ? 'border-white/10' : 'border-[#e2dad0]'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold tracking-wider uppercase ${
                    isDark ? 'text-zinc-400' : 'text-[#7d776f]'
                  }`}>
                    Playlists ({playlists.length})
                  </span>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className={`flex items-center gap-1 text-xs font-bold hover:underline cursor-pointer ${
                      isDark ? 'text-amber-400' : 'text-[#1c1b18]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                {/* Inline Creation Form */}
                {showCreateForm && (
                  <form onSubmit={handleCreate} className={`mb-4 p-3 rounded-xl border space-y-2 ${
                    isDark ? 'bg-[#20222e] border-white/10' : 'bg-[#eee9df] border-[#d6cfc4]'
                  }`}>
                    <input
                      type="text"
                      placeholder="Playlist Title..."
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      autoFocus
                      className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                        isDark 
                          ? 'bg-[#15161c] border border-white/15 text-white placeholder-zinc-500' 
                          : 'bg-[#f6f3eb] border border-[#d6cfc4] text-[#1c1b18]'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)..."
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                        isDark 
                          ? 'bg-[#15161c] border border-white/15 text-white placeholder-zinc-500' 
                          : 'bg-[#f6f3eb] border border-[#d6cfc4] text-[#1c1b18]'
                      }`}
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className={`px-2.5 py-1 text-xs cursor-pointer ${isDark ? 'text-zinc-400 hover:text-white' : 'text-[#7d776f]'}`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          isDark ? 'bg-amber-400 text-black' : 'bg-[#1c1b18] text-[#f6f3eb]'
                        }`}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                {/* Playlist Selection Items */}
                <div className="space-y-2">
                  {playlists.map((pl) => {
                    const isSelected = pl.id === activePlaylistId;
                    return (
                      <div
                        key={pl.id}
                        onClick={() => setActivePlaylistId(pl.id)}
                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? (isDark 
                                ? 'bg-amber-400 text-black border-amber-400 font-medium' 
                                : 'bg-[#1c1b18] text-[#f6f3eb] border-[#1c1b18]')
                            : (isDark 
                                ? 'bg-white/5 hover:bg-white/10 text-white border-white/5' 
                                : 'bg-[#eee9df]/70 hover:bg-[#eee9df] text-[#1c1b18] border-[#d6cfc4]')
                        }`}
                      >
                        <div>
                          <h4 className="font-serif-editorial text-base font-medium leading-tight">{pl.name}</h4>
                          <p className={`text-[11px] mt-0.5 ${
                            isSelected 
                              ? (isDark ? 'text-zinc-800' : 'text-[#c7beb1]') 
                              : (isDark ? 'text-zinc-400' : 'text-[#7d776f]')
                          }`}>
                            {pl.songIds.length} {pl.songIds.length === 1 ? 'track' : 'tracks'}
                          </p>
                        </div>

                        {playlists.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePlaylist(pl.id);
                            }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                              isSelected 
                                ? (isDark ? 'hover:bg-amber-500 text-rose-800' : 'hover:bg-zinc-800 text-rose-300')
                                : (isDark ? 'hover:bg-white/10 text-rose-400' : 'hover:bg-[#dcd5c9] text-rose-700')
                            }`}
                            title="Delete Playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Playlist Details & Tracks */}
            <div className="md:col-span-7 flex flex-col justify-between overflow-y-auto max-h-[50vh]">
              {currentPlaylist ? (
                <div>
                  {/* Playlist Title & Action Header */}
                  <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b ${
                    isDark ? 'border-white/10' : 'border-[#e2dad0]'
                  }`}>
                    <div>
                      <h3 className={`font-serif-editorial text-2xl font-medium ${isDark ? 'text-white' : 'text-[#1c1b18]'}`}>{currentPlaylist.name}</h3>
                      {currentPlaylist.description && (
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-[#7d776f]'}`}>{currentPlaylist.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePlayAll}
                        disabled={playlistSongs.length === 0}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 ${
                          isDark ? 'bg-amber-400 text-black hover:bg-amber-300' : 'bg-[#1c1b18] text-[#f6f3eb] hover:bg-black'
                        }`}
                      >
                        <Play className={`w-3.5 h-3.5 ${isDark ? 'fill-black' : 'fill-[#f6f3eb]'}`} />
                        <span>Play All</span>
                      </button>

                      <button
                        onClick={handleFilterGrid}
                        disabled={playlistSongs.length === 0}
                        className={`px-3 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                          isDark 
                            ? 'border-white/20 text-white hover:bg-white/10' 
                            : 'border-[#1c1b18] text-[#1c1b18] hover:bg-[#eee9df]'
                        }`}
                      >
                        Filter Grid
                      </button>
                    </div>
                  </div>

                  {/* Songs List inside Playlist */}
                  <div className="space-y-2">
                    {playlistSongs.length === 0 ? (
                      <div className={`py-12 text-center ${isDark ? 'text-zinc-500' : 'text-[#7d776f]'}`}>
                        <Disc className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">This playlist is currently empty.</p>
                        <p className="text-[11px] mt-1">Add songs from the library using the "+" button on track cards!</p>
                      </div>
                    ) : (
                      playlistSongs.map((song, idx) => (
                        <div
                          key={song.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                            isDark 
                              ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white' 
                              : 'bg-[#eee9df]/60 hover:bg-[#eee9df] border-[#d6cfc4]'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className={`text-xs font-mono w-4 ${isDark ? 'text-zinc-500' : 'text-[#7d776f]'}`}>{idx + 1}</span>
                            <img src={song.cover} alt={song.title} className="w-9 h-9 rounded-lg object-cover" />
                            <div className="overflow-hidden">
                              <h5 className={`font-serif-editorial text-sm truncate font-medium ${isDark ? 'text-white' : 'text-[#1c1b18]'}`}>{song.title}</h5>
                              <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-[#7d776f]'}`}>{song.artist}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onPlaySong(song)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDark ? 'hover:bg-white/15 text-zinc-300 hover:text-white' : 'hover:bg-[#dcd5c9] text-[#1c1b18]'
                              }`}
                              title="Play Track"
                            >
                              <Play className={`w-3.5 h-3.5 ${isDark ? 'fill-zinc-300' : 'fill-[#1c1b18]'}`} />
                            </button>
                            <button
                              onClick={() => onRemoveFromPlaylist(currentPlaylist.id, song.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDark ? 'hover:bg-white/15 text-rose-400' : 'hover:bg-[#dcd5c9] text-rose-700'
                              }`}
                              title="Remove from Playlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className={`py-12 text-center ${isDark ? 'text-zinc-500' : 'text-[#7d776f]'}`}>
                  <Music className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Select a playlist to view tracks.</p>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
