'use client';

import { Difficulty } from '@/types';

interface Props {
  difficulty: Difficulty;
}

const labels: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  challenging: 'Challenging',
};

export default function DifficultyBadge({ difficulty }: Props) {
  return (
    <span>[{labels[difficulty] ?? difficulty}]</span>
  );
}
