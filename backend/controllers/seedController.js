const Song = require('../models/Song');
const { delCache } = require('../config/redis');

const sampleSongs = [
  {
    title: 'Neon Cyberpunk Dreams',
    artist: 'Aetherwave',
    album: 'Synthwave Odyssey',
    genre: 'Synthwave',
    duration: 215,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    featured: true,
    downloadsCount: 1420,
    playsCount: 4890,
    likesCount: 832,
    releaseYear: '2026',
    accentColor: '#8b5cf6'
  },
  {
    title: 'Midnight Chill Lounge',
    artist: 'Solaris Echo',
    album: 'Lo-Fi Chillbeats',
    genre: 'Lo-Fi',
    duration: 184,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    featured: true,
    downloadsCount: 980,
    playsCount: 3120,
    likesCount: 540,
    releaseYear: '2025',
    accentColor: '#ec4899'
  },
  {
    title: 'Starlight Symphony',
    artist: 'Celestial Orchestra',
    album: 'Cosmic Journeys',
    genre: 'Ambient',
    duration: 240,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    featured: true,
    downloadsCount: 2100,
    playsCount: 8900,
    likesCount: 1450,
    releaseYear: '2026',
    accentColor: '#06b6d4'
  },
  {
    title: 'Hyperdrive Bass Pulse',
    artist: 'Vortex Unit',
    album: 'Electric Horizon',
    genre: 'Electronic',
    duration: 198,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    featured: false,
    downloadsCount: 630,
    playsCount: 1950,
    likesCount: 310,
    releaseYear: '2026',
    accentColor: '#3b82f6'
  },
  {
    title: 'Velvet Sunset Grooves',
    artist: 'Luna Jazz Trio',
    album: 'Smooth Sessions',
    genre: 'Jazz',
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    featured: false,
    downloadsCount: 740,
    playsCount: 2840,
    likesCount: 460,
    releaseYear: '2025',
    accentColor: '#10b981'
  },
  {
    title: 'Acoustic Sunrise Vibes',
    artist: 'Horizon Strings',
    album: 'Unplugged Moments',
    genre: 'Acoustic',
    duration: 175,
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    featured: false,
    downloadsCount: 1150,
    playsCount: 4300,
    likesCount: 680,
    releaseYear: '2026',
    accentColor: '#f97316'
  }
];

const seedDatabase = async (req, res, next) => {
  try {
    const force = req.query.force === 'true';

    if (!force) {
      const existingCount = await Song.countDocuments();
      if (existingCount > 0) {
        return res.status(200).json({
          success: true,
          message: `Database already contains ${existingCount} songs. Pass ?force=true to overwrite.`
        });
      }
    }

    await Song.deleteMany({});
    const inserted = await Song.insertMany(sampleSongs);
    await delCache('songs:*');

    res.status(201).json({
      success: true,
      message: `Successfully seeded database with ${inserted.length} music tracks.`,
      data: inserted
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { seedDatabase };
