import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { AssignmentInput, QuestionPaper } from '../types/assignment';

export function buildPrompt(input: AssignmentInput): string {
  const questionTypeSummary = input.questionTypes
    .map(
      (qt) =>
        `  - ${qt.type}: ${qt.count} question(s), ${qt.marks} mark(s) each (total ${qt.count * qt.marks} marks)`
    )
    .join('\n');

  const totalMarks = input.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  let prompt = `You are an expert educational assessment designer.
Generate a complete, structured question paper with the following specifications:

PAPER DETAILS:
- School Name: ${input.schoolName}
- Subject: ${input.subject}
- Topic/Chapter: ${input.topic}
- Class: ${input.className}
- Time Allowed: ${input.timeAllowed}
- Total Marks: ${totalMarks}

QUESTION REQUIREMENTS:
${questionTypeSummary}

DIFFICULTY DISTRIBUTION (apply across all sections):
- 30% Easy questions
- 40% Moderate questions
- 30% Challenging questions

SECTIONS:
Group questions by type into sections named 'Section A', 'Section B', 'Section C', etc. Each section should contain one question type.`;

  if (input.additionalInfo) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${input.additionalInfo}`;
  }

  if (input.fileContent) {
    prompt += `\n\nREFERENCE MATERIAL (use this content to frame questions):\n${input.fileContent}`;
  }

  prompt += `

IMPORTANT: Return ONLY valid JSON — no markdown, no code fences, no explanation. Just the raw JSON object.

The JSON must strictly follow this schema:
{
  "schoolName": "string",
  "subject": "string",
  "className": "string",
  "timeAllowed": "string",
  "totalMarks": number,
  "generalInstruction": "string (e.g. 'All questions are compulsory. Write answers in neat handwriting.')",
  "sections": [
    {
      "title": "Section A",
      "instruction": "string (specific instruction for this section)",
      "questions": [
        {
          "id": "Q1",
          "text": "Full question text here",
          "difficulty": "easy" | "moderate" | "challenging",
          "marks": number,
          "type": "question type string"
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionId": "Q1",
      "answer": "Full answer or key points"
    }
  ]
}

Rules:
- difficulty values MUST be exactly one of: 'easy', 'moderate', 'challenging'
- Each section title must be 'Section A', 'Section B', etc.
- Question IDs must be unique across all sections (Q1, Q2, Q3, ...)
- answerKey must have an entry for every question
- generalInstruction should be comprehensive and appropriate for the subject
- Make questions academically rigorous and appropriate for the class level
- Ensure difficulty distribution is approximately 30% easy, 40% moderate, 30% challenging
- CRITICAL: For 'Multiple Choice Questions', you MUST include 4 distinct options labeled A, B, C, D within the question 'text' field (e.g. "What is 2+2?\\nA) 3\\nB) 4\\nC) 5\\nD) 6"), and indicate the correct option in the answerKey.
- If diagram images are provided, you MUST use them to construct the diagram-based questions.`;

  return prompt;
}

export async function generateQuestionPaper(input: AssignmentInput): Promise<QuestionPaper> {
  let rawText = '';

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const prompt = buildPrompt(input);

    const parts: any[] = [prompt];
    
    if (input.images && input.images.length > 0) {
      input.images.forEach(img => {
        parts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      });
    }

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash'
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[LLM] Attempting generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(parts);
        rawText = result.response.text();

        if (rawText && rawText.trim().length > 0) {
          lastError = null; // Success
          break;
        }
      } catch (err: any) {
        console.warn(`[LLM] Model ${modelName} failed: ${err.message || 'Unknown error'}`);
        lastError = err;
      }
    }

    if (lastError || !rawText || rawText.trim().length === 0) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Empty response'}`);
    }

    // Clean the text: remove markdown code fences if present
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      // Remove opening fence (```json or ```)
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
      // Remove closing fence
      cleaned = cleaned.replace(/```\s*$/, '');
      cleaned = cleaned.trim();
    }

    // Parse JSON
    let parsed: QuestionPaper;
    try {
      parsed = JSON.parse(cleaned) as QuestionPaper;
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON. Raw response: ${cleaned.slice(0, 200)}`);
    }

    // Validate required fields
    if (!parsed.schoolName || typeof parsed.schoolName !== 'string') {
      throw new Error('Invalid response: missing or invalid "schoolName"');
    }
    if (!parsed.subject || typeof parsed.subject !== 'string') {
      throw new Error('Invalid response: missing or invalid "subject"');
    }
    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      throw new Error('Invalid response: "sections" must be a non-empty array');
    }

    // Calculate totalMarks from sections if not provided or zero
    if (!parsed.totalMarks || parsed.totalMarks === 0) {
      parsed.totalMarks = parsed.sections.reduce((sectionSum, section) => {
        const sectionMarks = section.questions.reduce((qSum, q) => qSum + (q.marks || 0), 0);
        return sectionSum + sectionMarks;
      }, 0);
    }

    // Ensure className is present
    if (!parsed.className) {
      parsed.className = input.className;
    }

    // Ensure timeAllowed is present
    if (!parsed.timeAllowed) {
      parsed.timeAllowed = input.timeAllowed;
    }

    // Ensure generalInstruction is present
    if (!parsed.generalInstruction) {
      parsed.generalInstruction = 'All questions are compulsory. Marks are indicated against each question.';
    }

    return parsed;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`[LLM] Question paper generation failed: ${error.message}`);
    }
    throw new Error('[LLM] Question paper generation failed due to an unknown error');
  }
}
