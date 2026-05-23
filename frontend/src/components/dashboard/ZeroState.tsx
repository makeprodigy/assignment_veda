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
      <h2 className="font-heading font-bold text-[16px] text-[#111827] mb-2 tracking-tight">
        No assignments yet
      </h2>
      <p className="text-[13px] font-body text-[#6B7280] font-normal max-w-[400px] mb-6 leading-relaxed">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <Link
          href="/assignments/create"
          className="inline-flex items-center justify-center gap-2 w-[280px] h-[48px] rounded-full bg-[#111111] text-white text-[14px] font-bold font-heading no-underline shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create Your First Assignment
        </Link>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center justify-center gap-2 w-[280px] h-[48px] rounded-full bg-[#F5F5F5] text-[#171717] text-[14px] font-bold font-heading no-underline border border-[#E5E5E5] transition-colors hover:bg-[#EBEBEB] cursor-pointer disabled:opacity-50"
        >
          <Database size={16} strokeWidth={2.5} />
          {seeding ? 'Loading Data...' : 'Load Demo Data'}
        </button>
      </div>
    </div>
  );
}
