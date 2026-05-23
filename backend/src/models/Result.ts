import mongoose, { Document, Schema } from 'mongoose';
import { QuestionPaper } from '../types/assignment';

export interface IResult extends Document {
  jobId: string;
  assignmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  paper: QuestionPaper;
  createdAt: Date;
}

const questionSchema = new Schema({
  id: String,
  text: String,
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'] },
  marks: Number,
  type: String,
});

const sectionSchema = new Schema({
  title: String,
  instruction: String,
  questions: [questionSchema],
});

const answerKeySchema = new Schema({
  questionId: String,
  answer: String,
});

const resultSchema = new Schema<IResult>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paper: {
      schoolName: String,
      subject: String,
      className: String,
      timeAllowed: String,
      totalMarks: Number,
      generalInstruction: String,
      sections: [sectionSchema],
      answerKey: [answerKeySchema],
    },
  },
  { timestamps: true }
);

export const Result = mongoose.model<IResult>('Result', resultSchema);
