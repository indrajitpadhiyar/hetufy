import { loadSongs } from '../data/songs';

const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Fetch all songs from Express backend with fallback to local static library
 */
export async function getSongsFromAPI(genre = 'All', search = '') {
  let apiSongs = [];
  try {
    const params = new URLSearchParams();
    if (genre && genre !== 'All') params.append('genre', genre);
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/songs?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        apiSongs = data.data.map(transformSongFormat);
      }
    }
  } catch (error) {
    console.warn('[API Client] Backend fetch warning:', error.message);
  }

  let localSongs = loadSongs();
  if (genre && genre !== 'All') {
    localSongs = localSongs.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
  }
  if (search) {
    const query = search.toLowerCase();
    localSongs = localSongs.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query) ||
      s.genre.toLowerCase().includes(query)
    );
  }

  const combined = [...apiSongs, ...localSongs];
  const uniqueMap = new Map();
  combined.forEach((s, idx) => {
    const key = s.id || s.title;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, { ...s, id: s.id || `track_${idx}` });
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * Seed initial tracks to backend MongoDB if empty
 */
export async function seedBackendSongs() {
  try {
    const response = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
    const data = await response.json();
    return data;
  } catch (e) {
    console.warn('[API Client] Could not seed backend:', e.message);
  }
}

/**
 * Record audio play event in backend analytics/Redis
 */
export async function recordSongPlay(songId) {
  if (!songId || typeof songId === 'number') return; // Skip numeric local IDs
  try {
    await fetch(`${API_BASE_URL}/songs/${songId}/play`, { method: 'POST' });
  } catch (e) {
    // Silent catch
  }
}

/**
 * Record audio download event in backend analytics/Redis
 */
export async function recordSongDownload(songId) {
  if (!songId || typeof songId === 'number') return;
  try {
    await fetch(`${API_BASE_URL}/songs/${songId}/download`);
  } catch (e) {
    // Silent catch
  }
}

/**
 * Toggle favorite status in backend
 */
export async function toggleLikeInBackend(songId, isFavorite) {
  if (!songId || typeof songId === 'number') return;
  try {
    await fetch(`${API_BASE_URL}/songs/${songId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isFavorite ? 'like' : 'unlike' })
    });
  } catch (e) {
    // Silent catch
  }
}

/**
 * Convert backend Mongo song schema into frontend component schema
 */
function transformSongFormat(song) {
  return {
    id: song._id || song.id,
    title: song.title,
    artist: song.artist,
    album: song.album || 'Single Library',
    genre: song.genre || 'Pop',
    duration: song.duration || 180,
    cover: song.coverUrl,
    audio: song.audioUrl,
    featured: song.featured || false,
    downloads: song.downloadsCount ? `${song.downloadsCount} DLs` : 'MP3 Download',
    playsCount: song.playsCount || 0,
    likesCount: song.likesCount || 0,
    releaseYear: song.releaseYear || '2026',
    accentColor: song.accentColor || '#8b5cf6'
  };
}
