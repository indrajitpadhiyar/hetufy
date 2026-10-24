const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isAvailable } = require('../config/redis');
const { supabase } = require('../config/supabase');

router.get('/', async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = isAvailable() ? 'connected' : 'unavailable (bypassed)';

  let supabaseStatus = 'unknown';
  try {
    const { data, error } = await supabase.storage.listBuckets();
    supabaseStatus = error ? `error (${error.message})` : 'connected';
  } catch (e) {
    supabaseStatus = `error (${e.message})`;
  }

  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
      supabase: supabaseStatus
    }
  });
});

module.exports = router;
