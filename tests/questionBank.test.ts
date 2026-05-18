import { describe, expect, it } from "vitest";
import { PERSONAS } from "../src/data/personas";
import { QUESTIONS } from "../src/data/questions";
import { validateQuestionBank } from "../src/scoring";

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
    expect(Object.keys(PERSONAS)).toHaveLength(12);
  });
});
