import { describe, expect, it } from "vitest";
import { EXPECTED_PERSONA_KEYS, PERSONAS, personaKey } from "../src/data/personas";
import { QUESTIONS } from "../src/data/questions";
import { validateDimensions, validateQuestionBank } from "../src/scoring";
import type { DimensionDefinition, Persona, Question } from "../src/types";

function withQuestionPatch(
  questionIndex: number,
  patch: Partial<Question>,
): Question[] {
  return QUESTIONS.map((question, index) =>
    index === questionIndex ? { ...question, ...patch } : question,
  );
}

describe("question bank", () => {
  it("contains the first-version fixed 16-question quick test", () => {
    expect(QUESTIONS).toHaveLength(16);
    for (const question of QUESTIONS) {
      expect(question.options).toHaveLength(4);
    }
  });

  it("passes structural validation", () => {
    expect(validateQuestionBank(QUESTIONS, PERSONAS)).toEqual([]);
  });

  it("covers every main-secondary persona combination", () => {
    expect(Object.keys(PERSONAS).sort()).toEqual([...EXPECTED_PERSONA_KEYS].sort());
  });

  it("rejects duplicate question ids", () => {
    const questions = withQuestionPatch(1, { id: QUESTIONS[0].id });

    expect(validateQuestionBank(questions, PERSONAS)).toContain("Duplicate question id: q1");
  });

  it("rejects wrong option count or option id set", () => {
    const missingOption = withQuestionPatch(0, {
      options: QUESTIONS[0].options.slice(0, 3),
    });
    const wrongOptionId = withQuestionPatch(0, {
      options: QUESTIONS[0].options.map((option) =>
        option.id === "d" ? { ...option, id: "x" } : option,
      ),
    });

    expect(validateQuestionBank(missingOption, PERSONAS)).toContain("q1 must contain exactly 4 options");
    expect(validateQuestionBank(wrongOptionId, PERSONAS)).toContain("q1 option ids must exactly be a,b,c,d");
  });

  it("rejects missing persona copy", () => {
    const { "learning-engineering": _removed, ...personas } = PERSONAS;

    expect(validateQuestionBank(QUESTIONS, personas)).toContain("Missing persona copy for learning-engineering");
  });

  it("rejects unexpected persona copy keys", () => {
    const personas = {
      ...PERSONAS,
      "learning-learning": PERSONAS["learning-engineering"],
    } as Record<string, Persona | undefined>;

    expect(validateQuestionBank(QUESTIONS, personas)).toContain("Unexpected persona key: learning-learning");
  });

  it("rejects malformed persona copy", () => {
    const personas = {
      ...PERSONAS,
      "learning-engineering": {
        ...PERSONAS["learning-engineering"],
        title: " ",
        advice: ["only one"],
      },
    };

    expect(validateQuestionBank(QUESTIONS, personas)).toEqual(
      expect.arrayContaining([
        "Persona learning-engineering title must not be empty",
        "Persona learning-engineering advice must contain exactly 3 items",
      ]),
    );
  });

  it("returns errors for malformed persona runtime shapes", () => {
    const personas = {
      ...PERSONAS,
      "learning-engineering": {
        ...PERSONAS["learning-engineering"],
        title: undefined,
        keywords: "not an array",
        advice: ["", 42, "ok"],
      },
    } as unknown as Record<string, Persona | undefined>;

    expect(validateQuestionBank(QUESTIONS, personas)).toEqual(
      expect.arrayContaining([
        "Persona learning-engineering title must be a string",
        "Persona learning-engineering keywords must be an array",
        "Persona learning-engineering advice item 1 must not be empty",
        "Persona learning-engineering advice item 2 must be a string",
      ]),
    );
  });

  it("rejects empty or invalid option text and weights", () => {
    const questions = withQuestionPatch(0, {
      options: QUESTIONS[0].options.map((option) =>
        option.id === "a"
          ? {
              ...option,
              text: " ",
              identityWeights: {},
              dimensionWeights: { output: Number.POSITIVE_INFINITY },
            }
          : option,
      ),
    });

    expect(validateQuestionBank(questions, PERSONAS)).toEqual(
      expect.arrayContaining([
        "q1 option a text must not be empty",
        "q1 option a must contain at least one identity weight",
        "q1 option a dimension weight output must be a finite number",
      ]),
    );
  });

  it("rejects unknown identity or dimension weight keys", () => {
    const questions = withQuestionPatch(0, {
      options: QUESTIONS[0].options.map((option) =>
        option.id === "a"
          ? {
              ...option,
              identityWeights: { learning: 3, invalidIdentity: 1 } as never,
              dimensionWeights: { output: 1, invalidDimension: 1 } as never,
            }
          : option,
      ),
    });

    expect(validateQuestionBank(questions, PERSONAS)).toEqual(
      expect.arrayContaining([
        "q1 option a identity weight invalidIdentity is not a valid key",
        "q1 option a dimension weight invalidDimension is not a valid key",
      ]),
    );
  });

  it("returns errors for malformed question runtime shapes", () => {
    const missingOptions = withQuestionPatch(0, { options: undefined as never });
    const invalidWeights = withQuestionPatch(0, {
      options: QUESTIONS[0].options.map((option) =>
        option.id === "a"
          ? {
              ...option,
              identityWeights: null as never,
              dimensionWeights: "bad" as never,
            }
          : option,
      ),
    });

    expect(validateQuestionBank(missingOptions, PERSONAS)).toContain("q1 options must be an array");
    expect(validateQuestionBank(invalidWeights, PERSONAS)).toEqual(
      expect.arrayContaining([
        "q1 option a identityWeights must be a plain record",
        "q1 option a dimensionWeights must be a plain record",
      ]),
    );
  });

  it("rejects unexpected question ids", () => {
    const questions = withQuestionPatch(0, { id: "q99" });

    expect(validateQuestionBank(questions, PERSONAS)).toEqual(
      expect.arrayContaining([
        "Missing question id: q1",
        "Unexpected question id: q99",
      ]),
    );
  });

  it("rejects persona keys with the same main and secondary identity", () => {
    expect(() => personaKey("learning", "learning")).toThrow(
      "Persona key requires different main and secondary identities",
    );
  });

  it("rejects invalid dimension definitions", () => {
    const dimensions: DimensionDefinition[] = [
      {
        key: "agency",
        positive: { letter: "D", label: "委托型", description: "valid" },
        negative: { letter: "D", label: "", description: "valid" },
      },
    ];

    expect(validateDimensions(dimensions)).toEqual(
      expect.arrayContaining([
        "Expected 4 dimensions, received 1",
        "Missing dimension key: tempo",
        "Dimension agency positive and negative letters must differ",
        "Dimension agency negative label must not be empty",
      ]),
    );
  });

  it("rejects unknown dimension keys", () => {
    const dimensions: DimensionDefinition[] = [
      {
        key: "unknown" as never,
        positive: { letter: "X", label: "未知", description: "valid" },
        negative: { letter: "Y", label: "未知反向", description: "valid" },
      },
      ...([] as DimensionDefinition[]),
    ];

    expect(validateDimensions(dimensions)).toContain("Unexpected dimension key: unknown");
  });

  it("rejects wrong dimension letters", () => {
    const dimensions: DimensionDefinition[] = [
      {
        key: "agency",
        positive: { letter: "X", label: "委托型", description: "valid" },
        negative: { letter: "Y", label: "掌控型", description: "valid" },
      },
    ];

    expect(validateDimensions(dimensions)).toEqual(
      expect.arrayContaining([
        "Dimension agency positive letter must be D",
        "Dimension agency negative letter must be C",
      ]),
    );
  });
});
