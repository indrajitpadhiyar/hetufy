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
  onSelectPlaylistFilter
}) {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl editorial-card p-6 md:p-8 border border-[#d6cfc4] bg-[#f6f3eb] shadow-2xl rounded-2xl max-h-[85vh] flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#e2dad0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1c1b18] text-[#f6f3eb] flex items-center justify-center">
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-editorial text-2xl text-[#1c1b18] font-medium">Your Playlists</h2>
                <p className="text-xs text-[#7d776f]">Organize and stream your custom audio mixes</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-[#7d776f] hover:text-[#1c1b18] hover:bg-[#eee9df] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Grid Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 overflow-hidden flex-1">
            
            {/* Left Column: Playlist Tabs & Create Button */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4 border-r md:border-[#e2dad0] md:pr-4 overflow-y-auto max-h-[50vh]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold tracking-wider text-[#7d776f] uppercase">Playlists ({playlists.length})</span>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[#1c1b18] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                {/* Inline Creation Form */}
                {showCreateForm && (
                  <form onSubmit={handleCreate} className="mb-4 p-3 bg-[#eee9df] rounded-xl border border-[#d6cfc4] space-y-2">
                    <input
                      type="text"
                      placeholder="Playlist Title..."
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      autoFocus
                      className="w-full px-3 py-1.5 bg-[#f6f3eb] border border-[#d6cfc4] rounded-lg text-xs text-[#1c1b18]"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)..."
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f6f3eb] border border-[#d6cfc4] rounded-lg text-xs text-[#1c1b18]"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-2.5 py-1 text-xs text-[#7d776f]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-[#1c1b18] text-[#f6f3eb] text-xs font-bold"
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
                            ? 'bg-[#1c1b18] text-[#f6f3eb] border-[#1c1b18]'
                            : 'bg-[#eee9df]/70 hover:bg-[#eee9df] text-[#1c1b18] border-[#d6cfc4]'
                        }`}
                      >
                        <div>
                          <h4 className="font-serif-editorial text-base font-medium leading-tight">{pl.name}</h4>
                          <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-[#c7beb1]' : 'text-[#7d776f]'}`}>
                            {pl.songIds.length} {pl.songIds.length === 1 ? 'track' : 'tracks'}
                          </p>
                        </div>

                        {playlists.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePlaylist(pl.id);
                            }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                              isSelected ? 'hover:bg-zinc-800 text-rose-300' : 'hover:bg-[#dcd5c9] text-rose-700'
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
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#e2dad0]">
                    <div>
                      <h3 className="font-serif-editorial text-2xl text-[#1c1b18] font-medium">{currentPlaylist.name}</h3>
                      {currentPlaylist.description && (
                        <p className="text-xs text-[#7d776f] mt-0.5">{currentPlaylist.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePlayAll}
                        disabled={playlistSongs.length === 0}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1b18] text-[#f6f3eb] text-xs font-bold uppercase tracking-wider hover:bg-black transition-all cursor-pointer disabled:opacity-40"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#f6f3eb]" />
                        <span>Play All</span>
                      </button>

                      <button
                        onClick={handleFilterGrid}
                        disabled={playlistSongs.length === 0}
                        className="px-3 py-2 rounded-full border border-[#1c1b18] text-[#1c1b18] text-xs font-bold hover:bg-[#eee9df] transition-all cursor-pointer disabled:opacity-40"
                      >
                        Filter Grid
                      </button>
                    </div>
                  </div>

                  {/* Songs List inside Playlist */}
                  <div className="space-y-2">
                    {playlistSongs.length === 0 ? (
                      <div className="py-12 text-center text-[#7d776f]">
                        <Disc className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">This playlist is currently empty.</p>
                        <p className="text-[11px] mt-1">Add songs from the library using the "+" button on track cards!</p>
                      </div>
                    ) : (
                      playlistSongs.map((song, idx) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#eee9df]/60 hover:bg-[#eee9df] border border-[#d6cfc4] transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-xs font-mono text-[#7d776f] w-4">{idx + 1}</span>
                            <img src={song.cover} alt={song.title} className="w-9 h-9 rounded-lg object-cover" />
                            <div className="overflow-hidden">
                              <h5 className="font-serif-editorial text-sm text-[#1c1b18] truncate font-medium">{song.title}</h5>
                              <p className="text-[11px] text-[#7d776f] truncate">{song.artist}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onPlaySong(song)}
                              className="p-1.5 rounded-lg hover:bg-[#dcd5c9] text-[#1c1b18]"
                              title="Play Track"
                            >
                              <Play className="w-3.5 h-3.5 fill-[#1c1b18]" />
                            </button>
                            <button
                              onClick={() => onRemoveFromPlaylist(currentPlaylist.id, song.id)}
                              className="p-1.5 rounded-lg hover:bg-[#dcd5c9] text-rose-700"
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
                <div className="py-12 text-center text-[#7d776f]">
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
