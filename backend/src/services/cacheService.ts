import { redisClient } from '../config/redis';

export const CACHE_KEYS = {
  result: (jobId: string): string => `result:${jobId}`,
  assignments: (userId: string): string => `assignments:${userId}`,
};

export async function setCache(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, 'EX', ttlSeconds);
  } catch (error) {
    console.error(`[Cache] Failed to set key "${key}":`, error);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`[Cache] Failed to get key "${key}":`, error);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`[Cache] Failed to delete key "${key}":`, error);
  }
}
