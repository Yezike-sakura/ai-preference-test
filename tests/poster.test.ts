import { describe, expect, it } from "vitest";
import { PERSONAS } from "../src/data/personas";
import { QUESTIONS } from "../src/data/questions";
import { buildPosterSvg } from "../src/poster";
import { calculateResult } from "../src/scoring";

describe("poster generation", () => {
  it("builds an SVG poster with escaped dynamic content and pure SVG text", () => {
    const baseResult = calculateResult(
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
    const result = {
      ...baseResult,
      typeCode: `D<E>&"T"'Q'`,
      persona: {
        ...baseResult.persona,
        identityLine: `偏好 <Agent> & "协作" '模式'`,
        keywords: [`快 <准>`, `稳 & "细"`, `可复现 '证据'`],
        goldenLine: `把 <复杂问题> 拆成 "可验证" 的步骤 & 保留 '证据链'。`,
      },
    };

    const svg = buildPosterSvg(result);
    expect(svg).toContain("<svg");
    expect(svg).toContain("YOUR AI PERSONA");
    expect(svg).not.toContain("<foreignObject");

    expect(svg).toContain("知识 &lt;架构师&gt;");
    expect(svg).toContain("D&lt;E&gt;&amp;&quot;T&quot;&apos;Q&apos;");
    expect(svg).toContain("偏好 &lt;Agent&gt; &amp; &quot;协作&quot; &apos;模式&apos;");
    expect(svg).toContain("快 &lt;准&gt;");
    expect(svg).toContain("稳 &amp; &quot;细&quot;");
    expect(svg).toContain("可复现 &apos;证据&apos;");
    expect(svg).toContain("把 &lt;复杂问题&gt; 拆成 &quot;可验证&quot; 的步骤 &amp;");
    expect(svg).toContain("保留 &apos;证据链&apos;。");

    expect(svg).not.toContain("知识 <架构师>");
    expect(svg).not.toContain(`D<E>&"T"'Q'`);
    expect(svg).not.toContain(`偏好 <Agent> & "协作" '模式'`);
    expect(svg).not.toContain("快 <准>");
    expect(svg).not.toContain(`稳 & "细"`);
    expect(svg).not.toContain(`可复现 '证据'`);
    expect(svg).not.toContain(`把 <复杂问题> 拆成 "可验证" 的步骤 & 保留 '证据链'。`);
  });
});
