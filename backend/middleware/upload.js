const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|m4a|ogg|flac|aac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files (mp3, wav, m4a, ogg, flac, aac) are allowed!'), false);
    }
  } else if (file.fieldname === 'cover') {
    if (file.mimetype.startsWith('image/') || file.originalname.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp, svg) are allowed!'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
