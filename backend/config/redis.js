const Redis = require('ioredis');

let redisClient = null;
let isRedisAvailable = false;

const initRedis = () => {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || 6379;

  try {
    redisClient = new Redis({
      host: host,
      port: Number(port),
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) {
          return null; // Stop retrying after 2 attempts if Redis is offline
        }
        return Math.min(times * 100, 1000);
      },
      lazyConnect: true
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log(`[Redis] Connected to ${host}:${port}`);
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      // Silent warning to prevent log spam when Redis server is offline
    });

    redisClient.connect().catch((err) => {
      isRedisAvailable = false;
      console.log(`[Redis Warning] Local Redis unavailable at ${host}:${port}. Caching will fallback to MongoDB directly.`);
    });
  } catch (err) {
    isRedisAvailable = false;
    console.log('[Redis Error] Failed to initialize Redis client:', err.message);
  }
};

const getCache = async (key) => {
  if (!isRedisAvailable || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 300) => {
  if (!isRedisAvailable || !redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (e) {
    // Ignore cache set errors
  }
};

const delCache = async (patternOrKey) => {
  if (!isRedisAvailable || !redisClient) return;
  try {
    if (patternOrKey.includes('*')) {
      const keys = await redisClient.keys(patternOrKey);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } else {
      await redisClient.del(patternOrKey);
    }
  } catch (e) {
    // Ignore cache clear errors
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  isAvailable: () => isRedisAvailable
};
