// Dynamic Music Scanner using Vite import.meta.glob
// Automatically scans public/music/ for any audio file added by the user!

const audioFiles = import.meta.glob('/public/music/*.{mp3,wav,m4a,ogg,flac,aac}', { eager: true });
const coverFiles = import.meta.glob(['/public/covers/*.{jpg,jpeg,png,webp,svg}', '/public/music/*.{jpg,jpeg,png,webp,svg}'], { eager: true });

const accentColors = [
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f97316', // Orange
  '#a855f7', // Violet
  '#f43f5e'  // Rose
];

function formatCleanTitle(rawName) {
  return rawName
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
}

const DEFAULT_SEED_SONGS = [
  {
    id: 'spot_1',
    title: 'Rehbara',
    artist: 'Bhuvan Bam, Rekha Bhardwaj',
    album: 'Taaza Khabar',
    genre: 'Bollywood',
    duration: 215,
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612088_5674468-lq.mp3',
    featured: true,
    downloads: '1.2M DLs',
    releaseYear: '2026',
    accentColor: '#8b5cf6'
  },
  {
    id: 'spot_2',
    title: 'chaandni (With Abhijay Sharma)',
    artist: 'Abhijay Sharma',
    album: 'Chaandni Single',
    genre: 'Pop',
    duration: 184,
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612089_5674468-lq.mp3',
    featured: true,
    downloads: '980K DLs',
    releaseYear: '2026',
    accentColor: '#ec4899'
  },
  {
    id: 'spot_3',
    title: 'TRENDING INSTA FUNK 😈🔥',
    artist: 'DJ Funk, Viral Beats',
    album: 'Night Funk Vol. 1',
    genre: 'Funk',
    duration: 160,
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612090_5674468-lq.mp3',
    featured: true,
    downloads: '2.4M DLs',
    releaseYear: '2026',
    accentColor: '#06b6d4'
  },
  {
    id: 'spot_4',
    title: 'Bollywood & Chill',
    artist: 'Pritam, Arijit Singh',
    album: 'Acoustic Bollywood',
    genre: 'Chill',
    duration: 242,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612091_5674468-lq.mp3',
    featured: true,
    downloads: '3.1M DLs',
    releaseYear: '2026',
    accentColor: '#f97316'
  },
  {
    id: 'spot_5',
    title: 'Navratri special ✨🔥 | Garba 2026',
    artist: 'Kinjal Dave, Kirtidan Gadhvi',
    album: 'Nonstop Garba Hits',
    genre: 'Garba',
    duration: 295,
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612088_5674468-lq.mp3',
    featured: true,
    downloads: '4.5M DLs',
    releaseYear: '2026',
    accentColor: '#10b981'
  },
  {
    id: 'spot_6',
    title: 'Ma meldi na dakla',
    artist: 'Pravin Luni',
    album: 'Maha Dakla',
    genre: 'Folk',
    duration: 210,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612089_5674468-lq.mp3',
    featured: true,
    downloads: '850K DLs',
    releaseYear: '2026',
    accentColor: '#f43f5e'
  },
  {
    id: 'spot_7',
    title: 'Rimjhim Meri',
    artist: 'Darshan Raval',
    album: 'Monsoon Diary',
    genre: 'Monsoon Chill',
    duration: 198,
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612090_5674468-lq.mp3',
    featured: true,
    downloads: '1.9M DLs',
    releaseYear: '2026',
    accentColor: '#3b82f6'
  },
  {
    id: 'spot_8',
    title: 'Tum Mere Ho',
    artist: 'Jubin Nautiyal',
    album: 'Pure Romance',
    genre: 'Romantic',
    duration: 226,
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612091_5674468-lq.mp3',
    featured: true,
    downloads: '2.1M DLs',
    releaseYear: '2026',
    accentColor: '#a855f7'
  },
  {
    id: 'spot_9',
    title: 'Zulfe',
    artist: 'Saahel, Trosk',
    album: 'Midnight Melodies',
    genre: 'Chill',
    duration: 188,
    cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612088_5674468-lq.mp3',
    featured: true,
    downloads: '1.7M DLs',
    releaseYear: '2026',
    accentColor: '#8c5620'
  },
  {
    id: 'spot_10',
    title: 'Chill Karlo',
    artist: 'Karan Aujla, Yo Yo Honey Singh, Diljit Dosanjh',
    album: 'Weekend Vibe',
    genre: 'Chill',
    duration: 204,
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612089_5674468-lq.mp3',
    featured: true,
    downloads: '3.6M DLs',
    releaseYear: '2026',
    accentColor: '#06b6d4'
  },
  {
    id: 'spot_11',
    title: 'Feel Good Telugu',
    artist: 'Anirudh Ravichander, Sid Sriram, G. V. Prakash',
    album: 'Coastal Melodies',
    genre: 'Chill',
    duration: 230,
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612090_5674468-lq.mp3',
    featured: true,
    downloads: '2.8M DLs',
    releaseYear: '2026',
    accentColor: '#10b981'
  },
  {
    id: 'spot_12',
    title: 'Trending Valentine\'s',
    artist: 'Arijit Singh, Shreya Ghoshal',
    album: 'Heartstrings',
    genre: 'Romantic',
    duration: 245,
    cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fit=crop&q=80',
    audio: 'https://cdn.freesound.org/previews/612/612091_5674468-lq.mp3',
    featured: true,
    downloads: '1.4M DLs',
    releaseYear: '2026',
    accentColor: '#ec4899'
  }
];

export function loadSongs() {
  const filePaths = Object.keys(audioFiles);
  
  if (filePaths.length === 0) {
    return DEFAULT_SEED_SONGS;
  }

  return filePaths.map((filePath, index) => {
    const fileName = filePath.split('/').pop();
    let rawUrl = audioFiles[filePath]?.default || `/music/${fileName}`;
    if (rawUrl.startsWith('/public/')) {
      rawUrl = rawUrl.replace('/public', '');
    }
    const audioUrl = rawUrl;
    const baseName = fileName.replace(/\.[^/.]+$/, "");

    let artist = "Local Collection";
    let title = baseName;

    if (baseName.includes(' - ')) {
      const parts = baseName.split(' - ');
      artist = formatCleanTitle(parts[0]);
      title = formatCleanTitle(parts.slice(1).join(' - '));
    } else {
      title = formatCleanTitle(baseName);
    }

    let coverUrl = `/covers/song${(index % 2) + 1}.svg`;
    
    // Check if custom cover exists matching song name
    const matchingCover = Object.keys(coverFiles).find(coverPath => {
      const coverFileName = coverPath.split('/').pop().replace(/\.[^/.]+$/, "");
      return coverFileName.toLowerCase() === baseName.toLowerCase();
    });

    if (matchingCover) {
      const coverName = matchingCover.split('/').pop();
      coverUrl = matchingCover.includes('/public/music/') ? `/music/${coverName}` : `/covers/${coverName}`;
    }

    return {
      id: index + 1,
      title: title,
      artist: artist,
      album: "Local Music Library",
      genre: "Local",
      duration: 180,
      cover: coverUrl,
      audio: audioUrl,
      featured: true,
      downloads: "Local MP3",
      releaseYear: new Date().getFullYear().toString(),
      accentColor: accentColors[index % accentColors.length]
    };
  });
}

export const songs = loadSongs();

export const genres = [
  "All",
  ...Array.from(new Set(songs.map(s => s.genre)))
];
