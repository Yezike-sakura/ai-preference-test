import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { QUESTIONS } from "../src/data/questions";
import type { Question } from "../src/types";

function buttonByText(root: HTMLElement, text: string): HTMLButtonElement {
  const element = Array.from(root.querySelectorAll("button")).find((button) =>
    button.textContent?.includes(text),
  );
  if (!element) throw new Error(`Button not found: ${text}`);
  return element;
}

function clickByText(root: HTMLElement, text: string): void {
  const element = buttonByText(root, text);
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
    expect(buttonByText(root, "生成结果图片").disabled).toBe(false);
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

  it("shows a recoverable error if result calculation fails", () => {
    const root = document.createElement("div");
    const corruptedQuestions: Question[] = [
      {
        id: "__proto__",
        prompt: "Broken scoring fixture",
        options: [
          {
            id: "a",
            text: "Option A",
            identityWeights: { learning: 1 },
            dimensionWeights: { agency: 1 },
          },
        ],
      },
    ];
    createApp(root, corruptedQuestions);

    clickByText(root, "开始测试");
    root.querySelector<HTMLButtonElement>("[data-option-id]")?.click();
    clickByText(root, "查看结果");

    const alert = root.querySelector("[role='alert']");
    expect(alert?.textContent).toContain("结果计算失败，请返回检查答案或重新测试。");
    expect(root.textContent).toContain("第 1 / 1 题");
  });
});
