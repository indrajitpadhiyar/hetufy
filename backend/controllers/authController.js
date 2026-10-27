const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'musicdownload_super_secret_jwt_key_2026', {
    expiresIn: '365d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily offline: MongoDB is not connected.'
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        lastPlayback: user.lastPlayback || null,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily offline: MongoDB is not connected.'
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        favorites: user.favorites,
        lastPlayback: user.lastPlayback || null,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate with Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { credential, userInfo } = req.body;
    let googleId = null;
    let email = null;
    let name = null;
    let picture = null;

    if (credential) {
      try {
        const { OAuth2Client } = require('google-auth-library');
        const googleClient = new OAuth2Client(
          process.env.GOOGLE_CLIENT_ID || '790084538586-3o50je01gljgob517g7va3btu0588ls9.apps.googleusercontent.com'
        );
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID || '790084538586-3o50je01gljgob517g7va3btu0588ls9.apps.googleusercontent.com'
        });
        const payload = ticket.getPayload();
        googleId = payload.sub;
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
      } catch (verifyErr) {
        console.warn('Google token verification fallback:', verifyErr.message);
        if (userInfo && userInfo.email) {
          googleId = userInfo.sub || userInfo.id;
          email = userInfo.email;
          name = userInfo.name;
          picture = userInfo.picture || userInfo.avatar;
        } else {
          return res.status(400).json({ success: false, message: 'Invalid Google credential' });
        }
      }
    } else if (userInfo && userInfo.email) {
      googleId = userInfo.sub || userInfo.id;
      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture || userInfo.avatar;
    } else {
      return res.status(400).json({ success: false, message: 'Google credential or user info required' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not provided by Google account' });
    }

    const isMongoConnected = require('mongoose').connection.readyState === 1;
    if (!isMongoConnected) {
      return res.status(200).json({
        success: true,
        data: {
          _id: googleId || `google_${Date.now()}`,
          name: name || email.split('@')[0],
          email,
          avatar: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          role: 'user',
          isGoogleAuth: true,
          favorites: [],
          lastPlayback: null,
          token: generateToken(googleId || email)
        }
      });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId && googleId) user.googleId = googleId;
      if (picture && (!user.avatar || user.avatar.includes('unsplash') || user.avatar.includes('dicebear'))) {
        user.avatar = picture;
      }
      user.isGoogleAuth = true;
      await user.save();
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatar: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        isGoogleAuth: true,
        role: 'user'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isGoogleAuth: true,
        favorites: user.favorites || [],
        lastPlayback: user.lastPlayback || null,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user's last playback track and timestamp
// @route   PUT /api/auth/playback
// @access  Private
const updatePlayback = async (req, res, next) => {
  try {
    const { songId, currentTime, wasPlaying } = req.body;
    if (require('mongoose').connection.readyState === 1 && req.user) {
      req.user.lastPlayback = {
        songId: songId ? String(songId) : null,
        currentTime: Number(currentTime) || 0,
        wasPlaying: Boolean(wasPlaying),
        updatedAt: new Date()
      };
      await req.user.save();
    }
    res.status(200).json({
      success: true,
      data: req.user?.lastPlayback || { songId, currentTime, wasPlaying, updatedAt: new Date() }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  updatePlayback
};
