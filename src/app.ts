import { downloadPosterImage } from "./poster";
import { calculateResult } from "./scoring";
import { DIMENSIONS, IDENTITY_DESCRIPTIONS, IDENTITY_LABELS, PERSONAS } from "./data/personas";
import { DEFAULT_PERSONA_VISUALS } from "./data/personaVisuals";
import { QUESTIONS } from "./data/questions";
import type { DimensionKey, IdentityKey, PersonaKey, Question, QuizResult } from "./types";

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

const radarIdentityLabels: Record<IdentityKey, string> = {
  learning: "学习",
  engineering: "工程",
  creative: "创意",
  efficiency: "效率",
};

const radarDimensionLabels: Record<DimensionKey, string> = {
  agency: "委托",
  tempo: "探索",
  output: "整合",
  risk: "验证",
};

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

    panel.append(renderNeuralOrbit());

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

  function renderNeuralOrbit(): HTMLElement {
    const orbit = el("div", "neural-orbit");
    orbit.setAttribute("aria-hidden", "true");

    const core = el("div", "orbit-core");
    core.append(textEl("span", undefined, "AI"));
    orbit.append(core);

    for (let index = 0; index < 3; index += 1) {
      orbit.append(el("span", "orbit-ring"));
    }

    const labels = ["Learn", "Build", "Create", "Ship", "Agent", "Verify"];
    for (const label of labels) {
      const node = el("span", "orbit-node");
      node.append(textEl("strong", undefined, label));
      orbit.append(node);
    }

    return orbit;
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
    poster.classList.add(`persona-${result.personaKey}`);
    const portrait = document.createElement("img");
    portrait.className = "persona-portrait";
    portrait.src = personaImageSrc(result.personaKey);
    portrait.alt = `${result.persona.title} 动漫风格画像`;
    portrait.loading = "eager";
    portrait.decoding = "async";

    poster.append(
      textEl("p", "poster-kicker", "YOUR AI PERSONA"),
      portrait,
      textEl("h2", undefined, result.persona.title),
      textEl("p", "poster-code", result.typeCode),
      textEl("p", "poster-line", result.persona.identityLine),
      renderKeywords(result.persona.keywords),
      textEl("p", "poster-line", result.persona.goldenLine),
      renderPersonaRadar(result),
    );
    return poster;
  }

  function renderResultDetails(result: QuizResult): HTMLElement {
    const details = el("div", "result-details");
    const header = el("div", "result-header");
    const copy = el("div", "result-copy");
    copy.append(
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

    header.append(copy, actions);

    const grid = el("div", "detail-grid");
    grid.append(
      renderIdentityProfile(result),
      renderIdentityScores(result),
      renderDimensions(result),
      renderList("优势", result.persona.strengths),
      renderList("风险", result.persona.risks),
      renderList("建议", result.persona.advice),
    );

    details.append(header, grid, textEl("p", "advanced-note", "进阶测试暂未开放"));
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

function personaImageSrc(personaKey: PersonaKey): string {
  return DEFAULT_PERSONA_VISUALS[personaKey] ?? `personas/${personaKey}.jpg`;
}

function renderPersonaRadar(result: QuizResult): HTMLElement {
  const card = el("section", "persona-radar-card");
  const header = el("div", "persona-radar-header");
  header.append(
    textEl("span", undefined, "人格多边形"),
    textEl("strong", undefined, result.typeCode),
  );

  const figure = createRadarSvg(result);
  const summary = textEl(
    "p",
    "persona-radar-summary",
    `${radarIdentityLabels[result.mainIdentity]}峰值明显，${radarIdentityLabels[result.secondaryIdentity]}倾向辅助。`,
  );

  card.append(header, figure, summary);
  return card;
}

function createRadarSvg(result: QuizResult): SVGSVGElement {
  const svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 320 250");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${result.persona.title} 人格雷达图`);

  const center = { x: 160, y: 126 };
  const radius = 82;
  const identityMax = Math.max(...identityOrder.map((identity) => result.identityScores[identity]), 1);
  const dimensionMax = Math.max(...result.dimensions.map((dimension) => Math.abs(dimension.score)), 1);
  const axes = [
    ...identityOrder.map((identity) => ({
      label: radarIdentityLabels[identity],
      value: normalizeRadarValue(result.identityScores[identity], identityMax),
    })),
    ...result.dimensions.map((dimension) => ({
      label: radarDimensionLabels[dimension.key],
      value: normalizeRadarValue(Math.abs(dimension.score), dimensionMax),
    })),
  ];

  const grid = svgEl("g");
  grid.setAttribute("class", "radar-grid");
  for (let level = 1; level <= 4; level += 1) {
    const polygon = svgEl("polygon");
    polygon.setAttribute("points", polygonPoints(axes.map(() => (level / 4) * 100), center, radius));
    grid.append(polygon);
  }
  for (let index = 0; index < axes.length; index += 1) {
    const point = radarPoint(index, axes.length, 100, center, radius);
    const line = svgEl("line");
    line.setAttribute("x1", String(center.x));
    line.setAttribute("y1", String(center.y));
    line.setAttribute("x2", String(point.x));
    line.setAttribute("y2", String(point.y));
    grid.append(line);
  }
  svg.append(grid);

  const shape = svgEl("polygon");
  shape.setAttribute("class", "radar-shape");
  shape.setAttribute("points", polygonPoints(axes.map((axis) => axis.value), center, radius));
  svg.append(shape);

  const outline = svgEl("polyline");
  const shapePoints = axes.map((axis, index) => radarPoint(index, axes.length, axis.value, center, radius));
  outline.setAttribute(
    "points",
    [...shapePoints, shapePoints[0]].map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" "),
  );
  outline.setAttribute("class", "radar-outline");
  svg.append(outline);

  for (const [index, axis] of axes.entries()) {
    const labelPoint = radarPoint(index, axes.length, 118, center, radius);
    const point = radarPoint(index, axes.length, axis.value, center, radius);
    const label = svgEl("text");
    label.textContent = axis.label;
    label.setAttribute("x", String(labelPoint.x));
    label.setAttribute("y", String(labelPoint.y));
    label.setAttribute("class", "radar-label");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    svg.append(label);

    const dot = svgEl("circle");
    dot.setAttribute("cx", String(point.x));
    dot.setAttribute("cy", String(point.y));
    dot.setAttribute("r", "3.8");
    dot.setAttribute("class", "radar-dot");
    svg.append(dot);
  }

  const centerPanel = svgEl("g");
  centerPanel.setAttribute("class", "radar-center");
  const centerRect = svgEl("rect");
  centerRect.setAttribute("x", "96");
  centerRect.setAttribute("y", "91");
  centerRect.setAttribute("width", "128");
  centerRect.setAttribute("height", "70");
  centerRect.setAttribute("rx", "18");
  const centerTitle = svgEl("text");
  centerTitle.textContent = result.persona.title;
  centerTitle.setAttribute("x", "160");
  centerTitle.setAttribute("y", "114");
  centerTitle.setAttribute("text-anchor", "middle");
  const centerCode = svgEl("text");
  centerCode.textContent = result.typeCode;
  centerCode.setAttribute("x", "160");
  centerCode.setAttribute("y", "147");
  centerCode.setAttribute("text-anchor", "middle");
  centerCode.setAttribute("class", "radar-code");
  centerPanel.append(centerRect, centerTitle, centerCode);
  svg.append(centerPanel);

  return svg;
}

function normalizeRadarValue(value: number, max: number): number {
  if (max <= 0) {
    return 24;
  }

  return Math.max(22, Math.min(100, (Math.max(0, value) / max) * 100));
}

function polygonPoints(values: number[], center: { x: number; y: number }, radius: number): string {
  return values
    .map((value, index) => {
      const point = radarPoint(index, values.length, value, center, radius);
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function radarPoint(
  index: number,
  total: number,
  value: number,
  center: { x: number; y: number },
  radius: number,
): { x: number; y: number } {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  const scaledRadius = (radius * value) / 100;
  return {
    x: Number((center.x + Math.cos(angle) * scaledRadius).toFixed(1)),
    y: Number((center.y + Math.sin(angle) * scaledRadius).toFixed(1)),
  };
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

function svgEl<K extends keyof SVGElementTagNameMap>(tagName: K): SVGElementTagNameMap[K] {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}

function emptyEl(): Text {
  return document.createTextNode("");
}

function alertEl(message: string): HTMLElement {
  const element = textEl("p", "inline-error", message);
  element.setAttribute("role", "alert");
  return element;
}
