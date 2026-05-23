'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, RefreshCw, ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import QuestionPaper from '@/components/output/QuestionPaper';
import { resultsApi } from '@/lib/api';
import { usePdfExport } from '@/hooks/usePdfExport';
import { QuestionPaper as QPaperType } from '@/types';
import { useAuthStore } from '@/store/authStore';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const user = useAuthStore((state) => state.user);
  const [paper, setPaper] = useState<QPaperType | null>(null);
  const [images, setImages] = useState<{data: string, mimeType: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { downloadPdf, isDownloading } = usePdfExport();

  useEffect(() => {
    if (!jobId) return;
    const fetchResult = async () => {
      try {
        const res = await resultsApi.get(jobId);
        setPaper(res.data.data.paper);
        setImages(res.data.data.images || []);
      } catch {
        setError('Could not load the question paper. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [jobId]);

  const handleRegenerate = async () => {
    if (!paper) return;
    try {
      await resultsApi.regenerate(jobId, '');
      alert('Regeneration queued! Check back in a moment.');
    } catch {
      alert('Failed to regenerate.');
    }
  };

  if (loading) {
    return (
      <AppLayout title="Assignment Output" backHref="/dashboard">
        <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-[var(--color-border)] border-t-[var(--color-dark)] rounded-full animate-spin mx-auto mb-4" />
            <p className="font-heading text-[var(--color-text-secondary)]">Loading question paper...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !paper) {
    return (
      <AppLayout title="Assignment Output" backHref="/dashboard">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] gap-4">
          <p className="text-red-500 font-heading">{error || 'No paper found.'}</p>
          <button className="sharp-btn-primary rounded-full py-2.5 px-6" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Assignment Output" backHref="/dashboard">
      {/* Mobile Page Header */}
      <div className="flex md:hidden items-center justify-between mb-2 mt-2 relative">
        <button onClick={() => router.back()} className="absolute left-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm cursor-pointer z-10">
          <ArrowLeft size={16} className="text-[#171717]" />
        </button>
        <h1 className="w-full text-center font-heading text-lg font-bold text-[#171717]">Assignment Output</h1>
      </div>

      <div className="min-h-full flex flex-col pb-12">
        {/* Outer Grey Container (Width matches TopBar) */}
        <div className="bg-[#666666] rounded-[32px] p-4 sm:p-6 flex-1 flex flex-col gap-6 shadow-xl w-full">
          
          {/* Dark Banner Box */}
          <div className="bg-[#1F1F1F] rounded-[24px] p-6 shadow-md w-full">
            <p className="text-white font-bricolage font-bold text-[18px] leading-snug tracking-tight">
              Certainly, {user?.name?.split(' ')[0] || 'Teacher'}! Here is your customized Question Paper for {paper.className} {paper.subject} classes on the requested chapters:
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => downloadPdf(jobId)}
                disabled={isDownloading}
                className="px-6 py-2.5 rounded-full font-inter font-semibold text-[13px] transition-colors flex items-center gap-2 bg-white text-[#171717] hover:bg-gray-100 disabled:opacity-50 cursor-pointer border-none shadow-sm w-fit"
              >
                <Download size={16} strokeWidth={2.5} />
                {isDownloading ? 'Downloading...' : 'Download as PDF'}
              </button>

              <button
                onClick={handleRegenerate}
                className="px-6 py-2.5 rounded-full font-inter font-semibold text-[13px] transition-colors flex items-center gap-2 bg-transparent border border-white/20 text-white hover:bg-white/10 cursor-pointer w-fit"
              >
                <RefreshCw size={16} strokeWidth={2.5} />
                Regenerate
              </button>
            </div>
          </div>

          {/* Question Paper (Full Width Style) */}
          <div className="flex justify-center w-full bg-white rounded-[32px] overflow-hidden p-1 sm:p-4 md:p-8">
            <div 
              id="question-paper-content" 
              className="w-full min-h-[1123px] bg-white"
            >
              <QuestionPaper paper={paper} images={images} />
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
