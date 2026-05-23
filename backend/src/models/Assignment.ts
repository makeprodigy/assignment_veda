import mongoose, { Document, Schema } from 'mongoose';
import { QuestionTypeConfig } from '../types/assignment';

export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  topic: string;
  className: string;
  schoolName: string;
  timeAllowed: string;
  dueDate: Date;
  questionTypes: QuestionTypeConfig[];
  additionalInfo?: string;
  fileContent?: string;
  images?: { data: string; mimeType: string }[];
  jobId?: string;
  resultId?: mongoose.Types.ObjectId;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const questionTypeConfigSchema = new Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const assignmentSchema = new Schema<IAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    className: { type: String, required: true },
    schoolName: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [questionTypeConfigSchema], required: true },
    additionalInfo: { type: String, default: '' },
    fileContent: { type: String, default: '' },
    images: [{
      data: { type: String, required: true },
      mimeType: { type: String, required: true },
    }],
    jobId: { type: String },
    resultId: { type: Schema.Types.ObjectId, ref: 'Result' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
