import type { DimensionDefinition, DimensionKey, IdentityKey, Persona, PersonaKey, Question, QuizResult, ScoreMap } from "./types";
import { DIMENSIONS, EXPECTED_PERSONA_KEYS, IDENTITY_ORDER, personaKey } from "./data/personas";

const EXPECTED_OPTION_IDS = ["a", "b", "c", "d"];
const EXPECTED_DIMENSION_KEYS: DimensionKey[] = ["agency", "tempo", "output", "risk"];
const EXPECTED_QUESTION_IDS = Array.from({ length: 16 }, (_, index) => `q${index + 1}`);
const EXPECTED_DIMENSION_LETTERS: Record<DimensionKey, { positive: string; negative: string }> = {
  agency: { positive: "D", negative: "C" },
  tempo: { positive: "E", negative: "F" },
  output: { positive: "I", negative: "P" },
  risk: { positive: "O", negative: "V" },
};

export function emptyScores<T extends string>(keys: readonly T[]): ScoreMap<T> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as ScoreMap<T>;
}

export function calculateResult(
  questions: Question[],
  personas: Partial<Record<PersonaKey, Persona>>,
  answers: Record<string, string>,
): QuizResult {
  const identityScores = emptyScores(IDENTITY_ORDER);
  const dimensionKeys = DIMENSIONS.map((dimension) => dimension.key);
  const dimensionScores = emptyScores(dimensionKeys);

  for (const question of questions) {
    if (!Object.prototype.hasOwnProperty.call(answers, question.id)) {
      throw new Error(`Missing answer for ${question.id}`);
    }

    const answerId = answers[question.id];
    const option = question.options.find((candidate) => candidate.id === answerId);
    if (!option) {
      throw new Error(`Invalid answer ${formatAnswerId(answerId)} for ${question.id}`);
    }

    for (const identity of IDENTITY_ORDER) {
      identityScores[identity] += option.identityWeights[identity] ?? 0;
    }

    for (const dimension of dimensionKeys) {
      dimensionScores[dimension] += option.dimensionWeights[dimension] ?? 0;
    }
  }

  const rankedIdentities = IDENTITY_ORDER.slice().sort(
    (left, right) =>
      identityScores[right] - identityScores[left] ||
      IDENTITY_ORDER.indexOf(left) - IDENTITY_ORDER.indexOf(right),
  );
  const mainIdentity: IdentityKey = rankedIdentities[0];
  const secondaryIdentity: IdentityKey = rankedIdentities[1];
  const key = personaKey(mainIdentity, secondaryIdentity);
  const persona = personas[key];

  if (!persona) {
    throw new Error(`Missing persona for ${key}`);
  }

  const dimensions = DIMENSIONS.map((dimension) => {
    const score = dimensionScores[dimension.key];
    const pole = score >= 0 ? dimension.positive : dimension.negative;

    return {
      key: dimension.key,
      letter: pole.letter,
      label: pole.label,
      description: pole.description,
      score,
    };
  });

  return {
    mainIdentity,
    secondaryIdentity,
    identityScores,
    dimensionScores,
    personaKey: key,
    typeCode: dimensions.map((dimension) => dimension.letter).join(""),
    dimensions,
    persona,
  };
}

