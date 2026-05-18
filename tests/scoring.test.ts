import { describe, expect, it } from "vitest";
import { PERSONAS } from "../src/data/personas";
import { QUESTIONS } from "../src/data/questions";
import { calculateResult, emptyScores } from "../src/scoring";
import type { IdentityKey, Question } from "../src/types";

function pickDominant(identity: IdentityKey): Record<string, string> {
  return Object.fromEntries(
    QUESTIONS.map((question) => {
      const option = question.options
        .slice()
        .sort((left, right) => (right.identityWeights[identity] ?? 0) - (left.identityWeights[identity] ?? 0))[0];
      return [question.id, option.id];
    }),
  );
}

function balancedMiniQuestions(dimensionWeight: number): Question[] {
  return [
    {
      id: "q1",
      prompt: "x",
      options: [
        {
          id: "a",
          text: "x",
          identityWeights: { learning: 3, creative: 1 },
          dimensionWeights: {
            agency: dimensionWeight,
            tempo: dimensionWeight,
            output: dimensionWeight,
            risk: dimensionWeight,
          },
        },
      ],
    },
    {
      id: "q2",
      prompt: "y",
      options: [
        {
          id: "a",
          text: "y",
          identityWeights: { creative: 3, learning: 1 },
          dimensionWeights: {
            agency: dimensionWeight,
            tempo: dimensionWeight,
            output: dimensionWeight,
            risk: dimensionWeight,
          },
        },
      ],
    },
  ];
}

function tiedIdentityQuestions(): Question[] {
  return [
    {
      id: "q1",
      prompt: "x",
      options: [
        {
          id: "a",
          text: "x",
          identityWeights: { learning: 1, engineering: 1, creative: 1 },
          dimensionWeights: { agency: 0, tempo: 0, output: 0, risk: 0 },
        },
      ],
    },
  ];
}

describe("calculateResult", () => {
  it("initializes empty scores for each provided key", () => {
    expect(emptyScores(["a", "b"] as const)).toEqual({ a: 0, b: 0 });
  });

  it("returns the highest identity as main identity", () => {
    const result = calculateResult(QUESTIONS, PERSONAS, pickDominant("creative"));
    expect(result.mainIdentity).toBe("creative");
    expect(result.persona.title.length).toBeGreaterThan(0);
  });

  it("uses identity order to break tied identity scores", () => {
    const result = calculateResult(tiedIdentityQuestions(), PERSONAS, { q1: "a" });

    expect(result.identityScores.learning).toBe(result.identityScores.engineering);
    expect(result.identityScores.engineering).toBe(result.identityScores.creative);
    expect(result.mainIdentity).toBe("learning");
    expect(result.secondaryIdentity).toBe("engineering");
  });

  it("builds the four-letter type code from dimension scores", () => {
    const result = calculateResult(balancedMiniQuestions(2), PERSONAS, { q1: "a", q2: "a" });
    expect(result.typeCode).toBe("DEIO");
    expect(result.persona.title).toBe("\u7075\u611f\u7814\u7a76\u5458");
  });

  it("selects negative dimension poles when dimension scores are below zero", () => {
    const result = calculateResult(balancedMiniQuestions(-2), PERSONAS, { q1: "a", q2: "a" });

    expect(result.typeCode).toBe("CFPV");
    expect(result.dimensions.map((dimension) => dimension.letter)).toEqual(["C", "F", "P", "V"]);
  });

  it("throws a clear error when an answer is missing", () => {
    expect(() => calculateResult(QUESTIONS, PERSONAS, {})).toThrow("Missing answer for q1");
  });

  it("throws an invalid-answer error when an answer is an empty string", () => {
    expect(() => calculateResult(QUESTIONS, PERSONAS, { q1: "" })).toThrow('Invalid answer "" for q1');
  });

  it("throws an invalid-answer error for an unknown non-empty answer id", () => {
    expect(() =>
      calculateResult(QUESTIONS, PERSONAS, {
        ...pickDominant("creative"),
        q1: "z",
      }),
    ).toThrow("Invalid answer z for q1");
  });

  it("throws a clear error when the computed persona is missing", () => {
    const { "learning-creative": _missingPersona, ...personas } = PERSONAS;

    expect(() => calculateResult(balancedMiniQuestions(2), personas, { q1: "a", q2: "a" })).toThrow(
      "Missing persona for learning-creative",
    );
  });

  it("returns the complete quiz result shape", () => {
    const result = calculateResult(QUESTIONS, PERSONAS, pickDominant("creative"));

    expect(result).toMatchObject({
      mainIdentity: expect.any(String),
      secondaryIdentity: expect.any(String),
      identityScores: {
        learning: expect.any(Number),
        engineering: expect.any(Number),
        creative: expect.any(Number),
        efficiency: expect.any(Number),
      },
      dimensionScores: {
        agency: expect.any(Number),
        tempo: expect.any(Number),
        output: expect.any(Number),
        risk: expect.any(Number),
      },
      typeCode: expect.any(String),
      persona: {
        title: expect.any(String),
      },
    });
    expect(result.typeCode).toHaveLength(4);
    expect(result.dimensions).toHaveLength(4);
    expect(result.persona.title.length).toBeGreaterThan(0);
  });

  it("does not mutate input questions or answers", () => {
    const questions = balancedMiniQuestions(2);
    const answers = { q1: "a", q2: "a" };
    const before = JSON.stringify({ questions, answers });

    calculateResult(questions, PERSONAS, answers);

    expect(JSON.stringify({ questions, answers })).toBe(before);
  });
});
