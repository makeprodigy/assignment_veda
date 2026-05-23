import { Queue } from 'bullmq';
import { redisClient } from '../config/redis';
import { GenerationJob } from '../types/assignment';

export const generationQueue = new Queue<GenerationJob>('generation', {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export async function addGenerationJob(jobId: string, data: GenerationJob): Promise<void> {
  await generationQueue.add('generate', data, {
    jobId,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}
