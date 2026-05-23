'use client';

import { QuestionPaper as QPaperType } from '@/types';
import SectionBlock from './SectionBlock';

interface Props {
  paper: QPaperType;
  images?: { data: string; mimeType: string }[];
}

export default function QuestionPaper({ paper, images }: Props) {
  return (
    <div className="bg-white p-4 sm:p-8 md:p-12">
      {/* School Header */}
      <div className="text-center mb-8">
        <div className="font-body text-2xl font-bold text-[var(--color-text-primary)]">{paper.schoolName}</div>
        <div className="font-body text-lg font-semibold text-[var(--color-text-primary)] mt-1">
          Subject: {paper.subject}
        </div>
        <div className="font-body text-lg font-semibold text-[var(--color-text-primary)]">
          Class: {paper.className}
        </div>
      </div>

      {/* Time + Marks */}
      <div className="flex justify-between font-body text-base font-semibold text-[var(--color-text-primary)] my-2">
        <span>Time Allowed: {paper.timeAllowed}</span>
        <span>Maximum Marks: {paper.totalMarks}</span>
      </div>

      {/* General Instruction */}
      <div className="font-body text-base font-semibold text-[var(--color-text-primary)] my-6">
        {paper.generalInstruction}
      </div>

      {/* Student Info */}
      <div className="flex flex-col gap-3 my-6 mb-8">
        <div className="font-body text-base font-semibold text-[var(--color-text-primary)]">Name: ______________________</div>
        <div className="font-body text-base font-semibold text-[var(--color-text-primary)]">Roll Number: ______________________</div>
        <div className="font-body text-base font-semibold text-[var(--color-text-primary)]">Class: {paper.className} Section: ______________________</div>
      </div>

      {/* Sections */}
      {paper.sections.map((section, idx) => (
        <SectionBlock key={idx} section={section} sectionIndex={idx} images={images} />
      ))}

      {/* Footer */}
      <div className="text-center font-body italic text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-5 mt-6">
        End of Question Paper
      </div>

      {/* Answer Key (if present) */}
      {paper.answerKey && paper.answerKey.length > 0 && (
        <div className="mt-8 border-t-2 border-dashed border-[var(--color-border-light)] pt-6">
          <div className="font-heading text-lg font-bold mb-4">Answer Key:</div>
          <ol className="pl-5">
            {paper.answerKey.map((ak, idx) => (
              <li key={ak.questionId} className="font-body text-sm text-[var(--color-text-secondary)] mb-2 leading-[1.6]">
                {ak.answer}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
