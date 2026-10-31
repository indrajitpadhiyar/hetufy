import React, { useState, useEffect, useRef } from 'react';
import { 
  Bookmark, Plus, ArrowRight, Search, ListFilter, 
  Heart, BookmarkCheck, Music2, Pin, MoreVertical,
  Pencil, Trash2, X
} from 'lucide-react';

export default function SpotifyLibrarySidebar({
  playlists = [],
  onCreatePlaylist,
  onDeletePlaylist,
  onEditPlaylist,
  onSelectPlaylist,
  activeCategory,
  setActiveCategory,
  favoritesCount = 0,
  songs = [],
  onPlaySong
}) {
  const [libraryFilter, setLibraryFilter] = useState('All'); // 'All' | 'Playlists' | 'Podcasts' | 'Artists'
  const [librarySearch, setLibrarySearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [openMenuPlaylistId, setOpenMenuPlaylistId] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuPlaylistId(null);
      }
    };
    if (openMenuPlaylistId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuPlaylistId]);

  // Extract unique artists from loaded songs
  const artists = Array.from(new Set(songs.map(s => s.artist))).slice(0, 6);

  const filterTabs = ['Playlists', 'Podcasts', 'Artists'];

  return (
    <aside className="hidden md:flex w-72 lg:w-80 h-full bg-[#121212] rounded-lg flex-col overflow-hidden text-white select-none flex-shrink-0">
      
      {/* Top Header: "Your Library" + Plus + Expand */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <button 
          onClick={() => setActiveCategory('All')}
          className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
        >
          <Bookmark className="w-5 h-5 group-hover:scale-105 transition-transform" />
          <span className="font-bold text-sm tracking-tight">Your Library</span>
        </button>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onCreatePlaylist(`My Playlist #${playlists.length + 1}`)}
            className="p-1.5 rounded-full hover:bg-[#1f1f1f] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Create playlist or folder"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {}}
            className="p-1.5 rounded-full hover:bg-[#1f1f1f] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Enlarge Your Library"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Chips: Playlists, Podcasts, Artists */}
      <div className="px-4 py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setLibraryFilter(libraryFilter === tab ? 'All' : tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              libraryFilter === tab 
                ? 'bg-white text-black' 
                : 'bg-[#232323] hover:bg-[#2a2a2a] text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & Recents Sorting Row */}
      <div className="px-4 py-2 flex items-center justify-between text-zinc-400 text-xs">
        <div className="flex items-center space-x-1.5">
          {showSearchInput ? (
            <div className="flex items-center bg-[#1f1f1f] rounded-full px-2 py-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 mr-1" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Search in Your Library"
                autoFocus
                onBlur={() => !librarySearch && setShowSearchInput(false)}
                className="bg-transparent text-xs text-white outline-none w-28"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-1.5 rounded-full hover:bg-[#1f1f1f] hover:text-white transition-colors cursor-pointer"
              title="Search in Your Library"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button 
          className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer text-xs font-medium"
          title="Change sorting order"
        >
          <span>Recents</span>
          <ListFilter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List of Library Items */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4 custom-scrollbar">
        
        {/* 1. Liked Songs Item (Purple Gradient) */}
        {(libraryFilter === 'All' || libraryFilter === 'Playlists') && (
          <div 
            onClick={() => setActiveCategory('Favorites')}
            className={`flex items-center p-2 rounded-md hover:bg-[#1f1f1f] transition-colors cursor-pointer group ${
              activeCategory === 'Favorites' ? 'bg-[#232323]' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center flex-shrink-0 shadow-md">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="ml-3 overflow-hidden">
              <h5 className="font-semibold text-sm text-white truncate group-hover:text-white">
                Liked Songs
              </h5>
              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                <span className="text-emerald-500 font-bold">📌</span>
                <span>Playlist • {favoritesCount} songs</span>
              </p>
            </div>
          </div>
        )}

        {/* 2. Your Episodes Item (Emerald Gradient) */}
        {(libraryFilter === 'All' || libraryFilter === 'Podcasts' || libraryFilter === 'Playlists') && (
          <div 
            onClick={() => setActiveCategory('Podcasts')}
            className={`flex items-center p-2 rounded-md hover:bg-[#1f1f1f] transition-colors cursor-pointer group ${
              activeCategory === 'Podcasts' ? 'bg-[#232323]' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#006450] to-[#059669] flex items-center justify-center flex-shrink-0 shadow-md">
              <BookmarkCheck className="w-5 h-5 fill-emerald-300 text-emerald-300" />
            </div>
            <div className="ml-3 overflow-hidden">
              <h5 className="font-semibold text-sm text-white truncate group-hover:text-white">
                Your Episodes
              </h5>
              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                <span className="text-emerald-500 font-bold">📌</span>
                <span>Playlist • Saved & downloaded</span>
              </p>
            </div>
          </div>
        )}

        {/* 3. User Playlists */}
        {(libraryFilter === 'All' || libraryFilter === 'Playlists') && playlists.map((pl, idx) => {
          const sampleSong = songs.find(s => pl.songIds?.includes(s.id));
          const isMenuOpen = openMenuPlaylistId === pl.id;

          return (
            <div
              key={pl.id}
              onClick={() => setActiveCategory(`Playlist: ${pl.name}`)}
              className={`relative flex items-center justify-between p-2 rounded-md hover:bg-[#1f1f1f] transition-colors cursor-pointer group ${
                activeCategory === `Playlist: ${pl.name}` ? 'bg-[#232323]' : ''
              }`}
            >
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-12 h-12 rounded-md bg-[#282828] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md">
                  {sampleSong?.cover ? (
                    <img src={sampleSong.cover} alt={pl.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music2 className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
                <div className="ml-3 overflow-hidden flex-1">
                  <h5 className="font-semibold text-sm text-white truncate group-hover:text-white">
                    {pl.name}
                  </h5>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">
                    Playlist • Indrajit
                  </p>
                </div>
              </div>

              {/* 3-Dots More Options Button (Appears on hover) */}
              <div className="relative ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuPlaylistId(isMenuOpen ? null : pl.id);
                  }}
                  className={`p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer ${
                    isMenuOpen ? 'opacity-100 text-white bg-white/10' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-8 z-50 w-44 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1 text-xs text-zinc-200 backdrop-blur-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlaylist(pl);
                        setEditName(pl.name);
                        setOpenMenuPlaylistId(null);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-white/10 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit Playlist</span>
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuPlaylistId(null);
                        if (onDeletePlaylist) {
                          onDeletePlaylist(pl.id);
                        }
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-left transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Playlist</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 4. Artists (Circular Avatars) */}
        {(libraryFilter === 'All' || libraryFilter === 'Artists') && artists.map((artist, idx) => {
          const artistSong = songs.find(s => s.artist === artist);
          return (
            <div
              key={artist}
              onClick={() => onPlaySong(artistSong)}
              className="flex items-center p-2 rounded-md hover:bg-[#1f1f1f] transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 shadow-sm border border-white/10">
                <img 
                  src={artistSong?.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200'} 
                  alt={artist} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="ml-3 overflow-hidden">
                <h5 className="font-semibold text-sm text-white truncate group-hover:text-white">
                  {artist}
                </h5>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Artist
                </p>
              </div>
            </div>
          );
        })}

      </div>

      {/* Edit Playlist Modal */}
      {editingPlaylist && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setEditingPlaylist(null)}
        >
          <div 
            className="relative w-full max-w-sm p-6 bg-[#181922] border border-white/10 text-white shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-base text-white">Edit Playlist</h3>
              <button
                type="button"
                onClick={() => setEditingPlaylist(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editName.trim() && onEditPlaylist) {
                onEditPlaylist(editingPlaylist.id, editName.trim());
              }
              setEditingPlaylist(null);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    placeholder="Enter playlist name"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[#121212] border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlaylist(null)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editName.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-black hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </aside>
  );
}
