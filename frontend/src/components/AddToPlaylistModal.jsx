import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, FolderPlus, ListMusic } from 'lucide-react';

export default function AddToPlaylistModal({ 
  isOpen, 
  onClose, 
  song, 
  playlists, 
  onAddToPlaylist, 
  onCreatePlaylist,
  theme = 'light'
}) {
  const isDark = theme === 'dark';
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [addedPlaylistIds, setAddedPlaylistIds] = useState([]);

  if (!isOpen || !song) return null;

  const handleSelectPlaylist = (playlistId) => {
    onAddToPlaylist(playlistId, song.id);
    setAddedPlaylistIds(prev => [...prev, playlistId]);
    setTimeout(() => {
      onClose();
      setAddedPlaylistIds([]);
    }, 600);
  };

  const handleCreateAndAdd = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newPl = onCreatePlaylist(newPlaylistName.trim(), '');
    if (newPl) {
      onAddToPlaylist(newPl.id, song.id);
      setAddedPlaylistIds(prev => [...prev, newPl.id]);
    }
    setNewPlaylistName('');
    setShowCreateForm(false);
    setTimeout(() => {
      onClose();
      setAddedPlaylistIds([]);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full max-w-md p-6 border shadow-2xl rounded-2xl transition-colors duration-300 ${
            isDark 
              ? 'bg-[#181922] border-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)]' 
              : 'border-[#d6cfc4] bg-[#f6f3eb] text-[#1c1b18]'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between pb-4 border-b ${
            isDark ? 'border-white/10' : 'border-[#e2dad0]'
          }`}>
            <div className="flex items-center gap-2">
              <ListMusic className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-[#1c1b18]'}`} />
              <h3 className={`font-serif-editorial text-xl font-medium ${isDark ? 'text-white' : 'text-[#1c1b18]'}`}>
                Add to Playlist
              </h3>
            </div>
            <button 
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-[#7d776f] hover:text-[#1c1b18] hover:bg-[#eee9df]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selected Track Preview */}
          <div className={`flex items-center gap-3 my-4 p-3 rounded-xl border ${
            isDark ? 'bg-[#20222e] border-white/10' : 'bg-[#eee9df] border-[#d6cfc4]'
          }`}>
            <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-lg object-cover shadow-xs" />
            <div className="overflow-hidden">
              <h4 className={`font-serif-editorial text-base truncate font-medium ${isDark ? 'text-white' : 'text-[#1c1b18]'}`}>{song.title}</h4>
              <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-[#7d776f]'}`}>{song.artist}</p>
            </div>
          </div>

          {/* Create New Playlist Inline Toggle */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className={`w-full flex items-center justify-center gap-2 p-3 mb-4 rounded-xl border border-dashed text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isDark 
                  ? 'border-amber-400/50 text-amber-400 hover:bg-amber-400/10' 
                  : 'border-[#1c1b18] text-[#1c1b18] hover:bg-[#eee9df]'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAndAdd} className={`mb-4 p-3 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#20222e] border-white/10' : 'bg-[#eee9df] border-[#d6cfc4]'
            }`}>
              <input
                type="text"
                placeholder="Playlist Name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                  isDark 
                    ? 'bg-[#15161c] border border-white/15 text-white placeholder-zinc-500 focus:border-amber-400' 
                    : 'bg-[#f6f3eb] border border-[#d6cfc4] text-[#1c1b18] placeholder-[#7d776f] focus:border-[#1c1b18]'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={`px-3 py-1.5 text-xs cursor-pointer ${isDark ? 'text-zinc-400 hover:text-white' : 'text-[#7d776f] hover:text-[#1c1b18]'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    isDark ? 'bg-amber-400 text-black' : 'bg-[#1c1b18] text-[#f6f3eb]'
                  }`}
                >
                  Create & Add
                </button>
              </div>
            </form>
          )}

          {/* Existing Playlists List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {playlists.length === 0 ? (
              <p className={`text-xs text-center py-4 ${isDark ? 'text-zinc-500' : 'text-[#7d776f]'}`}>No playlists yet. Create one above!</p>
            ) : (
              playlists.map((pl) => {
                const isAdded = addedPlaylistIds.includes(pl.id) || pl.songIds.includes(song.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => handleSelectPlaylist(pl.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      isDark 
                        ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white' 
                        : 'bg-[#eee9df]/80 hover:bg-[#eee9df] border-[#d6cfc4]'
                    }`}
                  >
                    <div>
                      <h5 className={`font-serif-editorial text-sm font-medium ${isDark ? 'text-white' : 'text-[#1c1b18]'}`}>{pl.name}</h5>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-[#7d776f]'}`}>{pl.songIds.length} tracks</p>
                    </div>

                    <div className={`p-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#f6f3eb]'}`}>
                      {isAdded ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Plus className={`w-4 h-4 ${isDark ? 'text-white' : 'text-[#1c1b18]'}`} />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
