import IORedis from 'ioredis';
import { env } from './env';

export const redisClient = new IORedis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  maxRetriesPerRequest: null, // Required for BullMQ
  lazyConnect: true,
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err));
