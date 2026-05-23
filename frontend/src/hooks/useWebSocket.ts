'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { wsClient } from '@/lib/websocket';
import { useJobStore } from '@/store/jobStore';

export function useWebSocket(jobId: string | null): void {
  const router = useRouter();
  const { setProgress, setComplete, setFailed } = useJobStore();

  useEffect(() => {
    if (!jobId) return;

    wsClient.connect(
      jobId,
      // onProgress
      (progress, message) => {
        setProgress(progress, message);
      },
      // onComplete
      (resultId) => {
        setComplete(resultId);
        router.push(`/assignments/result/${resultId}`);
      },
      // onFailed
      (error) => {
        setFailed(error);
      },
    );

    return () => {
      wsClient.disconnect();
    };
  }, [jobId, router, setProgress, setComplete, setFailed]);
}
