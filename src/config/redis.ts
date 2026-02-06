import { Redis } from 'ioredis';
import { logger } from './logger.js';

export const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
});

logger.info('Redis Connected!');
