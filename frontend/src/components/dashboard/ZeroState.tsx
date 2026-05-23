import { useState } from 'react';
import Link from 'next/link';
import { Plus, Database } from 'lucide-react';
import EmptyAssignmentsIllustration from '@/components/illustrations/EmptyAssignmentsIllustration';
import { assignmentsApi } from '@/lib/api';

export default function ZeroState() {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await assignmentsApi.seed();
      window.location.reload();
    } catch (err) {
      alert('Failed to load demo data. Make sure you don\'t already have assignments.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="zero-state flex flex-col items-center justify-center text-center py-20 px-6 h-full min-h-[400px]">
      {/* SVG Illustration */}
      <div className="mb-6 flex justify-center">
        <EmptyAssignmentsIllustration />
      </div>

      {/* Text */}
      <h2 className="font-bricolage font-bold text-2xl text-[#171717] mb-2 tracking-tight">
        No assignments yet
      </h2>
      <p className="text-[15px] text-[#666666] max-w-sm mb-8 leading-relaxed">
        You haven&apos;t created any assignments yet. Start by creating your first
        AI-generated question paper in seconds.
      </p>

      {/* CTA */}
      <div className="flex flex-col gap-4">
        <Link
          href="/assignments/create"
          className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#171717] text-white text-sm font-bold font-heading no-underline shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Assignment
        </Link>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#F5F5F5] text-[#171717] text-sm font-bold font-heading no-underline border border-[#E5E5E5] transition-colors hover:bg-[#EBEBEB] cursor-pointer disabled:opacity-50"
        >
          <Database size={16} strokeWidth={2.5} />
          {seeding ? 'Loading Data...' : 'Load Demo Data'}
        </button>
      </div>
    </div>
  );
}
