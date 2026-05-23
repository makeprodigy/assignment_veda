import { create } from 'zustand';
import type { QuestionTypeConfig } from '@/types';

interface AssignmentFormState {
  subject: string;
  topic: string;
  className: string;
  schoolName: string;
  timeAllowed: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInfo: string;
  uploadedFile: File | null;
  uploadedFileName: string;
  diagramFiles: { index: number; file: File }[];
  currentStep: number;

  // Actions
  setField: (key: keyof Omit<AssignmentFormState, 'questionTypes' | 'uploadedFile' | 'currentStep' | 'setField' | 'addQuestionType' | 'updateQuestionType' | 'removeQuestionType' | 'setFile' | 'setDiagramFile' | 'removeDiagramFile' | 'nextStep' | 'prevStep' | 'reset' | 'totalQuestions' | 'totalMarks' | 'diagramFiles'>, value: string) => void;
  addQuestionType: () => void;
  updateQuestionType: (index: number, updates: Partial<QuestionTypeConfig>) => void;
  removeQuestionType: (index: number) => void;
  setFile: (file: File) => void;
  setDiagramFile: (index: number, file: File) => void;
  removeDiagramFile: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;

  // Computed (derived helpers)
  totalQuestions: () => number;
  totalMarks: () => number;
}

const defaultQuestionTypes: QuestionTypeConfig[] = [
  { type: 'Multiple Choice Questions', count: 4, marks: 1 },
];

const initialState = {
  subject: '',
  topic: '',
  className: '',
  schoolName: '',
  timeAllowed: '',
  dueDate: '',
  questionTypes: defaultQuestionTypes,
  additionalInfo: '',
  uploadedFile: null,
  uploadedFileName: '',
  diagramFiles: [],
  currentStep: 1,
};

export const useAssignmentStore = create<AssignmentFormState>((set, get) => ({
  ...initialState,

  setField: (key, value) => set({ [key]: value } as Partial<AssignmentFormState>),

  addQuestionType: () =>
    set((state) => ({
      questionTypes: [
        ...state.questionTypes,
        { type: 'Short Questions', count: 4, marks: 2 },
      ],
    })),

  updateQuestionType: (index, updates) =>
    set((state) => {
      const updated = [...state.questionTypes];
      updated[index] = { ...updated[index], ...updates };
      return { questionTypes: updated };
    }),

  removeQuestionType: (index) =>
    set((state) => ({
      questionTypes: state.questionTypes.filter((_, i) => i !== index),
      diagramFiles: state.diagramFiles.filter(d => d.index !== index).map(d => d.index > index ? { ...d, index: d.index - 1 } : d),
    })),

  setFile: (file) =>
    set({ uploadedFile: file, uploadedFileName: file.name }),

  setDiagramFile: (index, file) =>
    set((state) => {
      const existing = state.diagramFiles.findIndex(d => d.index === index);
      if (existing >= 0) {
        const updated = [...state.diagramFiles];
        updated[existing] = { index, file };
        return { diagramFiles: updated };
      }
      return { diagramFiles: [...state.diagramFiles, { index, file }] };
    }),

  removeDiagramFile: (index) =>
    set((state) => ({
      diagramFiles: state.diagramFiles.filter(d => d.index !== index)
    })),

  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 2) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  reset: () => set({ ...initialState, questionTypes: [...defaultQuestionTypes] }),

  totalQuestions: () =>
    get().questionTypes.reduce((sum, qt) => sum + qt.count, 0),

  totalMarks: () =>
    get().questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0),
}));
