import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("visual layering styles", () => {
  it("keeps the particle canvas above the page background and below app content", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("#particle-canvas");
    expect(css).not.toContain("z-index: -2");
    expect(css).toContain("#app");
    expect(css).toContain("z-index: 1");
    expect(css).toContain("body::before");
    expect(css).toContain("@keyframes particle-drift");
  });
});
