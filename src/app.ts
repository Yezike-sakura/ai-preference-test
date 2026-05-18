import { downloadPosterImage } from "./poster";
import { calculateResult } from "./scoring";
import { DIMENSIONS, IDENTITY_DESCRIPTIONS, IDENTITY_LABELS, PERSONAS } from "./data/personas";
import { QUESTIONS } from "./data/questions";
import type { IdentityKey, Question, QuizResult } from "./types";

type Screen = "start" | "quiz" | "result";

interface AppState {
  screen: Screen;
  currentIndex: number;
  answers: Record<string, string>;
  showError: boolean;
  calculationError: string | null;
  exportError: string;
  result: QuizResult | null;
}

const identityOrder: IdentityKey[] = [
  "learning",
  "engineering",
  "creative",
  "efficiency",
];

export function createApp(root: HTMLElement, questions: Question[] = QUESTIONS): void {
  const state: AppState = {
    screen: "start",
    currentIndex: 0,
    answers: {},
    showError: false,
    calculationError: null,
    exportError: "",
    result: null,
  };

  function render(): void {
    root.replaceChildren(renderShell(state.screen));
  }

  function renderShell(screen: Screen): HTMLElement {
    const main = el("main", "app-shell");

    if (screen === "start") {
      main.append(renderStart());
      return main;
    }

    if (screen === "quiz") {
      main.append(renderQuiz());
      return main;
    }

    main.append(renderResult());
    return main;
  }

  function renderStart(): HTMLElement {
    const section = el("section", "start-panel hero-shell hero-layout");
    const copy = el("div", "hero-copy");
    copy.append(
      textEl("p", "eyebrow", "AI Preference Test"),
      textEl("h1", undefined, "测出你的 AI 协作人格"),
      textEl(
        "p",
        "subtitle",
        "AI 使用偏好测试通过 16 个真实使用情境，帮你理解自己更适合怎样和 AI、Agent 一起学习、创作、开发与推进任务。",
      ),
    );

    const badges = el("div", "start-meta");
    badges.append(
      textEl("span", undefined, "16 题快测"),
      textEl("span", undefined, "本地计算"),
      textEl("span", undefined, "可生成结果图"),
    );

    const startButton = button("开始测试", "primary-button", () => {
      state.screen = "quiz";
      state.currentIndex = 0;
      state.showError = false;
      state.calculationError = null;
      state.exportError = "";
      render();
    });

    copy.append(badges, startButton);
    section.append(copy, renderDimensionPreview());
    return section;
  }

  function renderDimensionPreview(): HTMLElement {
    const panel = el("aside", "dimension-preview");
    panel.append(
      textEl("p", "eyebrow", "四个偏好维度"),
      textEl("h2", undefined, "不是能力评判，而是你的 AI 协作默认姿势。"),
    );

    const grid = el("div", "dimension-preview-grid");
    const labels = [
      "委托 / 掌控",
      "探索 / 完成",
      "整合 / 产出",
      "开放 / 验证",
    ];
    for (const [index, dimension] of DIMENSIONS.entries()) {
      const item = el("div", "dimension-chip");
      item.append(
        textEl("strong", undefined, labels[index]),
        textEl("span", undefined, `${dimension.positive.letter}${dimension.negative.letter} · ${dimension.positive.label} / ${dimension.negative.label}`),
      );
      grid.append(item);
    }
    panel.append(grid);
    return panel;
  }

  function renderQuiz(): HTMLElement {
    const question = questions[state.currentIndex];
    const selectedAnswer = state.answers[question.id];
    const isLastQuestion = state.currentIndex === questions.length - 1;
    const progress = Math.round(((state.currentIndex + 1) / questions.length) * 100);
    const section = el("section", "quiz-panel");

    const topline = el("div", "quiz-topline");
    topline.append(
      textEl("span", undefined, `第 ${state.currentIndex + 1} / ${questions.length} 题`),
      textEl("span", undefined, `${progress}%`),
    );

    const progressTrack = el("div", "progress-track");
    progressTrack.setAttribute("aria-label", "测试进度");
    const progressBar = el("div", "progress-bar");
    progressBar.style.width = `${progress}%`;
    progressTrack.append(progressBar);

    const optionList = el("div", "option-list");
    for (const option of question.options) {
      const isSelected = selectedAnswer === option.id;
      const optionButton = button(option.text, `option-button${isSelected ? " selected" : ""}`, () => {
        state.answers[question.id] = option.id;
        state.showError = false;
        state.calculationError = null;
        state.exportError = "";
        render();
      });
      optionButton.dataset.optionId = option.id;
      optionButton.setAttribute("aria-pressed", String(isSelected));
      optionList.append(optionButton);
    }

    const navRow = el("div", "nav-row");
    const previousButton = button("上一题", "secondary-button", () => {
      state.currentIndex = Math.max(0, state.currentIndex - 1);
      state.showError = false;
      state.calculationError = null;
      state.exportError = "";
      render();
    });
    previousButton.disabled = state.currentIndex === 0;

    const nextButton = button(isLastQuestion ? "查看结果" : "下一题", "primary-button", () => {
      if (!state.answers[question.id]) {
        state.showError = true;
        state.calculationError = null;
        state.exportError = "";
        render();
        return;
      }

      if (isLastQuestion) {
        try {
          state.result = calculateResult(questions, PERSONAS, state.answers);
          state.calculationError = null;
          state.exportError = "";
          state.screen = "result";
        } catch {
          state.result = null;
          state.calculationError = "结果计算失败，请返回检查答案或重新测试。";
          state.exportError = "";
        }
      } else {
        state.currentIndex += 1;
        state.showError = false;
        state.calculationError = null;
        state.exportError = "";
      }
      render();
    });

    navRow.append(previousButton, nextButton);

    section.append(
      topline,
      progressTrack,
      textEl("h2", undefined, question.prompt),
      optionList,
      state.showError ? textEl("p", "inline-error", "请先选择一个最像你的选项") : emptyEl(),
      state.calculationError ? alertEl(state.calculationError) : emptyEl(),
      navRow,
    );

    return section;
  }

  function renderResult(): HTMLElement {
    if (!state.result) {
      throw new Error("Result screen requires a calculated result");
    }

    const result = state.result;
    const section = el("section", "result-shell");
    section.append(renderPoster(result), renderResultDetails(result));
    return section;
  }

  function renderPoster(result: QuizResult): HTMLElement {
    const poster = el("article", "poster-card");
    poster.id = "result-poster";
    poster.append(
      textEl("p", "poster-kicker", "YOUR AI PERSONA"),
      textEl("h2", undefined, result.persona.title),
      textEl("p", "poster-code", result.typeCode),
      textEl("p", "poster-line", result.persona.identityLine),
      renderKeywords(result.persona.keywords),
      textEl("p", "poster-line", result.persona.goldenLine),
    );
    return poster;
  }

  function renderResultDetails(result: QuizResult): HTMLElement {
    const details = el("div", "result-details");
    details.append(
      textEl("p", "eyebrow", "Result"),
      textEl("h2", undefined, "你的 AI 使用人格"),
      textEl("p", "subtitle", result.persona.summary),
    );

    const actions = el("div", "action-row");
    const exportGroup = el("div", "export-group");
    const exportButton = button("生成结果图片", "primary-button", async () => {
      try {
        const hadExportError = Boolean(state.exportError);
        await downloadPosterImage(result);
        state.exportError = "";
        if (hadExportError) {
          render();
        }
      } catch {
        state.exportError = "结果图片生成失败，可以先使用截图保存海报。";
        render();
      }
    });
    exportGroup.append(exportButton, state.exportError ? alertEl(state.exportError) : emptyEl());

    actions.append(
      exportGroup,
      button("重新测试", "secondary-button", () => {
        state.screen = "start";
        state.currentIndex = 0;
        state.answers = {};
        state.showError = false;
        state.calculationError = null;
        state.exportError = "";
        state.result = null;
        render();
      }),
    );

    const grid = el("div", "detail-grid");
    grid.append(
      renderIdentityProfile(result),
      renderIdentityScores(result),
      renderDimensions(result),
      renderList("优势", result.persona.strengths),
      renderList("风险", result.persona.risks),
      renderList("建议", result.persona.advice),
    );

    details.append(actions, grid, textEl("p", "advanced-note", "进阶测试暂未开放"));
    return details;
  }

  function renderIdentityProfile(result: QuizResult): HTMLElement {
    const card = el("section", "score-list");
    card.append(textEl("h3", undefined, "主副身份"));

    const main = el("div");
    main.append(
      textEl("span", undefined, `主身份：${IDENTITY_LABELS[result.mainIdentity]}`),
      textEl("strong", undefined, "主要驱动"),
    );

    const secondary = el("div");
    secondary.append(
      textEl("span", undefined, `副身份：${IDENTITY_LABELS[result.secondaryIdentity]}`),
      textEl("strong", undefined, "辅助倾向"),
    );

    card.append(
      main,
      textEl("p", undefined, IDENTITY_DESCRIPTIONS[result.mainIdentity]),
      secondary,
      textEl("p", undefined, IDENTITY_DESCRIPTIONS[result.secondaryIdentity]),
    );

    return card;
  }

  function renderIdentityScores(result: QuizResult): HTMLElement {
    const card = el("section", "score-list");
    card.append(textEl("h3", undefined, "身份得分"));

    for (const identity of identityOrder) {
      const row = el("div");
      row.append(
        textEl("span", undefined, IDENTITY_LABELS[identity]),
        textEl("strong", undefined, String(result.identityScores[identity])),
      );
      card.append(row);
    }

    return card;
  }

  function renderDimensions(result: QuizResult): HTMLElement {
    const card = el("section", "score-list");
    card.append(textEl("h3", undefined, "维度"));

    for (const dimension of result.dimensions) {
      const row = el("div");
      row.append(
        textEl("span", undefined, `${dimension.letter} · ${dimension.label}`),
        textEl("strong", undefined, String(dimension.score)),
      );
      card.append(row, textEl("p", undefined, dimension.description));
    }

    return card;
  }

  function renderList(title: string, items: string[]): HTMLElement {
    const card = el("section", "score-list");
    const list = document.createElement("ul");
    card.append(textEl("h3", undefined, title), list);

    for (const item of items) {
      list.append(textEl("li", undefined, item));
    }

    return card;
  }

  render();
}

function renderKeywords(keywords: string[]): HTMLElement {
  const row = el("div", "keyword-row");
  for (const keyword of keywords) {
    row.append(textEl("span", undefined, keyword));
  }
  return row;
}

function button(text: string, className: string, onClick: () => void | Promise<void>): HTMLButtonElement {
  const element = document.createElement("button");
  element.type = "button";
  element.className = className;
  element.textContent = text;
  element.addEventListener("click", onClick);
  return element;
}

function textEl<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className: string | undefined,
  text: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  return element;
}

function emptyEl(): Text {
  return document.createTextNode("");
}

function alertEl(message: string): HTMLElement {
  const element = textEl("p", "inline-error", message);
  element.setAttribute("role", "alert");
  return element;
}
