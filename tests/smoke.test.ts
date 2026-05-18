import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("app bootstrap", () => {
  it("renders the start screen into a provided root", () => {
    const root = document.createElement("div");
    createApp(root);
    expect(root.textContent).toContain("AI 使用偏好测试");
    expect(root.querySelector("button")?.textContent).toContain("开始测试");
  });
});
