const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getSongs,
  getFeaturedSongs,
  getGenres,
  getSongById,
  createSong,
  incrementPlay,
  trackDownload,
  toggleLike,
  deleteSong
} = require('../controllers/songController');

router.get('/', getSongs);
router.get('/featured', getFeaturedSongs);
router.get('/genres', getGenres);
router.get('/:id', getSongById);

router.post(
  '/',
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  createSong
);

router.post('/:id/play', incrementPlay);
router.get('/:id/download', trackDownload);
router.post('/:id/like', toggleLike);
router.delete('/:id', deleteSong);

module.exports = router;
