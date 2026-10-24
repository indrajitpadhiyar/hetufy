const express = require('express');
const router = express.Router();
const { syncDrive, listDriveFiles, streamAudio, streamCover } = require('../controllers/driveController');

router.post('/sync', syncDrive);
router.get('/files', listDriveFiles);
router.get('/stream/:fileId', streamAudio);
router.get('/cover/:fileId', streamCover);

module.exports = router;
