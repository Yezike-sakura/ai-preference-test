import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { QUESTIONS } from "../src/data/questions";

function clickByText(root: HTMLElement, text: string): void {
  const element = Array.from(root.querySelectorAll("button")).find((button) =>
    button.textContent?.includes(text),
  );
  if (!element) throw new Error(`Button not found: ${text}`);
  element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("quiz UI", () => {
  it("blocks next until the current question is answered", () => {
    const root = document.createElement("div");
    createApp(root);

    clickByText(root, "开始测试");
    clickByText(root, "下一题");

    expect(root.textContent).toContain("请先选择一个最像你的选项");
    expect(root.textContent).toContain("第 1 / 16 题");
  });

  it("allows completing the quiz and reaching the result page", () => {
    const root = document.createElement("div");
    createApp(root);

    clickByText(root, "开始测试");
    for (let index = 0; index < QUESTIONS.length; index += 1) {
      const firstOption = root.querySelector<HTMLButtonElement>("[data-option-id]");
      if (!firstOption) throw new Error("Missing option button");
      firstOption.click();
      clickByText(root, index === QUESTIONS.length - 1 ? "查看结果" : "下一题");
    }

    expect(root.textContent).toContain("你的 AI 使用人格");
    expect(root.textContent).toContain("生成结果图片");
    expect(root.textContent).toContain("进阶测试暂未开放");
  });

  it("supports returning to a previous answer", () => {
    const root = document.createElement("div");
    createApp(root);

    clickByText(root, "开始测试");
    root.querySelector<HTMLButtonElement>("[data-option-id]")?.click();
    clickByText(root, "下一题");
    clickByText(root, "上一题");

    expect(root.textContent).toContain("第 1 / 16 题");
    expect(root.querySelector("[aria-pressed='true']")).not.toBeNull();
  });
});
