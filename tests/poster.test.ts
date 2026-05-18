import { describe, expect, it } from "vitest";
import { PERSONAS } from "../src/data/personas";
import { QUESTIONS } from "../src/data/questions";
import { buildPosterSvg } from "../src/poster";
import { calculateResult } from "../src/scoring";

describe("poster generation", () => {
  it("builds an SVG poster with escaped dynamic content", () => {
    const result = calculateResult(
      QUESTIONS,
      {
        ...PERSONAS,
        "learning-engineering": {
          ...PERSONAS["learning-engineering"],
          title: "知识 <架构师>",
        },
      },
      Object.fromEntries(QUESTIONS.map((question) => [question.id, "a"])),
    );

    const svg = buildPosterSvg(result);
    expect(svg).toContain("<svg");
    expect(svg).toContain("YOUR AI PERSONA");
    expect(svg).toContain("知识 &lt;架构师&gt;");
    expect(svg).not.toContain("知识 <架构师>");
  });
});
