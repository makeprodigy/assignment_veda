'use client';

import { useRef } from 'react';
import { QuestionTypeConfig } from '@/types';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False',
  'Fill in the Blanks',
];

interface Props {
  config: QuestionTypeConfig;
  index: number;
  diagramFile?: File;
  onUpdate: (index: number, updates: Partial<QuestionTypeConfig>) => void;
  onRemove: (index: number) => void;
  onDiagramUpload?: (index: number, file: File) => void;
  onDiagramRemove?: (index: number) => void;
}

export default function QuestionTypeRow({ config, index, diagramFile, onUpdate, onRemove, onDiagramUpload, onDiagramRemove }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-2.5">
      {/* Type dropdown */}
      <select
        value={config.type}
        onChange={(e) => onUpdate(index, { type: e.target.value })}
        className="form-input form-select m-0 rounded-full"
      >
        {QUESTION_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] flex items-center p-1.5 rounded transition-colors duration-200 hover:bg-red-100"
      >
        <X size={16} />
      </button>

      {/* Count control */}
      <div>
        <div className="counter-control rounded-full">
          <button className="counter-btn w-4 h-4 text-base flex items-center justify-center" onClick={() => onUpdate(index, { count: Math.max(1, config.count - 1) })}>−</button>
          <input
            type="number"
            className="hide-spin-button w-8 text-center border-none outline-none text-[13px] bg-transparent text-[var(--color-text-primary)] font-semibold p-0"
            min="1"
            value={config.count === 0 ? '' : config.count}
            onChange={(e) => {
              if (e.target.value === '') {
                onUpdate(index, { count: 0 });
              } else {
                const parsed = parseInt(e.target.value);
                if (!isNaN(parsed)) onUpdate(index, { count: parsed });
              }
            }}
            onBlur={() => {
              if (!config.count || config.count < 1) onUpdate(index, { count: 1 });
            }}
          />
          <button className="counter-btn w-4 h-4 text-base flex items-center justify-center" onClick={() => onUpdate(index, { count: config.count + 1 })}>+</button>
        </div>
      </div>

      {/* Marks control */}
      <div>
        <div className="counter-control rounded-full">
          <button className="counter-btn w-4 h-4 text-base flex items-center justify-center" onClick={() => onUpdate(index, { marks: Math.max(1, config.marks - 1) })}>−</button>
          <input
            type="number"
            className="hide-spin-button w-8 text-center border-none outline-none text-[13px] bg-transparent text-[var(--color-text-primary)] font-semibold p-0"
            min="1"
            value={config.marks === 0 ? '' : config.marks}
            onChange={(e) => {
              if (e.target.value === '') {
                onUpdate(index, { marks: 0 });
              } else {
                const parsed = parseInt(e.target.value);
                if (!isNaN(parsed)) onUpdate(index, { marks: parsed });
              }
            }}
            onBlur={() => {
              if (!config.marks || config.marks < 1) onUpdate(index, { marks: 1 });
            }}
          />
          <button className="counter-btn w-4 h-4 text-base flex items-center justify-center" onClick={() => onUpdate(index, { marks: config.marks + 1 })}>+</button>
        </div>
      </div>
    </div>
    {config.type === 'Diagram/Graph-Based Questions' && (
      <div className="mt-2 py-2 px-3 bg-[#FAFAFA] rounded-md border border-[var(--color-border-light)] flex items-center justify-between">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0] && onDiagramUpload) {
              onDiagramUpload(index, e.target.files[0]);
            }
          }}
        />
        <div className="flex items-center gap-2">
          <ImageIcon size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-xs text-[var(--color-text-secondary)] font-inter">
            {diagramFile ? diagramFile.name : 'Upload diagram image for this question (optional)'}
          </span>
        </div>
        <div className="flex gap-2">
          {diagramFile && (
            <button 
              onClick={() => onDiagramRemove && onDiagramRemove(index)}
              className="bg-transparent border-none text-[11px] text-red-500 cursor-pointer font-semibold"
            >
              Remove
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 bg-white border border-[var(--color-border)] rounded py-1 px-2 text-[11px] font-semibold cursor-pointer"
          >
            <Upload size={12} />
            {diagramFile ? 'Change' : 'Upload'}
          </button>
        </div>
      </div>
    )}
    </>
  );
}
