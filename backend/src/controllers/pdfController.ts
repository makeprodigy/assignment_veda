import { Request, Response } from 'express';
import { Result } from '../models/Result';
import { generatePDF } from '../services/pdfService';

export async function downloadPDF(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { jobId } = req.params;

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

    const safeName = `question-paper-${jobId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

    await generatePDF(result.paper, res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate PDF';
    res.status(500).json({ success: false, message });
  }
}
