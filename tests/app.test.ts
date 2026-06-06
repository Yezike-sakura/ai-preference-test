import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app";
import { QUESTIONS } from "../src/data/questions";
import type { Question } from "../src/types";

const posterMock = vi.hoisted(() => ({
  downloadPosterImage: vi.fn(),
}));

vi.mock("../src/poster", () => posterMock);

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

async function flushAsyncHandlers(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("quiz UI", () => {
  beforeEach(() => {
    posterMock.downloadPosterImage.mockReset();
  });

  it("renders a stronger product-style start screen", () => {
    const root = document.createElement("div");
    createApp(root);

    expect(root.querySelector(".hero-layout")).not.toBeNull();
    expect(root.textContent).toContain("测出你的 AI 协作人格");
    expect(root.textContent).toContain("四个偏好维度");
    expect(root.textContent).toContain("委托 / 掌控");
    expect(root.textContent).toContain("探索 / 完成");
    expect(root.textContent).toContain("整合 / 产出");
    expect(root.textContent).toContain("开放 / 验证");
  });

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
    expect(root.textContent).toContain("主身份");
    expect(root.textContent).toContain("副身份");
    expect(root.textContent).toContain("学习/研究型");
    expect(root.textContent).toContain("工程/执行型");
    expect(root.textContent).toContain("生成结果图片");
    expect(root.textContent).toContain("进阶测试暂未开放");
    expect(root.querySelector<HTMLImageElement>(".persona-portrait")?.src).toContain(
      "personas/learning-engineering.jpg",
    );
    expect(buttonByText(root, "生成结果图片").disabled).toBe(false);
  });

  it("shows a recoverable error if poster export fails", async () => {
    posterMock.downloadPosterImage.mockRejectedValueOnce(new Error("Export failed"));
    const root = document.createElement("div");
    createApp(root);

    clickByText(root, "开始测试");
    for (let index = 0; index < QUESTIONS.length; index += 1) {
      const firstOption = root.querySelector<HTMLButtonElement>("[data-option-id]");
      if (!firstOption) throw new Error("Missing option button");
      firstOption.click();
      clickByText(root, index === QUESTIONS.length - 1 ? "查看结果" : "下一题");
    }

    clickByText(root, "生成结果图片");
    await flushAsyncHandlers();

    expect(posterMock.downloadPosterImage).toHaveBeenCalledTimes(1);
    const alert = root.querySelector("[role='alert']");
    expect(alert?.textContent).toContain("结果图片生成失败，可以先使用截图保存海报。");
    expect(root.textContent).toContain("你的 AI 使用人格");
    expect(root.textContent).toContain("生成结果图片");
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
