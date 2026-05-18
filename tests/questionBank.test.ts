import { describe, expect, it } from "vitest";
import { EXPECTED_PERSONA_KEYS, PERSONAS } from "../src/data/personas";
import { QUESTIONS } from "../src/data/questions";
import { validateDimensions, validateQuestionBank } from "../src/scoring";
import type { DimensionDefinition, Question } from "../src/types";

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
});