function formatAnswerId(answerId: string): string {
  return answerId === "" ? '""' : answerId;
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function validateWeightMap(
  weights: unknown,
  label: string,
  validKeys: readonly string[],
  invalidRecordLabel = label,
): string[] {
  const errors: string[] = [];

  if (!isPlainRecord(weights)) {
    errors.push(`${invalidRecordLabel} must be a plain record`);
    return errors;
  }

  for (const [key, value] of Object.entries(weights)) {
    if (!validKeys.includes(key)) {
      errors.push(`${label} ${key} is not a valid key`);
    }

    if (!Number.isFinite(value)) {
      errors.push(`${label} ${key} must be a finite number`);
    }
  }

  return errors;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function validateNonEmptyStringArray(
  values: unknown,
  label: string,
): string[] {
  const errors: string[] = [];

  if (!Array.isArray(values)) {
    errors.push(`${label} must be an array`);
    return errors;
  }

  if (values.length === 0) {
    errors.push(`${label} must contain at least one item`);
  }

  values.forEach((value, index) => {
    if (typeof value !== "string") {
      errors.push(`${label} item ${index + 1} must be a string`);
      return;
    }

    if (isBlank(value)) {
      errors.push(`${label} item ${index + 1} must not be empty`);
    }
  });

  return errors;
}

function validatePersonaCopy(
  key: PersonaKey,
  persona: unknown,
): string[] {
  const errors: string[] = [];

  if (!isPlainRecord(persona)) {
    errors.push(`Persona ${key} must be a plain record`);
    return errors;
  }

  for (const field of ["title", "identityLine", "goldenLine", "summary"] as const) {
    const value = persona[field];
    if (typeof value !== "string") {
      errors.push(`Persona ${key} ${field} must be a string`);
      continue;
    }

    if (isBlank(value)) {
      errors.push(`Persona ${key} ${field} must not be empty`);
    }
  }

  for (const field of ["keywords", "strengths", "risks", "advice"] as const) {
    errors.push(...validateNonEmptyStringArray(persona[field], `Persona ${key} ${field}`));
  }

  if (Array.isArray(persona.advice) && persona.advice.length !== 3) {
    errors.push(`Persona ${key} advice must contain exactly 3 items`);
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
    if (!EXPECTED_DIMENSION_KEYS.includes(dimension.key)) {
      errors.push(`Unexpected dimension key: ${dimension.key}`);
    }

    const expectedLetters = EXPECTED_DIMENSION_LETTERS[dimension.key];
    if (expectedLetters) {
      if (dimension.positive.letter !== expectedLetters.positive) {
        errors.push(`Dimension ${dimension.key} positive letter must be ${expectedLetters.positive}`);
      }
      if (dimension.negative.letter !== expectedLetters.negative) {
        errors.push(`Dimension ${dimension.key} negative letter must be ${expectedLetters.negative}`);
      }
    }

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
  personas: Partial<Record<string, unknown>>,
): string[] {
  const errors: string[] = validateDimensions(DIMENSIONS);
  const expectedPersonaKeys = new Set<string>(EXPECTED_PERSONA_KEYS);
  const expectedQuestionIds = new Set<string>(EXPECTED_QUESTION_IDS);

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

    if (!expectedQuestionIds.has(question.id)) {
      errors.push(`Unexpected question id: ${question.id}`);
    }

    if (!Array.isArray(question.options)) {
      errors.push(`${question.id} options must be an array`);
      continue;
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

      if (isPlainRecord(option.identityWeights) && Object.keys(option.identityWeights).length === 0) {
        errors.push(`${question.id} option ${option.id} must contain at least one identity weight`);
      }
      if (isPlainRecord(option.dimensionWeights) && Object.keys(option.dimensionWeights).length === 0) {
        errors.push(`${question.id} option ${option.id} must contain at least one dimension weight`);
      }

      errors.push(
        ...validateWeightMap(
          option.identityWeights,
          `${question.id} option ${option.id} identity weight`,
          IDENTITY_ORDER,
          `${question.id} option ${option.id} identityWeights`,
        ),
        ...validateWeightMap(
          option.dimensionWeights,
          `${question.id} option ${option.id} dimension weight`,
          EXPECTED_DIMENSION_KEYS,
          `${question.id} option ${option.id} dimensionWeights`,
        ),
      );
    }

    if (
      optionIds.size !== EXPECTED_OPTION_IDS.length ||
      EXPECTED_OPTION_IDS.some((optionId) => !optionIds.has(optionId))
    ) {
      errors.push(`${question.id} option ids must exactly be a,b,c,d`);
    }
  }

  for (const id of EXPECTED_QUESTION_IDS) {
    if (!questionIds.has(id)) {
      errors.push(`Missing question id: ${id}`);
    }
  }

  for (const key of EXPECTED_PERSONA_KEYS) {
    const persona = personas[key];
    if (!persona) {
      errors.push(`Missing persona copy for ${key}`);
      continue;
    }

    errors.push(...validatePersonaCopy(key, persona));
  }

  for (const key of Object.keys(personas)) {
    if (!expectedPersonaKeys.has(key)) {
      errors.push(`Unexpected persona key: ${key}`);
    }
  }

  return errors;
}
