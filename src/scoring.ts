import type { IdentityKey, Persona, Question } from "./types";
import { IDENTITY_ORDER, personaKey } from "./data/personas";

export function validateQuestionBank(
  questions: Question[],
  personas: Record<string, Persona>,
): string[] {
  const errors: string[] = [];

  if (questions.length !== 16) {
    errors.push(`Expected 16 questions, received ${questions.length}`);
  }

  const questionIds = new Set<string>();
  for (const question of questions) {
    if (questionIds.has(question.id)) {
      errors.push(`Duplicate question id: ${question.id}`);
    }
    questionIds.add(question.id);

    if (question.options.length !== 4) {
      errors.push(`${question.id} must contain exactly 4 options`);
    }

    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (optionIds.has(option.id)) {
        errors.push(`Duplicate option id in ${question.id}: ${option.id}`);
      }
      optionIds.add(option.id);
    }
  }

  for (const main of IDENTITY_ORDER) {
    for (const secondary of IDENTITY_ORDER) {
      if (main === secondary) continue;
      const key = personaKey(main as IdentityKey, secondary as IdentityKey);
      if (!personas[key]) {
        errors.push(`Missing persona copy for ${key}`);
      }
    }
  }

  return errors;
}
