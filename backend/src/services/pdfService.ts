import PDFDocument from 'pdfkit';
import type { Writable } from 'stream';
import { QuestionPaper, Difficulty } from '../types/assignment';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '[Easy]',
  moderate: '[Moderate]',
  challenging: '[Challenging]',
};

export function generatePDF(paper: QuestionPaper, stream: Writable): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      doc.pipe(stream);
      doc.on('end', () => resolve());
      doc.on('error', reject);

      const pageWidth = doc.page.width - 100; // account for margins

      // ── Header ─────────────────────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(paper.schoolName, { align: 'center', width: pageWidth });

      doc.moveDown(0.4);

      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(`${paper.subject}  |  Class: ${paper.className}`, { align: 'center', width: pageWidth });

      doc.moveDown(0.4);

      doc
        .font('Helvetica')
        .fontSize(12)
        .text(`Time Allowed: ${paper.timeAllowed}   |   Total Marks: ${paper.totalMarks}`, {
          align: 'center',
          width: pageWidth,
        });

      doc.moveDown(0.6);

      // Divider line
      const lineY = doc.y;
      doc
        .moveTo(50, lineY)
        .lineTo(doc.page.width - 50, lineY)
        .lineWidth(1.5)
        .stroke();

      doc.moveDown(0.6);

      // ── General Instructions ────────────────────────────────────────────────
      doc
        .font('Helvetica-Oblique')
        .fontSize(11)
        .text(`General Instructions: ${paper.generalInstruction}`, {
          align: 'left',
          width: pageWidth,
        });

      doc.moveDown(0.8);

      // ── Student Info Section ────────────────────────────────────────────────
      const infoFields = ['Name', 'Roll Number', 'Class & Section'];
      for (const field of infoFields) {
        doc
          .font('Helvetica')
          .fontSize(11)
          .text(`${field}: `, { continued: true })
          .font('Helvetica')
          .text('__________________________________________________', {
            underline: true,
          });
        doc.moveDown(0.3);
      }

      doc.moveDown(0.8);

      // Second divider line
      const lineY2 = doc.y;
      doc
        .moveTo(50, lineY2)
        .lineTo(doc.page.width - 50, lineY2)
        .lineWidth(0.5)
        .stroke();

      doc.moveDown(0.8);

      // ── Sections ────────────────────────────────────────────────────────────
      let questionCounter = 1;

      for (const section of paper.sections) {
        // Section title
        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .text(section.title, { align: 'left', width: pageWidth });

        doc.moveDown(0.3);

        // Section instruction
        if (section.instruction) {
          doc
            .font('Helvetica-Oblique')
            .fontSize(11)
            .text(section.instruction, { align: 'left', width: pageWidth });
          doc.moveDown(0.4);
        }

        // Questions
        for (const question of section.questions) {
          const difficultyLabel =
            DIFFICULTY_LABELS[question.difficulty as Difficulty] ??
            `[${question.difficulty}]`;

          const questionLine = `${questionCounter}. ${question.text}`;

          // Check if we need a new page
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }

          doc
            .font('Helvetica')
            .fontSize(11)
            .text(questionLine, {
              align: 'left',
              width: pageWidth - 80,
              continued: true,
            });

          // Marks and difficulty tag — right aligned on the same line
          doc
            .font('Helvetica')
            .fontSize(10)
            .text(`  ${difficultyLabel}  [${question.marks} mark${question.marks > 1 ? 's' : ''}]`, {
              align: 'right',
              width: 80,
            });

          doc.moveDown(0.5);
          questionCounter++;
        }

        doc.moveDown(0.8);
      }

      // ── Footer ──────────────────────────────────────────────────────────────
      // Add a page break only if near the bottom
      if (doc.y > doc.page.height - 80) {
        doc.addPage();
      }

      doc.moveDown(1);

      const footerY = doc.page.height - 60;
      doc
        .font('Helvetica-Oblique')
        .fontSize(11)
        .text('— End of Question Paper —', 50, footerY, {
          align: 'center',
          width: pageWidth,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
