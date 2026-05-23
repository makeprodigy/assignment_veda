import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { Result } from '../models/Result';
import { Assignment } from '../models/Assignment';
import { addGenerationJob } from '../queues/generationQueue';
import { getCache, setCache, deleteCache, CACHE_KEYS } from '../services/cacheService';
import { AssignmentInput, QuestionPaper } from '../types/assignment';

interface CachedResult {
  paper: QuestionPaper;
  assignmentId: string;
  userId: string;
  images?: { data: string; mimeType: string }[];
}

// ── Get Result ────────────────────────────────────────────────────────────────

export async function getResult(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { jobId } = req.params;

    // 1. Check Redis cache first
    const cached = await getCache<CachedResult>(CACHE_KEYS.result(jobId));
    if (cached) {
      if (cached.userId !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }
      res.status(200).json({
        success: true,
        data: {
          paper: cached.paper,
          assignmentId: cached.assignmentId,
          images: cached.images,
        },
      });
      return;
    }

    // 2. Cache miss — query MongoDB
    const result = await Result.findOne({ jobId }).lean();

    if (!result) {
      res.status(404).json({ success: false, message: 'Result not found.' });
      return;
    }

    // Check ownership
    if (result.userId.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    // Also fetch assignment for images
    const assignment = await Assignment.findById(result.assignmentId).lean();
    const images = assignment?.images || [];

    // 3. Populate cache for next time
    const payload: CachedResult = {
      paper: result.paper,
      assignmentId: result.assignmentId.toString(),
      userId: result.userId.toString(),
      images,
    };
    await setCache(CACHE_KEYS.result(jobId), payload, 3600);

    res.status(200).json({
      success: true,
      data: {
        paper: result.paper,
        assignmentId: result.assignmentId.toString(),
        images,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch result';
    res.status(500).json({ success: false, message });
  }
}

// ── Regenerate ────────────────────────────────────────────────────────────────

export async function regenerate(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { jobId } = req.params;
    const { assignmentId } = req.body as { assignmentId: string };

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      res.status(400).json({ success: false, message: 'Valid assignmentId is required in request body.' });
      return;
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found.' });
      return;
    }

    // Check ownership
    if (assignment.userId.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    // Generate a new jobId
    const newJobId = uuidv4();

    // Reset assignment status and update jobId
    assignment.status = 'pending';
    assignment.jobId = newJobId;
    assignment.resultId = undefined;
    await assignment.save();

    // Build input from assignment data
    const input: AssignmentInput = {
      subject: assignment.subject,
      topic: assignment.topic,
      className: assignment.className,
      schoolName: assignment.schoolName,
      timeAllowed: assignment.timeAllowed,
      dueDate: assignment.dueDate.toISOString(),
      questionTypes: assignment.questionTypes,
      additionalInfo: assignment.additionalInfo,
      fileContent: assignment.fileContent,
    };

    // Invalidate old result cache
    await deleteCache(CACHE_KEYS.result(jobId));

    // Enqueue new generation job
    await addGenerationJob(newJobId, {
      assignmentId,
      userId: req.user.id,
      input,
    });

    res.status(202).json({
      success: true,
      data: { jobId: newJobId },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to regenerate';
    res.status(500).json({ success: false, message });
  }
}
