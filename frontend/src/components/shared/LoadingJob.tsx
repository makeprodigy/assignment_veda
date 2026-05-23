'use client';

import { useJobStore } from '@/store/jobStore';

export default function LoadingJob() {
  const { progress, message } = useJobStore();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl p-12 max-w-[480px] w-[90%] text-center fade-in">
        <div className="w-14 h-14 border-4 border-[var(--color-border)] border-t-[var(--color-dark)] rounded-full animate-spin mx-auto mb-6" />
        <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)] mb-2">
          Generating your question paper...
        </h2>
        <p className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {progress}%
        </p>
        <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden my-4">
          <div className="h-full bg-[var(--color-dark)] rounded-full transition-[width] duration-500 ease-in-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[var(--color-text-secondary)] font-heading text-sm mt-3">
          {message || 'Connecting to AI...'}
        </p>
        <p className="text-[var(--color-text-muted)] font-heading text-[13px] mt-2">
          This usually takes 10–30 seconds
        </p>
      </div>
    </div>
  );
}
