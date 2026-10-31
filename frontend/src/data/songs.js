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

export function loadSongs() {
  const filePaths = Object.keys(audioFiles);
  
  if (filePaths.length === 0) {
    return [];
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
  "Drive Music",
  "Pop",
  "Romantic",
  "Punjabi"
];
