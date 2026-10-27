import { useState, useEffect } from 'react';
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
import { songs, genres } from './data/songs';
import { getSongsFromAPI, recordSongPlay, recordSongDownload, toggleLikeInBackend, seedBackendSongs } from './services/api';

const DEFAULT_PLAYLISTS = [
  { id: 'pl-1', name: 'Studio Favorites', description: 'Handpicked vinyl recordings and arrangements', songIds: [1, 2] }
];

export default function App() {
  const [songList, setSongList] = useState(songs);
  const [currentSong, setCurrentSong] = useState(songs[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState([1]);
  const [toast, setToast] = useState(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Initial App Loading Screen State
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hetufy_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('hetufy_user');
    localStorage.removeItem('hetufy_token');
    setCurrentUser(null);
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
        if (!currentSong) {
          setCurrentSong(liveSongs[0]);
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
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
    triggerToast("Playlist Deleted", "Playlist removed", "info");
  };

  // Audio Handlers
  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setIsFullPlayerOpen(true);
    recordSongPlay(song.id);
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
    setCurrentSong(nextTrack);
    setIsPlaying(true);
    recordSongPlay(nextTrack.id);
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
    setCurrentSong(prevTrack);
    setIsPlaying(true);
    recordSongPlay(prevTrack.id);
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
    return <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
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

      {/* 2. Main 3-Column Workspace (Library Left, Main Center, Now Playing Right) */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2 min-h-0 mb-[76px]">
        
        {/* Left Column: Your Library */}
        <SpotifyLibrarySidebar 
          playlists={playlists}
          onCreatePlaylist={handleCreatePlaylist}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          favoritesCount={favorites.length}
          songs={songList}
          onPlaySong={handlePlaySong}
        />

        {/* Center Column: Main Content Area */}
        <SpotifyMainView 
          songs={songList.filter(s => {
            let matchesCategory = false;
            if (activeCategory.startsWith('Playlist: ')) {
              const plName = activeCategory.replace('Playlist: ', '');
              const targetPl = playlists.find(p => p.name === plName);
              matchesCategory = targetPl ? targetPl.songIds.includes(s.id) : false;
            } else if (activeCategory === 'Favorites') {
              matchesCategory = favorites.includes(s.id);
            } else if (activeCategory === 'Music' || activeCategory === 'All') {
              matchesCategory = true;
            } else {
              matchesCategory = s.genre?.toLowerCase() === activeCategory.toLowerCase();
            }

            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query || 
              s.title.toLowerCase().includes(query) ||
              s.artist.toLowerCase().includes(query);

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
        />

        {/* Right Column: Now Playing View (Toggleable) */}
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

      {/* 3. Persistent Spotify Bottom Audio Player Bar & Full Page View */}
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
        />
      )}

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


      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}


