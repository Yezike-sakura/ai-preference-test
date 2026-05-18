import type { DimensionDefinition, DimensionKey, Persona, PersonaKey, Question } from "./types";
import { DIMENSIONS, EXPECTED_PERSONA_KEYS } from "./data/personas";

const EXPECTED_OPTION_IDS = ["a", "b", "c", "d"];
const EXPECTED_DIMENSION_KEYS: DimensionKey[] = ["agency", "tempo", "output", "risk"];

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function validateWeightMap(
  weights: Record<string, number | undefined>,
  label: string,
): string[] {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(weights)) {
    if (!Number.isFinite(value)) {
      errors.push(`${label} ${key} must be a finite number`);
    }
  }

  return errors;
}

export function validateDimensions(dimensions: DimensionDefinition[]): string[] {
  const errors: string[] = [];

  if (dimensions.length !== 4) {
    errors.push(`Expected 4 dimensions, received ${dimensions.length}`);
  }

  const dimensionKeys = new Set<DimensionKey>();
  for (const dimension of dimensions) {
    if (dimensionKeys.has(dimension.key)) {
      errors.push(`Duplicate dimension key: ${dimension.key}`);
    }
    dimensionKeys.add(dimension.key);

    if (dimension.positive.letter === dimension.negative.letter) {
      errors.push(`Dimension ${dimension.key} positive and negative letters must differ`);
    }

    for (const poleName of ["positive", "negative"] as const) {
      const pole = dimension[poleName];
      if (isBlank(pole.letter)) {
        errors.push(`Dimension ${dimension.key} ${poleName} letter must not be empty`);
      }
      if (isBlank(pole.label)) {
        errors.push(`Dimension ${dimension.key} ${poleName} label must not be empty`);
      }
      if (isBlank(pole.description)) {
        errors.push(`Dimension ${dimension.key} ${poleName} description must not be empty`);
      }
    }
  }

  for (const key of EXPECTED_DIMENSION_KEYS) {
    if (!dimensionKeys.has(key)) {
      errors.push(`Missing dimension key: ${key}`);
    }
  }

  return errors;
}

export function validateQuestionBank(
  questions: Question[],
  personas: Partial<Record<PersonaKey, Persona>>,
): string[] {
  const errors: string[] = validateDimensions(DIMENSIONS);

  if (questions.length !== 16) {
    errors.push(`Expected 16 questions, received ${questions.length}`);
  }

  const questionIds = new Set<string>();
  for (const question of questions) {
    if (isBlank(question.id)) {
      errors.push("Question id must not be empty");
    }

    if (questionIds.has(question.id)) {
      errors.push(`Duplicate question id: ${question.id}`);
    }
    questionIds.add(question.id);

    if (isBlank(question.prompt)) {
      errors.push(`${question.id} prompt must not be empty`);
    }

    if (question.options.length !== 4) {
      errors.push(`${question.id} must contain exactly 4 options`);
    }

    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (isBlank(option.id)) {
        errors.push(`${question.id} option id must not be empty`);
      }

      if (optionIds.has(option.id)) {
        errors.push(`Duplicate option id in ${question.id}: ${option.id}`);
      }
      optionIds.add(option.id);

      if (isBlank(option.text)) {
        errors.push(`${question.id} option ${option.id} text must not be empty`);
      }

      if (Object.keys(option.identityWeights).length === 0) {
        errors.push(`${question.id} option ${option.id} must contain at least one identity weight`);
      }
      if (Object.keys(option.dimensionWeights).length === 0) {
        errors.push(`${question.id} option ${option.id} must contain at least one dimension weight`);
      }

      errors.push(
        ...validateWeightMap(option.identityWeights, `${question.id} option ${option.id} identity weight`),
        ...validateWeightMap(option.dimensionWeights, `${question.id} option ${option.id} dimension weight`),
      );
    }

    if (
      optionIds.size !== EXPECTED_OPTION_IDS.length ||
      EXPECTED_OPTION_IDS.some((optionId) => !optionIds.has(optionId))
    ) {
      errors.push(`${question.id} option ids must exactly be a,b,c,d`);
    }
  }

  for (const key of EXPECTED_PERSONA_KEYS) {
    if (!personas[key]) {
      errors.push(`Missing persona copy for ${key}`);
    }
  }

  return errors;
}
