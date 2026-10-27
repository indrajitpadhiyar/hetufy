const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, getMe, updatePlayback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/playback', protect, updatePlayback);

module.exports = router;
