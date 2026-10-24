const { syncGoogleDriveSongs, getFileStream, getFileMetadata, listAudioFilesFromDrive } = require('../services/googleDriveService');

// @desc    Sync Google Drive songs into MongoDB
// @route   POST /api/drive/sync
// @access  Public
const syncDrive = async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await syncGoogleDriveSongs(baseUrl);
    res.status(200).json({
      success: true,
      message: `Synced ${result.count} tracks from Google Drive`,
      data: result.songs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List raw files from Google Drive
// @route   GET /api/drive/files
// @access  Public
const listDriveFiles = async (req, res, next) => {
  try {
    const files = await listAudioFilesFromDrive();
    res.status(200).json({ success: true, count: files.length, data: files });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream audio file from Google Drive with HTTP Range support
// @route   GET /api/drive/stream/:fileId
// @access  Public
const streamAudio = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const metadata = await getFileMetadata(fileId);
    const fileSize = Number(metadata.size || 0);
    const contentType = metadata.mimeType || 'audio/mpeg';

    const range = req.headers.range;

    if (range && fileSize > 0) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });

      const driveStream = await getFileStream(fileId, { range: `bytes=${start}-${end}` });
      driveStream.data.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize > 0 ? fileSize : undefined,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });

      const driveStream = await getFileStream(fileId);
      driveStream.data.pipe(res);
    }
  } catch (error) {
    console.error(`[Drive Stream Error] fileId ${req.params.fileId}:`, error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to stream audio file from Google Drive' });
    }
  }
};

// @desc    Stream image/cover file from Google Drive
// @route   GET /api/drive/cover/:fileId
// @access  Public
const streamCover = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const metadata = await getFileMetadata(fileId);
    const contentType = metadata.mimeType || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const driveStream = await getFileStream(fileId);
    driveStream.data.pipe(res);
  } catch (error) {
    res.status(404).json({ success: false, message: 'Cover image not found' });
  }
};

module.exports = {
  syncDrive,
  listDriveFiles,
  streamAudio,
  streamCover
};
