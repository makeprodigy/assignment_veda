export type Difficulty = 'easy' | 'moderate' | 'challenging';
export type UserRole = 'teacher' | 'student';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolName?: string;
  schoolLocation?: string;
  avatarUrl?: string;
}

export interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
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
}

export interface Assignment {
  _id: string;
  subject: string;
  topic: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  jobId?: string;
  status: JobStatus;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: string;
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

export interface JobProgress {
  progress: number;
  message: string;
}
