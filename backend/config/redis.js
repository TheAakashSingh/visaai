const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryDelayOnFailover: 100,
    });

    redisClient.on('connect', () => logger.info('✅ Redis connected'));
    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));

    await redisClient.ping();
    return redisClient;
  } catch (err) {
    logger.warn('Redis not available, running without cache:', err.message);
    // Return mock client so app doesn't crash without Redis
    redisClient = {
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      setex: async () => 'OK',
      ping: async () => 'PONG',
    };
    return redisClient;
  }
};

const getRedis = () => redisClient;

module.exports = connectRedis;
module.exports.getRedis = getRedis;
