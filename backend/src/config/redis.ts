import IORedis from 'ioredis';
import { env } from './env';

export const redisClient = new IORedis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
  tls: env.REDIS_HOST.includes('upstash') ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
  lazyConnect: true,
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err));
