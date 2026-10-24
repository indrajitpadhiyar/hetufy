const Song = require('../models/Song');
const { getCache, setCache, delCache } = require('../config/redis');
const { uploadToSupabase, deleteFromSupabase, BUCKET_AUDIO, BUCKET_COVERS } = require('../config/supabase');

// @desc    Get all songs with filtering, searching, and Redis caching
// @route   GET /api/songs
// @access  Public
const getSongs = async (req, res, next) => {
  try {
    const { genre, search, sort, page = 1, limit = 50 } = req.query;

    const cacheKey = `songs:list:g_${genre || 'all'}_s_${search || ''}_srt_${sort || 'new'}_p_${page}_l_${limit}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ success: true, fromCache: true, ...cachedData });
    }

    let query = {};

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') sortOptions = { playsCount: -1 };
    if (sort === 'downloads') sortOptions = { downloadsCount: -1 };
    if (sort === 'title') sortOptions = { title: 1 };

    let songs = [];
    let total = 0;
    const isMongoConnected = require('mongoose').connection.readyState === 1;

    if (isMongoConnected) {
      try {
        songs = await Song.find(query).sort(sortOptions).skip(skip).limit(Number(limit));
        total = await Song.countDocuments(query);
      } catch (e) {}
    }

    if (songs.length === 0) {
      const { syncGoogleDriveSongs } = require('../services/googleDriveService');
      const driveResult = await syncGoogleDriveSongs(`${req.protocol}://${req.get('host')}`);
      songs = driveResult.songs || [];
      total = songs.length;
    }

    const responsePayload = {
      count: songs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: songs
    };

    await setCache(cacheKey, responsePayload, 180);

    res.status(200).json({ success: true, fromCache: false, ...responsePayload });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured songs
// @route   GET /api/songs/featured
// @access  Public
const getFeaturedSongs = async (req, res, next) => {
  try {
    const cacheKey = 'songs:featured';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, fromCache: true, data: cached });
    }

    let songs = await Song.find({ featured: true }).limit(10);
    if (songs.length === 0) {
      songs = await Song.find().sort({ downloadsCount: -1 }).limit(6);
    }

    await setCache(cacheKey, songs, 300);
    res.status(200).json({ success: true, fromCache: false, data: songs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of unique genres
// @route   GET /api/songs/genres
// @access  Public
const getGenres = async (req, res, next) => {
  try {
    const cacheKey = 'songs:genres';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, fromCache: true, data: cached });
    }

    const distinctGenres = await Song.distinct('genre');
    const genres = ['All', ...distinctGenres.filter(Boolean)];

    await setCache(cacheKey, genres, 600);
    res.status(200).json({ success: true, fromCache: false, data: genres });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single song by ID
// @route   GET /api/songs/:id
// @access  Public
const getSongById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `song:detail:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, fromCache: true, data: cached });
    }

    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    await setCache(cacheKey, song, 300);
    res.status(200).json({ success: true, fromCache: false, data: song });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new song & cover to Supabase Storage and create Mongo entry
// @route   POST /api/songs
// @access  Public (or Protected)
const createSong = async (req, res, next) => {
  try {
    const { title, artist, album, genre, duration, featured, accentColor, releaseYear } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ success: false, message: 'Title and Artist are required' });
    }

    let audioUrl = req.body.audioUrl;
    let coverUrl = req.body.coverUrl;
    let supabasePath = '';
    let supabaseCoverPath = '';

    const timestamp = Date.now();
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Upload audio file if present in files
    if (req.files && req.files.audio && req.files.audio[0]) {
      const audioFile = req.files.audio[0];
      const ext = audioFile.originalname.split('.').pop();
      const filePath = `audio_${timestamp}_${cleanTitle}.${ext}`;

      const uploaded = await uploadToSupabase(BUCKET_AUDIO, filePath, audioFile.buffer, audioFile.mimetype);
      audioUrl = uploaded.publicUrl;
      supabasePath = uploaded.path;
    }

    // Upload cover image if present in files
    if (req.files && req.files.cover && req.files.cover[0]) {
      const coverFile = req.files.cover[0];
      const ext = coverFile.originalname.split('.').pop();
      const filePath = `cover_${timestamp}_${cleanTitle}.${ext}`;

      const uploaded = await uploadToSupabase(BUCKET_COVERS, filePath, coverFile.buffer, coverFile.mimetype);
      coverUrl = uploaded.publicUrl;
      supabaseCoverPath = uploaded.path;
    }

    if (!audioUrl) {
      return res.status(400).json({ success: false, message: 'Audio file or audioUrl is required' });
    }

    if (!coverUrl) {
      coverUrl = `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400`;
    }

    const song = await Song.create({
      title,
      artist,
      album: album || 'Single Library',
      genre: genre || 'Pop',
      duration: duration ? Number(duration) : 180,
      audioUrl,
      coverUrl,
      supabasePath,
      supabaseCoverPath,
      featured: featured === 'true' || featured === true,
      accentColor: accentColor || '#8b5cf6',
      releaseYear: releaseYear || new Date().getFullYear().toString()
    });

    await delCache('songs:*');

    res.status(201).json({ success: true, data: song });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment play count
// @route   POST /api/songs/:id/play
// @access  Public
const incrementPlay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await Song.findByIdAndUpdate(
      id,
      { $inc: { playsCount: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    await delCache(`song:detail:${id}`);
    await delCache('songs:list:*');

    res.status(200).json({ success: true, playsCount: song.playsCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Track download and return download stream/url
// @route   GET /api/songs/:id/download
// @access  Public
const trackDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await Song.findByIdAndUpdate(
      id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    await delCache(`song:detail:${id}`);
    await delCache('songs:list:*');

    res.status(200).json({
      success: true,
      title: song.title,
      downloadUrl: song.audioUrl,
      downloadsCount: song.downloadsCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle track like / favorite
// @route   POST /api/songs/:id/like
// @access  Public
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    const incValue = action === 'unlike' ? -1 : 1;

    const song = await Song.findByIdAndUpdate(
      id,
      { $inc: { likesCount: incValue } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    await delCache(`song:detail:${id}`);

    res.status(200).json({ success: true, likesCount: song.likesCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete song from Mongo and Supabase
// @route   DELETE /api/songs/:id
// @access  Public (or Admin)
const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    if (song.supabasePath) {
      await deleteFromSupabase(BUCKET_AUDIO, song.supabasePath);
    }
    if (song.supabaseCoverPath) {
      await deleteFromSupabase(BUCKET_COVERS, song.supabaseCoverPath);
    }

    await song.deleteOne();
    await delCache('songs:*');

    res.status(200).json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSongs,
  getFeaturedSongs,
  getGenres,
  getSongById,
  createSong,
  incrementPlay,
  trackDownload,
  toggleLike,
  deleteSong
};
