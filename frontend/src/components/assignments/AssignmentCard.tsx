import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onView: (a: Assignment) => void;
  onDelete?: (id: string) => void;
}

export default function AssignmentCard({ assignment, onView, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div 
      className="assignment-card flex flex-col justify-between h-full" 
      onClick={() => onView(assignment)}
    >
      <div className="flex justify-between items-start">
        <h2 className="font-heading font-bold text-[#171717] text-[18px] leading-tight">
          {assignment.topic || assignment.subject}
        </h2>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="bg-transparent border-none cursor-pointer p-1 text-[#BFBFBF] hover:text-[#737373] transition-colors rounded-md hover:bg-[#F5F5F5]"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-[110%] bg-white rounded-xl border border-[#EAEAEA] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 min-w-[170px] overflow-hidden py-1">
              <button
                onClick={(e) => { e.stopPropagation(); onView(assignment); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 bg-transparent border-none font-body text-[12px] font-medium cursor-pointer hover:bg-[#F8F8F8] transition-colors text-[#171717]"
              >
                View Assignment
              </button>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(assignment._id); setMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 bg-transparent border-none font-body text-[12px] font-medium text-[#D84315] cursor-pointer hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mt-5">
          <span className="font-body text-[13px] text-[#8A8A8A]">
            <strong className="font-semibold text-[#4A4A4A]">Assigned on</strong> : {format(new Date(assignment.createdAt), 'dd-MM-yyyy')}
          </span>
          {assignment.dueDate && (
            <span className="font-body text-[13px] text-[#8A8A8A]">
              <strong className="font-semibold text-[#4A4A4A]">Due</strong> : {format(new Date(assignment.dueDate), 'dd-MM-yyyy')}
            </span>
          )}
        </div>
        {assignment.status === 'processing' && (
          <div className="mt-3 text-xs text-[var(--color-orange)] font-heading font-semibold">
            ⏳ Generating...
          </div>
        )}
      </div>
    </div>
  );
}
