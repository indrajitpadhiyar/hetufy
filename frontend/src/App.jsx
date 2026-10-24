import { useState, useEffect } from 'react';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MusicGrid from './components/MusicGrid';
import FeaturesSection from './components/FeaturesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import Toast from './components/Toast';
import PlaylistModal from './components/PlaylistModal';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import { songs, genres, loadSongs } from './data/songs';
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

  // Load songs from backend API or local scanner
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      await seedBackendSongs();
      const liveSongs = await getSongsFromAPI(activeCategory, searchQuery);
      if (isMounted && liveSongs && liveSongs.length > 0) {
        setSongList(liveSongs);
        if (!currentSong) {
          setCurrentSong(liveSongs[0]);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
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

  return (
    <div className="relative min-h-screen text-[#1c1b18] bg-[#d3cac0] p-3 sm:p-5 md:p-8 font-sans pb-28">
      {/* Background Frame Layer */}
      <Background />

      {/* Main Editorial Canvas Frame */}
      <div className="relative z-10 editorial-canvas min-h-screen">
        {/* Top Header Navbar */}
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onOpenPlaylists={() => setIsPlaylistModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="relative z-10 transition-all">
          <Hero 
            onStartListening={handleStartListening} 
            featuredSong={currentSong || songList[0]}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onDownload={handleDownload}
            isFavorite={favorites.includes(currentSong?.id || songList[0]?.id)}
            onToggleFavorite={handleToggleFavorite}
            songList={songList}
            onPlaySong={handlePlaySong}
            onOpenAddToPlaylist={(song) => setSongForAddToPlaylist(song)}
          />

          <MusicGrid 
            songs={songList}
            categories={genres}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onTogglePlay={handleTogglePlay}
            onDownload={handleDownload}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            playlists={playlists}
            onOpenAddToPlaylist={(song) => setSongForAddToPlaylist(song)}
          />

          <FeaturesSection />

          <CTASection onExploreClick={handleExploreClick} />
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Persistent Bottom Audio Player */}
      {currentSong && (
        <MusicPlayer 
          currentSong={currentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNext={handleNext}
          onPrev={handlePrev}
          onDownload={handleDownload}
          isFavorite={favorites.includes(currentSong?.id)}
          onToggleFavorite={handleToggleFavorite}
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
          const libraryEl = document.getElementById('library');
          if (libraryEl) libraryEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Add To Playlist Quick Modal */}
      <AddToPlaylistModal 
        isOpen={!!songForAddToPlaylist}
        onClose={() => setSongForAddToPlaylist(null)}
        song={songForAddToPlaylist}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
      />

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}


