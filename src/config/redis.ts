import { Redis } from 'ioredis';
import { logger } from './logger.js';
import { env } from './constants.js';

const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl);

redisClient.on('connect', () => logger.info('Redis Connected!'));
redisClient.on('error', (err) => logger.error(`Redis Client Error: ${err}`));
