const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
      index: true
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      index: true
    },
    album: {
      type: String,
      default: 'Single Library',
      trim: true
    },
    genre: {
      type: String,
      default: 'Pop',
      trim: true,
      index: true
    },
    duration: {
      type: Number,
      default: 180 // seconds
    },
    coverUrl: {
      type: String,
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    },
    supabasePath: {
      type: String,
      default: ''
    },
    supabaseCoverPath: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    downloadsCount: {
      type: Number,
      default: 0
    },
    playsCount: {
      type: Number,
      default: 0
    },
    likesCount: {
      type: Number,
      default: 0
    },
    releaseYear: {
      type: String,
      default: () => new Date().getFullYear().toString()
    },
    accentColor: {
      type: String,
      default: '#8b5cf6'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Search index on title, artist, album, genre
songSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

module.exports = mongoose.model('Song', songSchema);
