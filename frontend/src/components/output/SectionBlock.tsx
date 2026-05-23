'use client';

import { Section } from '@/types';
import DifficultyBadge from './DifficultyBadge';

interface Props {
  section: Section;
  sectionIndex: number;
  images?: { data: string; mimeType: string }[];
}

export default function SectionBlock({ section, sectionIndex, images }: Props) {
  const sectionLetter = String.fromCharCode(65 + sectionIndex); // A, B, C...

  const parts = section.instruction.split('\n');
  const mainInstruction = parts[0];
  const subInstruction = parts.slice(1).join(' ');

  return (
    <div className="mb-8">
      <div className="font-body text-xl font-semibold text-[var(--color-text-primary)] text-center my-9 mb-6">Section {sectionLetter}</div>

      <div className="mb-6">
        <div className="font-body text-base font-semibold text-[var(--color-text-primary)] mb-1">{mainInstruction}</div>
        {subInstruction && (
          <div className="text-sm italic font-normal text-[var(--color-text-primary)] mb-6">
            {subInstruction}
          </div>
        )}
      </div>

      {/* Render images if this section has diagram questions */}
      {images && images.length > 0 && section.questions.some(q => q.type === 'Diagram/Graph-Based Questions') && (
        <div className="mb-5 flex flex-col gap-4">
          {images.map((img, i) => (
            <img 
              key={i} 
              src={`data:${img.mimeType};base64,${img.data}`} 
              alt="Reference Diagram" 
              className="max-w-full max-h-[400px] object-contain rounded-lg border border-[var(--color-border)]"
            />
          ))}
        </div>
      )}

      <div>
        {section.questions.map((q, idx) => (
          <div key={q.id} className="flex items-start gap-2 mb-4 font-body text-sm text-[var(--color-text-primary)] leading-[1.6]">
            <span className="font-semibold min-w-[28px] shrink-0">{idx + 1}.</span>
            <span className="flex-1">
              <DifficultyBadge difficulty={q.difficulty} />
              {' '}{q.text}
            </span>
            <span className="font-semibold text-[var(--color-text-secondary)] whitespace-nowrap shrink-0">[{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]</span>
          </div>
        ))}
      </div>
    </div>
  );
}
