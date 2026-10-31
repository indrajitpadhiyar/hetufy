import { useState, useEffect, useRef } from 'react';
import { Home, Search, Library, Radio, Plus, Heart, Sparkles, Music2, Bookmark, FolderPlus } from 'lucide-react';
import SpotifyTopBar from './components/SpotifyTopBar';
import SpotifyLibrarySidebar from './components/SpotifyLibrarySidebar';
import SpotifyMainView from './components/SpotifyMainView';
import SpotifyNowPlayingSidebar from './components/SpotifyNowPlayingSidebar';
import MusicPlayer from './components/MusicPlayer';
import Toast from './components/Toast';
import PlaylistModal from './components/PlaylistModal';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import LoadingScreen from './components/LoadingScreen';
import AuthScreen from './components/AuthScreen';
import UpdateModal from './components/UpdateModal';
import { checkForAppUpdate } from './config/version';
import { songs, genres } from './data/songs';
import { 
  getSongsFromAPI, 
  recordSongPlay, 
  recordSongDownload, 
  toggleLikeInBackend, 
  seedBackendSongs,
  savePlaybackStateToBackend 
} from './services/api';

const DEFAULT_PLAYLISTS = [
  { id: 'pl-1', name: 'Studio Favorites', description: 'Handpicked vinyl recordings and arrangements', songIds: [1, 2] }
];

