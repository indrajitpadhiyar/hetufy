const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: function() { return !this.googleId; },
      minlength: 6,
      select: false
    },
    googleId: {
      type: String,
      sparse: true
    },
    isGoogleAuth: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
      }
    ],
    lastPlayback: {
      songId: {
        type: String,
        default: null
      },
      currentTime: {
        type: Number,
        default: 0
      },
      wasPlaying: {
        type: Boolean,
        default: false
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
