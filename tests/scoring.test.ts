import { describe, expect, it } from "vitest";
import { PERSONAS } from "../src/data/personas";
import { QUESTIONS } from "../src/data/questions";
import { calculateResult } from "../src/scoring";
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

describe("calculateResult", () => {
  it("returns the highest identity as main identity", () => {
    const result = calculateResult(QUESTIONS, PERSONAS, pickDominant("creative"));
    expect(result.mainIdentity).toBe("creative");
    expect(result.persona.title.length).toBeGreaterThan(0);
  });

  it("returns a deterministic secondary identity", () => {
    const result = calculateResult(QUESTIONS, PERSONAS, {
      ...pickDominant("engineering"),
      q1: "a",
      q2: "a",
      q3: "a",
      q4: "a",
    });
    expect(result.mainIdentity).toBe("engineering");
    expect(result.secondaryIdentity).toBe("learning");
  });

  it("builds the four-letter type code from dimension scores", () => {
    const miniQuestions: Question[] = [
      {
        id: "q1",
        prompt: "x",
        options: [
          {
            id: "a",
            text: "x",
            identityWeights: { learning: 3, creative: 1 },
            dimensionWeights: { agency: 2, tempo: 2, output: 2, risk: 2 },
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
            dimensionWeights: { agency: 2, tempo: 2, output: 2, risk: 2 },
          },
        ],
      },
    ];

    const result = calculateResult(miniQuestions, PERSONAS, { q1: "a", q2: "a" });
    expect(result.typeCode).toBe("DEIO");
    expect(result.persona.title).toBe("灵感研究员");
  });

  it("throws a clear error when an answer is missing", () => {
    expect(() => calculateResult(QUESTIONS, PERSONAS, {})).toThrow("Missing answer for q1");
  });
});
