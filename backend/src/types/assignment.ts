export type Difficulty = 'easy' | 'moderate' | 'challenging';
export type QuestionType =
  | 'Multiple Choice Questions'
  | 'Short Questions'
  | 'Long Questions'
  | 'Diagram/Graph-Based Questions'
  | 'Numerical Problems'
  | 'True/False'
  | 'Fill in the Blanks'
  | string;

export interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface AssignmentImage {
  data: string;
  mimeType: string;
}

export interface AssignmentInput {
  subject: string;
  topic: string;
  className: string;
  schoolName: string;
  timeAllowed: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInfo?: string;
  fileContent?: string;
  images?: AssignmentImage[];
}

export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface QuestionPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  totalMarks: number;
  generalInstruction: string;
  sections: Section[];
  answerKey?: { questionId: string; answer: string }[];
}

export interface GenerationJob {
  assignmentId: string;
  userId: string;
  input: AssignmentInput;
}
