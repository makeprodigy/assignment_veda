import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// ── Schemas ──────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['teacher', 'student']).default('teacher'),
  schoolName: z.string().optional(),
  schoolLocation: z.string().optional(),
});

export const assignmentSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  className: z.string().min(1, 'Class name is required'),
  schoolName: z.string().min(1, 'School name is required'),
  timeAllowed: z.string().min(1, 'Time allowed is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    },
    z.array(
      z.object({
        type: z.string().min(1, 'Question type is required'),
        count: z.number().int().min(1, 'Count must be at least 1'),
        marks: z.number().min(1, 'Marks must be at least 1'),
      })
    ).min(1, 'At least one question type is required')
  ),
  additionalInfo: z.string().optional(),
});

// ── Middleware Factory ────────────────────────────────────────────────────────

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Replace req.body with parsed (and coerced) data
    req.body = result.data;
    next();
  };
}
