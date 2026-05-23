import { create } from 'zustand';
import type { JobStatus } from '@/types';

interface JobState {
  jobId: string | null;
  status: JobStatus;
  progress: number;
  message: string;
  resultId: string | null;
  error: string | null;

  setJob: (jobId: string) => void;
  setProgress: (progress: number, message: string) => void;
  setComplete: (resultId: string) => void;
  setFailed: (error: string) => void;
  reset: () => void;
}

const initialState = {
  jobId: null,
  status: 'pending' as JobStatus,
  progress: 0,
  message: '',
  resultId: null,
  error: null,
};

export const useJobStore = create<JobState>((set) => ({
  ...initialState,

  setJob: (jobId) =>
    set({ jobId, status: 'pending', progress: 0, message: '', resultId: null, error: null }),

  setProgress: (progress, message) =>
    set({ status: 'processing', progress, message }),

  setComplete: (resultId) =>
    set({ status: 'completed', progress: 100, resultId, error: null }),

  setFailed: (error) =>
    set({ status: 'failed', error }),

  reset: () => set({ ...initialState }),
}));
