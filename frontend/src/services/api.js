import { loadSongs } from '../data/songs';
import { getApiBaseUrl, apiRequest } from '../config/api';

/**
 * Test connectivity to Render or local backend
 */
export async function testBackendConnection() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await apiRequest('/health', { method: 'GET' }, 15000);
    if (res.ok) {
      const data = await res.json();
      return { ok: true, url: baseUrl, data };
    }
    return { ok: false, url: baseUrl, status: res.status, message: `HTTP ${res.status}: Route or server error` };
  } catch (error) {
    let msg = error.message;
    if (msg && (msg.includes('Failed to fetch') || msg.includes('NetworkError'))) {
      msg = `Cannot reach ${baseUrl}. In browsers, disable ad-blockers / Brave Shields (which trigger ERR_BLOCKED_BY_CLIENT), or wait for Render cold-start.`;
    }
    return { ok: false, url: baseUrl, message: msg, isTimeout: error.isTimeout };
  }
}

/**
 * Fetch all songs from Express / Render backend with fallback to local static library
 */
export async function getSongsFromAPI(genre = 'All', search = '') {
  let apiSongs = [];
  const params = new URLSearchParams();
  if (genre && genre !== 'All') params.append('genre', genre);
  if (search) params.append('search', search);

  const queryString = params.toString() ? `?${params.toString()}` : '';

  // Retry up to 2 times to handle Render free-tier cold starts smoothly
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await apiRequest(`/songs${queryString}`, { method: 'GET' }, 35000);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          apiSongs = data.data.map(transformSongFormat);
          break;
        }
      }
    } catch (error) {
      console.warn(`[API Client] Attempt ${attempt} backend fetch warning:`, error.message);
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
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
    const response = await apiRequest('/seed', { method: 'POST' }, 15000);
    if (!response.ok) {
      // Backend MongoDB not connected or seeding deferred, safe to bypass
      return null;
    }
    const data = await response.json();
    return data;
  } catch (e) {
    // Silent fallback to static catalog
    return null;
  }
}

/**
 * Record audio play event in backend analytics/Redis
 */
export async function recordSongPlay(songId) {
  if (!songId || typeof songId === 'number') return;
  try {
    await apiRequest(`/songs/${songId}/play`, { method: 'POST' }, 5000);
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
    await apiRequest(`/songs/${songId}/download`, { method: 'GET' }, 5000);
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
    await apiRequest(`/songs/${songId}/like`, {
      method: 'POST',
      body: JSON.stringify({ action: isFavorite ? 'like' : 'unlike' })
    }, 5000);
  } catch (e) {
    // Silent catch
  }
}

/**
 * Authentication Services
 */
export async function loginUser(email, password) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  const token = data?.data?.token || data?.token;
  if (token) {
    localStorage.setItem('hetufy_token', token);
  }
  return data;
}

export async function registerUser(username, email, password) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: username, email, password })
  });
  const data = await response.json();
  const token = data?.data?.token || data?.token;
  if (token) {
    localStorage.setItem('hetufy_token', token);
  }
  return data;
}

export async function loginWithGoogle({ credential, userInfo }) {
  try {
    const response = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, userInfo })
    }, 20000);
    const data = await response.json();
    const token = data?.data?.token || data?.token || `google_token_${Date.now()}`;
    if (token) {
      localStorage.setItem('hetufy_token', token);
    }
    return data;
  } catch (error) {
    console.warn('[API Client] Google auth backend call fallback:', error.message);
    const fallbackToken = `google_token_${Date.now()}`;
    localStorage.setItem('hetufy_token', fallbackToken);
    return {
      success: true,
      data: {
        _id: userInfo?.sub || `google_${Date.now()}`,
        name: userInfo?.name || 'Google User',
        email: userInfo?.email || 'user@gmail.com',
        avatar: userInfo?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=google`,
        isGoogleAuth: true,
        token: fallbackToken
      }
    };
  }
}

export async function getCurrentUser() {
  const token = localStorage.getItem('hetufy_token');
  const savedUser = localStorage.getItem('hetufy_user');
  if (!token && !savedUser) return null;
  try {
    const response = await apiRequest('/auth/me', { method: 'GET' }, 8000);
    if (response.ok) {
      const resData = await response.json();
      if (resData && resData.data) {
        const updated = {
          ...(savedUser ? JSON.parse(savedUser) : {}),
          ...resData.data
        };
        localStorage.setItem('hetufy_user', JSON.stringify(updated));
        return updated;
      }
    }
  } catch (e) {
    // Keep local session persistent even if backend is offline or sleeping
    console.warn('Backend sync deferred, retaining persistent local session.');
  }
  return savedUser ? JSON.parse(savedUser) : null;
}

export function logoutUser() {
  localStorage.removeItem('hetufy_token');
  localStorage.removeItem('hetufy_user');
}

/**
 * Save playback position (songId & currentTime) to backend for logged-in user
 */
export async function savePlaybackStateToBackend(songId, currentTime, wasPlaying = false) {
  const token = localStorage.getItem('hetufy_token');
  if (!token || !songId) return null;
  try {
    const response = await apiRequest('/auth/playback', {
      method: 'PUT',
      body: JSON.stringify({ 
        songId: String(songId), 
        currentTime: Number(currentTime) || 0,
        wasPlaying: Boolean(wasPlaying)
      })
    }, 6000);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    // Silent catch (e.g. offline, timeout)
  }
  return null;
}

/**
 * Convert backend Mongo song schema into frontend component schema
 */
function transformSongFormat(song) {
  let cover = song.coverUrl;
  let audio = song.audioUrl;

  // Enforce HTTPS for Render CDN and backend links to avoid mixed-content blocking
  if (cover && cover.startsWith('http://') && cover.includes('onrender.com')) {
    cover = cover.replace('http://', 'https://');
  }
  if (audio && audio.startsWith('http://') && audio.includes('onrender.com')) {
    audio = audio.replace('http://', 'https://');
  }

  return {
    id: song._id || song.id,
    title: song.title,
    artist: song.artist,
    album: song.album || 'Single Library',
    genre: song.genre || 'Pop',
    duration: song.duration || 180,
    cover,
    audio,
    featured: song.featured || false,
    downloads: song.downloadsCount ? `${song.downloadsCount} DLs` : 'MP3 Download',
    playsCount: song.playsCount || 0,
    likesCount: song.likesCount || 0,
    releaseYear: song.releaseYear || '2026',
    accentColor: song.accentColor || '#8b5cf6'
  };
}