export default function App() {
  const [songList, setSongList] = useState(songs);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState([1]);
  const [toast, setToast] = useState(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState('home');

  // Initial App Loading Screen State
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hetufy_user');
      if (saved) return JSON.parse(saved);
      // Auto-create listener session so app is NEVER blocked or blank on fresh launch
      const defaultUser = {
        name: 'IDR Listener',
        email: 'listener@idrmusic.app',
        avatar: '/idrmusic.png',
        role: 'user',
        token: `user_${Date.now()}`
      };
      localStorage.setItem('hetufy_user', JSON.stringify(defaultUser));
      localStorage.setItem('hetufy_logged_in', 'true');
      return defaultUser;
    } catch (e) {
      return {
        name: 'IDR Listener',
        email: 'listener@idrmusic.app',
        avatar: '/idrmusic.png',
        role: 'user'
      };
    }
  });

  // App Update State
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    // Check for APK update shortly after startup
    const checkTimer = setTimeout(async () => {
      try {
        const update = await checkForAppUpdate();
        if (update && update.hasUpdate) {
          setUpdateInfo(update);
          setIsUpdateModalOpen(true);
        }
      } catch (err) {}
    }, 2500);

    return () => clearTimeout(checkTimer);
  }, []);

  // Helper to read saved playback position for a specific user
  const getSavedPlayback = (user = currentUser) => {
    if (!user) return null;
    const userKey = `hetufy_last_playback_${user.email || user._id || user.id || 'default'}`;
    let localSaved = null;
    try {
      const raw = localStorage.getItem(userKey);
      if (raw) localSaved = JSON.parse(raw);
    } catch (e) {}

    const backendSaved = user.lastPlayback;
    if (localSaved && backendSaved) {
      const localTime = new Date(localSaved.updatedAt || 0).getTime();
      const backendTime = new Date(backendSaved.updatedAt || 0).getTime();
      return localTime >= backendTime ? localSaved : backendSaved;
    }
    return localSaved || backendSaved || null;
  };

  const initialSaved = getSavedPlayback(currentUser);

  const [currentSong, setCurrentSong] = useState(() => {
    if (initialSaved?.songId) {
      const matched = songs.find(s => String(s.id) === String(initialSaved.songId));
      if (matched) return matched;
    }
    return songs[0] || null;
  });

  const [initialSeekTime, setInitialSeekTime] = useState(() => {
    return initialSaved?.currentTime ? Number(initialSaved.currentTime) : 0;
  });

  const hasRestoredPlaybackRef = useRef(false);
  const backendSaveTimeoutRef = useRef(null);

  // Save playback state to localStorage and debounced backend
  const handleSavePlayback = (songId, currentTime, wasPlaying = false, forceBackend = false) => {
    if (!currentUser) return;
    const userKey = `hetufy_last_playback_${currentUser.email || currentUser._id || currentUser.id || 'default'}`;
    const payload = {
      songId: String(songId),
      currentTime: Math.round(currentTime * 10) / 10,
      wasPlaying: Boolean(wasPlaying),
      updatedAt: new Date().toISOString()
    };

    // 1. Instant local storage save
    try {
      localStorage.setItem(userKey, JSON.stringify(payload));
    } catch (e) {}

    // 2. Debounced or immediate backend sync
    if (forceBackend) {
      if (backendSaveTimeoutRef.current) clearTimeout(backendSaveTimeoutRef.current);
      savePlaybackStateToBackend(songId, payload.currentTime, wasPlaying);
    } else {
      if (backendSaveTimeoutRef.current) clearTimeout(backendSaveTimeoutRef.current);
      backendSaveTimeoutRef.current = setTimeout(() => {
        savePlaybackStateToBackend(songId, payload.currentTime, wasPlaying);
      }, 3500);
    }
  };

  const handleLogout = () => {
    if (currentSong && currentUser) {
      handleSavePlayback(currentSong.id, 0, false, true);
    }
    localStorage.removeItem('hetufy_user');
    localStorage.removeItem('hetufy_token');
    localStorage.removeItem('hetufy_logged_in');
    setCurrentUser(null);
    setIsPlaying(false);
    triggerToast("Logged Out", "Playback state preserved for your next login", "info");
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const saved = getSavedPlayback(user);
    if (saved && saved.songId) {
      const matched = songList.find(s => String(s.id) === String(saved.songId));
      if (matched) {
        setCurrentSong(matched);
        const seek = Number(saved.currentTime) || 0;
        setInitialSeekTime(seek);
        const minutes = Math.floor(seek / 60);
        const seconds = Math.floor(seek % 60).toString().padStart(2, '0');
        triggerToast("Session Resumed", `Resumed "${matched.title}" from ${minutes}:${seconds}`, "info");
      }
    }
  };

  // Theme State locked to Dark Theme
  const [theme, setTheme] = useState(() => {
    localStorage.setItem('hetufy_theme', 'dark');
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('hetufy_theme', 'dark');
    document.documentElement.classList.add('dark');
  }, []);

  // Playlist State & LocalStorage Persistence
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem('mitter_playlists');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse playlists:', err);
      }
    }
    return DEFAULT_PLAYLISTS;
  });

  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [songForAddToPlaylist, setSongForAddToPlaylist] = useState(null);

  useEffect(() => {
    localStorage.setItem('mitter_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const [isLoadingSongs, setIsLoadingSongs] = useState(true);

  // Load songs from backend API or local scanner
  const loadData = async () => {
    setIsLoadingSongs(true);
    try {
      const liveSongs = await getSongsFromAPI(activeCategory, searchQuery);
      if (liveSongs && liveSongs.length > 0) {
        setSongList(liveSongs);
        
        // Restore user playback track if not already matched
        if (!hasRestoredPlaybackRef.current) {
          const saved = getSavedPlayback(currentUser);
          if (saved && saved.songId) {
            const matchedTrack = liveSongs.find(s => String(s.id) === String(saved.songId));
            if (matchedTrack) {
              setCurrentSong(matchedTrack);
              const seek = Number(saved.currentTime) || 0;
              setInitialSeekTime(seek);
              hasRestoredPlaybackRef.current = true;
              if (seek > 5) {
                const minutes = Math.floor(seek / 60);
                const seconds = Math.floor(seek % 60).toString().padStart(2, '0');
                triggerToast("Resumed Track", `Continuing "${matchedTrack.title}" from ${minutes}:${seconds}`, "info");
              }
            }
          } else if (!currentSong) {
            setCurrentSong(liveSongs[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load songs from API:', e);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCategory, searchQuery]);

  // Probe exact audio duration for each track and update state
  useEffect(() => {
    if (!songList || songList.length === 0) return;
    songList.forEach((song) => {
      if (song.audio) {
        const audio = new Audio();
        audio.src = song.audio;
        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            const exactDuration = Math.round(audio.duration);
            setSongList(prev => prev.map(s => s.id === song.id ? { ...s, duration: exactDuration } : s));
          }
        };
      }
    });
  }, [songList.map(s => s.id).join(',')]);

  // Show temporary toast message
  const triggerToast = (title, message, type = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Playlist Handlers
  const handleCreatePlaylist = (name, description = '') => {
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      songIds: [],
      createdAt: new Date().toISOString()
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    triggerToast("Playlist Created", `Created "${name}"`, "info");
    return newPlaylist;
  };

  const handleAddToPlaylist = (playlistId, songId) => {
    const targetSong = songList.find(s => s.id === songId);
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (!pl.songIds.includes(songId)) {
          triggerToast("Added to Playlist", `Added "${targetSong?.title || 'Track'}" to ${pl.name}`, "info");
          return { ...pl, songIds: [...pl.songIds, songId] };
        } else {
          triggerToast("Already in Playlist", `Track is already in ${pl.name}`, "info");
        }
      }
      return pl;
    }));
  };

  const handleRemoveFromPlaylist = (playlistId, songId) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, songIds: pl.songIds.filter(id => id !== songId) };
      }
      return pl;
    }));
    triggerToast("Removed Track", "Track removed from playlist", "info");
  };

  const handleDeletePlaylist = (playlistId) => {
    const target = playlists.find(pl => pl.id === playlistId);
    if (target && activeCategory === `Playlist: ${target.name}`) {
      setActiveCategory('All');
    }
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
    triggerToast("Playlist Deleted", "Playlist removed", "info");
  };

  const handleEditPlaylist = (playlistId, newName) => {
    if (!newName || !newName.trim()) return;
    const trimmed = newName.trim();
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (activeCategory === `Playlist: ${pl.name}`) {
          setActiveCategory(`Playlist: ${trimmed}`);
        }
        return { ...pl, name: trimmed };
      }
      return pl;
    }));
    triggerToast("Playlist Updated", `Renamed to "${trimmed}"`, "info");
  };

  // Audio Handlers
  const handlePlaySong = (song) => {
    setInitialSeekTime(0);
    setCurrentSong(song);
    setIsPlaying(true);
    setIsFullPlayerOpen(true);
    recordSongPlay(song.id);
    handleSavePlayback(song.id, 0, true, false);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentSong) {
      recordSongPlay(currentSong.id);
    }
  };

  const handleNext = (isShuffle = false) => {
    if (!currentSong || songList.length === 0) return;
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songList.length);
    } else {
      const currentIndex = songList.findIndex(s => s.id === currentSong.id);
      nextIndex = (currentIndex + 1) % songList.length;
    }
    const nextTrack = songList[nextIndex];
    setInitialSeekTime(0);
    setCurrentSong(nextTrack);
    setIsPlaying(true);
    recordSongPlay(nextTrack.id);
    handleSavePlayback(nextTrack.id, 0, true, false);
  };

  const handlePrev = (isShuffle = false) => {
    if (!currentSong || songList.length === 0) return;
    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * songList.length);
    } else {
      const currentIndex = songList.findIndex(s => s.id === currentSong.id);
      prevIndex = (currentIndex - 1 + songList.length) % songList.length;
    }
    const prevTrack = songList[prevIndex];
    setInitialSeekTime(0);
    setCurrentSong(prevTrack);
    setIsPlaying(true);
    recordSongPlay(prevTrack.id);
    handleSavePlayback(prevTrack.id, 0, true, false);
  };

  const handleDownload = (song) => {
    const link = document.createElement('a');
    link.href = song.audio;
    link.download = `${song.title.replace(/\s+/g, '_')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    recordSongDownload(song.id);
    triggerToast("Downloading Track", `Saved "${song.title}"`, "download");
  };

  const handleToggleFavorite = (songId) => {
    setFavorites(prev => {
      const exists = prev.includes(songId);
      const updated = exists ? prev.filter(id => id !== songId) : [...prev, songId];
      const targetSong = songList.find(s => s.id === songId);
      toggleLikeInBackend(songId, !exists);
      triggerToast(
        exists ? "Removed from Favorites" : "Added to Favorites",
        targetSong ? `"${targetSong.title}"` : "Track updated",
        "favorite"
      );
      return updated;
    });
  };

  const handleStartListening = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
    const libraryEl = document.getElementById('library');
    if (libraryEl) {
      libraryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    const libraryEl = document.getElementById('library');
    if (libraryEl) {
      libraryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoadingApp) {
    return <LoadingScreen onFinish={() => setIsLoadingApp(false)} />;
  }

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans select-none">
      
      {/* 1. Spotify Desktop Window Top Bar */}
      <SpotifyTopBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenPlaylists={() => setIsPlaylistModalOpen(true)}
        onResetToHome={() => {
          setActiveCategory('All');
          setSearchQuery('');
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Workspace (Desktop 3-Column or Mobile Screen) */}
      <div className="flex-1 flex overflow-hidden p-0 sm:p-2 gap-2 min-h-0 mb-0 md:mb-[76px]">
        
        {/* Left Column: Your Library (Desktop md: and up) */}
        <SpotifyLibrarySidebar 
          playlists={playlists}
          onCreatePlaylist={handleCreatePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          onEditPlaylist={handleEditPlaylist}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          favoritesCount={favorites.length}
          songs={songList}
          onPlaySong={handlePlaySong}
        />

        {/* Center Main View or Mobile Selected Tab */}
        {mobileTab === 'home' && (
          <SpotifyMainView 
            songs={songList.filter(s => {
              let matchesCategory = false;
              if (activeCategory.startsWith('Playlist: ')) {
                const plName = activeCategory.replace('Playlist: ', '');
                const targetPl = playlists.find(p => p.name === plName);
                matchesCategory = targetPl ? (targetPl.songIds || []).includes(s.id) : false;
              } else if (activeCategory === 'Favorites') {
                matchesCategory = favorites.includes(s.id);
              } else if (activeCategory === 'Music' || activeCategory === 'All') {
                matchesCategory = true;
              } else {
                matchesCategory = (s.genre || '').toLowerCase() === activeCategory.toLowerCase();
              }

              const query = (searchQuery || '').toLowerCase().trim();
              const matchesSearch = !query || 
                (s.title || '').toLowerCase().includes(query) ||
                (s.artist || '').toLowerCase().includes(query);

              return matchesCategory && matchesSearch;
            })}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onTogglePlay={handleTogglePlay}
            onDownload={handleDownload}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenAddToPlaylist={(song) => setSongForAddToPlaylist(song)}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            categories={genres}
            isLoading={isLoadingSongs}
            onRetry={loadData}
            currentUser={currentUser}
          />
        )}

        {/* Mobile Search Tab */}
        {mobileTab === 'search' && (
          <div className="md:hidden flex-1 h-full bg-[#121212] overflow-y-auto p-4 pb-36 text-white custom-scrollbar">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#242424] overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <img src="/idrmusic.png" alt="IDR" className="w-6 h-6 object-contain" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">Search</h2>
            </div>

            <div className="relative mb-5">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#282828] border border-white/10 rounded-lg text-sm text-white placeholder-neutral-400 outline-none focus:border-white/30"
              />
            </div>

            {!searchQuery ? (
              <div>
                <h3 className="font-bold text-base text-white mb-3">Browse all</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: 'Bollywood', bg: 'from-amber-600 to-orange-700' },
                    { title: 'Chill', bg: 'from-cyan-600 to-blue-700' },
                    { title: 'Pop', bg: 'from-pink-600 to-rose-700' },
                    { title: 'Punjabi', bg: 'from-emerald-600 to-teal-800' },
                    { title: 'Funk', bg: 'from-purple-600 to-indigo-800' },
                    { title: 'Folk', bg: 'from-yellow-600 to-amber-800' },
                    { title: 'Garba', bg: 'from-red-600 to-pink-800' },
                    { title: 'Romantic', bg: 'from-fuchsia-600 to-purple-800' }
                  ].map((item) => (
                    <div
                      key={item.title}
                      onClick={() => {
                        setActiveCategory(item.title);
                        setMobileTab('home');
                      }}
                      className={`h-24 rounded-lg bg-gradient-to-br ${item.bg} p-3 font-bold text-white text-base relative overflow-hidden cursor-pointer shadow-md`}
                    >
                      <span>{item.title}</span>
                      <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white/10 rounded-full blur-xs" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {songList
                  .filter(s => 
                    (s.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                    (s.artist || '').toLowerCase().includes((searchQuery || '').toLowerCase())
                  )
                  .map((song) => (
                    <div
                      key={song.id}
                      onClick={() => handlePlaySong(song)}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-800/80 cursor-pointer"
                    >
                      <img src={song.cover} alt={song.title} className="w-11 h-11 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
                        <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile Library Tab */}
        {mobileTab === 'library' && (
          <div className="md:hidden flex-1 h-full bg-[#121212] overflow-y-auto p-4 pb-36 text-white custom-scrollbar">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#242424] overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/idrmusic.png" alt="IDR" className="w-6 h-6 object-contain" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white">Your Library</h2>
              </div>
              <button
                onClick={() => setIsPlaylistModalOpen(true)}
                className="p-2 text-neutral-300 hover:text-white"
                title="Create playlist"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Pinned Liked Songs */}
            <div 
              onClick={() => {
                setActiveCategory('Favorites');
                setMobileTab('home');
              }}
              className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-neutral-800/60 cursor-pointer mb-2"
            >
              <div className="w-12 h-12 rounded bg-gradient-to-br from-indigo-600 to-blue-400 flex items-center justify-center shadow">
                <Heart className="w-6 h-6 fill-white text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white">Liked Songs</h4>
                <p className="text-xs text-neutral-400">Playlist • {favorites.length} songs</p>
              </div>
            </div>

            {/* User Playlists */}
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => {
                  setActiveCategory(`Playlist: ${pl.name}`);
                  setMobileTab('home');
                }}
                className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-neutral-800/60 cursor-pointer mb-2"
              >
                <div className="w-12 h-12 rounded bg-neutral-800 flex items-center justify-center shadow border border-white/5">
                  <Bookmark className="w-6 h-6 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{pl.name}</h4>
                  <p className="text-xs text-neutral-400">Playlist • {(pl.songIds || []).length} songs</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Favorites / Premium Tab */}
        {mobileTab === 'favorites' && (
          <div className="md:hidden flex-1 h-full bg-[#121212] overflow-y-auto p-4 pb-36 text-white custom-scrollbar">
            <div className="flex items-center space-x-4 mb-6 pt-2">
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl flex-shrink-0">
                <Heart className="w-10 h-10 fill-white text-white" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold">Playlist</p>
                <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
                <p className="text-xs text-neutral-400 mt-1">{favorites.length} saved tracks</p>
              </div>
            </div>

            <div className="space-y-1">
              {songList.filter(s => favorites.includes(s.id)).map((song) => (
                <div
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-800 cursor-pointer"
                >
                  <img src={song.cover} alt={song.title} className="w-11 h-11 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
                    <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(song.id);
                    }}
                    className="p-2 text-[#1ed760]"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Column: Now Playing View (Desktop Only) */}
        {isRightSidebarOpen && currentSong && (
          <SpotifyNowPlayingSidebar 
            currentSong={currentSong}
            isFavorite={favorites.includes(currentSong.id)}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => setIsRightSidebarOpen(false)}
            onOpenAddToPlaylist={(song) => setSongForAddToPlaylist(song)}
          />
        )}

      </div>

      {/* 3. Persistent Spotify Audio Player (Floating Mini-Player on Mobile, Footer on Desktop) */}
      {currentSong && (
        <MusicPlayer 
          currentSong={currentSong}
          songList={songList}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNext={handleNext}
          onPrev={handlePrev}
          onPlaySong={handlePlaySong}
          onDownload={handleDownload}
          isFavorite={favorites.includes(currentSong?.id)}
          onToggleFavorite={handleToggleFavorite}
          isFullPlayerOpen={isFullPlayerOpen}
          setIsFullPlayerOpen={setIsFullPlayerOpen}
          theme={theme}
          setTheme={setTheme}
          onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          initialSeekTime={initialSeekTime}
          onSavePlayback={handleSavePlayback}
        />
      )}

      {/* 4. MOBILE 5-TAB BOTTOM NAVIGATION BAR (Exact Spotify Mobile UI) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-[#121212]/95 backdrop-blur-md border-t border-white/5 z-50 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] select-none">
        <button
          onClick={() => setMobileTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
            mobileTab === 'home' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${mobileTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setMobileTab('search')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
            mobileTab === 'search' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Search className={`w-5 h-5 mb-0.5 ${mobileTab === 'search' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px]">Search</span>
        </button>

        <button
          onClick={() => setMobileTab('library')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
            mobileTab === 'library' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Library className={`w-5 h-5 mb-0.5 ${mobileTab === 'library' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px]">Your Library</span>
        </button>

        <button
          onClick={() => setMobileTab('favorites')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
            mobileTab === 'favorites' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Radio className={`w-5 h-5 mb-0.5 ${mobileTab === 'favorites' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px]">Premium</span>
        </button>

        <button
          onClick={() => setIsPlaylistModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-400 hover:text-white cursor-pointer transition-colors"
        >
          <Plus className="w-5 h-5 mb-0.5 stroke-2" />
          <span className="text-[10px]">Create</span>
        </button>
      </nav>

      {/* Playlist Manager Modal */}
      <PlaylistModal 
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        playlists={playlists}
        songs={songList}
        onCreatePlaylist={handleCreatePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onRemoveFromPlaylist={handleRemoveFromPlaylist}
        onPlaySong={handlePlaySong}
        onSelectPlaylistFilter={(plCategoryName) => {
          setActiveCategory(plCategoryName);
        }}
        theme={theme}
      />

      {/* Add To Playlist Quick Modal */}
      <AddToPlaylistModal 
        isOpen={!!songForAddToPlaylist}
        onClose={() => setSongForAddToPlaylist(null)}
        song={songForAddToPlaylist}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
        theme={theme}
      />


      {/* In-App Update Modal */}
      <UpdateModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateInfo}
      />

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}


