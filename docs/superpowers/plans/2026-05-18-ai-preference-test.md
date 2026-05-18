# AI Preference Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally runnable AI 使用偏好测试网页 with a 16-question quiz, local scoring, a result page, and a downloadable share poster.

**Architecture:** Use a Vite + TypeScript single-page app with no backend. Keep scoring, question data, persona copy, poster generation, and DOM rendering in separate modules so each part can be tested independently. All answers stay in browser memory and no network request is made by the app.

**Tech Stack:** Vite, TypeScript, Vitest with jsdom, browser DOM APIs, Canvas/SVG APIs for poster export.

---

## Scope Check

The approved spec describes one coherent first version: local quiz, local scoring, result explanation, poster export, README. It does not need to be split into separate subsystem plans.

## File Structure

- `package.json`: npm scripts and dev dependencies installed by npm.
- `tsconfig.json`: TypeScript settings for app and tests.
- `index.html`: Vite entry document.
- `src/types.ts`: shared domain types.
- `src/data/questions.ts`: 16-question bank and answer weights.
- `src/data/personas.ts`: identity labels, dimension labels, and 12 persona combinations.
- `src/scoring.ts`: pure scoring and validation functions.
- `src/poster.ts`: SVG poster construction and PNG download helper.
- `src/app.ts`: DOM rendering, quiz navigation, result rendering, and UI error states.
- `src/main.ts`: app bootstrap.
- `src/styles.css`: responsive UI and poster styling.
- `tests/questionBank.test.ts`: question/persona coverage tests.
- `tests/scoring.test.ts`: deterministic scoring tests.
- `tests/poster.test.ts`: poster SVG safety/content tests.
- `tests/app.test.ts`: start/quiz/result flow tests with jsdom.
- `README.md`: local run, test, build, and deployment notes.

---

### Task 1: Project Scaffold And Smoke Test

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/app.ts`
- Create: `src/styles.css`
- Create: `tests/smoke.test.ts`

- [ ] **Step 1: Create package metadata**

Create `package.json`:

```json
{
  "name": "ai-preference-test",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run --environment jsdom"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

- [ ] **Step 2: Install development dependencies**

Run:

```bash
npm install -D vite typescript vitest jsdom
```

Expected: `package-lock.json` is created and `package.json` gains dev dependencies.

- [ ] **Step 3: Add TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Add HTML entry**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 使用偏好测试</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Write failing smoke test**

Create `tests/smoke.test.ts`:

```ts
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
```

- [ ] **Step 6: Run smoke test and verify it fails**

Run:

```bash
npm test -- tests/smoke.test.ts
```

Expected: FAIL because `../src/app` does not export `createApp`.

- [ ] **Step 7: Add minimal app files**

Create `src/app.ts`:

```ts
export function createApp(root: HTMLElement): void {
  root.innerHTML = `
    <main class="app-shell">
      <section class="start-panel">
        <p class="eyebrow">AI Preference Test</p>
        <h1>AI 使用偏好测试</h1>
        <p class="subtitle">16 题，约 3-5 分钟，测出你更习惯如何使用 AI 与 Agent。</p>
        <button type="button" class="primary-button">开始测试</button>
      </section>
    </main>
  `;
}
```

Create `src/main.ts`:

```ts
import "./styles.css";
import { createApp } from "./app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

createApp(root);
```

Create `src/styles.css`:

```css
:root {
  color: #111827;
  background: #f8fafc;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
  display: grid;
  place-items: center;
}

.start-panel {
  width: min(720px, 100%);
  padding: 40px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
}

.eyebrow {
  margin: 0 0 12px;
  color: #7c3aed;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 7vw, 4.5rem);
  line-height: 1;
  letter-spacing: 0;
}

.subtitle {
  margin: 18px 0 28px;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.7;
}

.primary-button {
  min-height: 48px;
  padding: 0 20px;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  background: #7c3aed;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 640px) {
  .app-shell {
    padding: 16px;
  }

  .start-panel {
    padding: 28px 20px;
    border-radius: 18px;
  }
}
```

- [ ] **Step 8: Run smoke test and verify it passes**

Run:

```bash
npm test -- tests/smoke.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit scaffold**

```bash
git add package.json package-lock.json tsconfig.json index.html src/main.ts src/app.ts src/styles.css tests/smoke.test.ts
git commit -m "feat: scaffold AI preference test app"
```

---

### Task 2: Question Bank, Persona Copy, And Data Validation

**Files:**
- Create: `src/types.ts`
- Create: `src/data/questions.ts`
- Create: `src/data/personas.ts`
- Create: `tests/questionBank.test.ts`

- [ ] **Step 1: Write failing question bank tests**

Create `tests/questionBank.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- tests/questionBank.test.ts
```

Expected: FAIL because `src/types.ts`, `src/data/questions.ts`, `src/data/personas.ts`, and `src/scoring.ts` do not exist.

- [ ] **Step 3: Add domain types**

Create `src/types.ts`:

```ts
export type IdentityKey = "learning" | "engineering" | "creative" | "efficiency";

export type DimensionKey = "agency" | "tempo" | "output" | "risk";

export type ScoreMap<T extends string> = Record<T, number>;

export interface WeightedOption {
  id: string;
  text: string;
  identityWeights: Partial<ScoreMap<IdentityKey>>;
  dimensionWeights: Partial<ScoreMap<DimensionKey>>;
}

export interface Question {
  id: string;
  prompt: string;
  options: WeightedOption[];
}

export interface DimensionPole {
  letter: string;
  label: string;
  description: string;
}

export interface DimensionDefinition {
  key: DimensionKey;
  positive: DimensionPole;
  negative: DimensionPole;
}

export interface Persona {
  title: string;
  identityLine: string;
  keywords: string[];
  goldenLine: string;
  summary: string;
  strengths: string[];
  risks: string[];
  advice: string[];
}

export interface QuizResult {
  mainIdentity: IdentityKey;
  secondaryIdentity: IdentityKey;
  identityScores: ScoreMap<IdentityKey>;
  dimensionScores: ScoreMap<DimensionKey>;
  typeCode: string;
  dimensions: Array<{
    key: DimensionKey;
    letter: string;
    label: string;
    description: string;
    score: number;
  }>;
  persona: Persona;
}
```

- [ ] **Step 4: Add persona definitions**

Create `src/data/personas.ts`:

```ts
import type { DimensionDefinition, IdentityKey, Persona } from "../types";

export const IDENTITY_LABELS: Record<IdentityKey, string> = {
  learning: "学习/研究型",
  engineering: "工程/执行型",
  creative: "创意/表达型",
  efficiency: "效率/组织型",
};

export const IDENTITY_ORDER: IdentityKey[] = [
  "learning",
  "engineering",
  "creative",
  "efficiency",
];

export const DIMENSIONS: DimensionDefinition[] = [
  {
    key: "agency",
    positive: {
      letter: "D",
      label: "委托型",
      description: "更愿意把任务交给 AI 推进，再检查关键结果。",
    },
    negative: {
      letter: "C",
      label: "掌控型",
      description: "更愿意自己掌握节奏，让 AI 执行明确片段。",
    },
  },
  {
    key: "tempo",
    positive: {
      letter: "E",
      label: "探索型",
      description: "倾向先扩展可能性，再筛选方向。",
    },
    negative: {
      letter: "F",
      label: "完成型",
      description: "倾向尽快收束方案，把任务推进到完成。",
    },
  },
  {
    key: "output",
    positive: {
      letter: "I",
      label: "整合型",
      description: "偏好让 AI 汇总信息、提炼结构和连接线索。",
    },
    negative: {
      letter: "P",
      label: "产出型",
      description: "偏好让 AI 直接生成内容、代码、草稿或方案。",
    },
  },
  {
    key: "risk",
    positive: {
      letter: "O",
      label: "开放试错型",
      description: "愿意快速试不同提示、工具和 Agent 工作流。",
    },
    negative: {
      letter: "V",
      label: "谨慎验证型",
      description: "更重视检查来源、边界和结果可靠性。",
    },
  },
];

export const PERSONAS: Record<string, Persona> = {
  "learning-engineering": {
    title: "知识架构师",
    identityLine: "学习型工程派",
    keywords: ["拆解知识", "结构化", "可验证"],
    goldenLine: "你习惯把 AI 当成知识脚手架，把复杂问题拆到可以验证。",
    summary: "你使用 AI 时会先理解问题结构，再推动具体产出。你适合用 AI 做资料梳理、概念拆解、实验复盘和方案验证。",
    strengths: ["能把模糊问题拆清楚", "重视证据链和可复现性", "适合复杂学习任务"],
    risks: ["可能在资料整理阶段停留太久", "容易低估快速原型的价值"],
    advice: ["先让 AI 给出问题树，再逐层追问。", "要求 AI 标注不确定点和验证方法。", "给每次学习任务设定一个可交付产物。"],
  },
  "learning-creative": {
    title: "灵感研究员",
    identityLine: "学习型创意派",
    keywords: ["理解", "联想", "表达"],
    goldenLine: "你会先把知识吃透，再让 AI 帮你长出新的表达方式。",
    summary: "你擅长把资料、观点和灵感连接起来，适合论文阅读、选题发散、脚本构思和内容转写。",
    strengths: ["能从知识中提炼创意", "适合跨领域联想", "表达有解释基础"],
    risks: ["可能被新想法带偏主线", "容易把资料和灵感混在一起"],
    advice: ["让 AI 分开输出事实、推测和创意。", "每次发散后要求 AI 帮你收束成 3 个方向。", "为重要内容保留引用或来源备注。"],
  },
  "learning-efficiency": {
    title: "复盘规划师",
    identityLine: "学习型效率派",
    keywords: ["复盘", "计划", "沉淀"],
    goldenLine: "你用 AI 把输入变成方法，把经验变成下一步计划。",
    summary: "你倾向用 AI 管理学习和工作节奏，适合复习计划、读书笔记、阶段总结和任务复盘。",
    strengths: ["擅长整理路径", "重视持续改进", "能形成稳定流程"],
    risks: ["可能过度规划而行动不足", "容易把计划写得太满"],
    advice: ["让 AI 把计划压缩成今天能做的 3 件事。", "用固定模板复盘输入、输出和下一步。", "要求 AI 标出最小可行动作。"],
  },
  "engineering-learning": {
    title: "问题拆解师",
    identityLine: "工程型学习派",
    keywords: ["问题定位", "调试", "学习闭环"],
    goldenLine: "你喜欢让 AI 帮你把问题拆开，边解决边补齐理解。",
    summary: "你适合用 AI 处理代码、工具、流程和技术学习中的具体阻塞点。",
    strengths: ["行动导向强", "能快速定位问题", "学习和实践能互相促进"],
    risks: ["可能只修表象问题", "容易跳过系统性总结"],
    advice: ["让 AI 先列假设，再逐个验证。", "解决后要求 AI 总结根因和预防方式。", "把每次调试记录成可复用 checklist。"],
  },
  "engineering-creative": {
    title: "原型炼金师",
    identityLine: "工程型创意派",
    keywords: ["原型", "试验", "落地"],
    goldenLine: "你会把灵感快速变成可运行的小东西。",
    summary: "你适合用 AI 把想法做成 demo、脚本、自动化工具或内容原型。",
    strengths: ["从想法到产出速度快", "能用技术承载创意", "适合竞赛和个人项目"],
    risks: ["可能忽略长期维护", "容易同时开太多原型"],
    advice: ["每个想法先定义最小可运行版本。", "让 AI 帮你列出可删减范围。", "原型完成后补一页使用说明。"],
  },
  "engineering-efficiency": {
    title: "流程指挥官",
    identityLine: "工程型效率派",
    keywords: ["自动化", "流程", "交付"],
    goldenLine: "你擅长把重复任务交给 AI，把精力留给判断。",
    summary: "你倾向用 AI 和 Agent 拆任务、跑流程、检查结果，适合项目推进和自动化工作。",
    strengths: ["执行效率高", "适合搭建工作流", "能把任务推进到完成"],
    risks: ["可能过度依赖自动化结果", "容易忽略人工复核节点"],
    advice: ["为 Agent 任务设置输入、输出和停止条件。", "让 AI 在关键步骤生成检查清单。", "把高频流程沉淀成模板。"],
  },
  "creative-learning": {
    title: "概念探险家",
    identityLine: "创意型学习派",
    keywords: ["灵感", "理解", "跨界"],
    goldenLine: "你把 AI 当成灵感地图，用它发现知识之间的隐藏通道。",
    summary: "你适合用 AI 做选题发散、世界观构建、观点解释和跨领域类比。",
    strengths: ["发散能力强", "能把复杂概念讲得有画面", "适合创意学习"],
    risks: ["可能发散太远", "容易忽略事实边界"],
    advice: ["让 AI 给每个创意标注依据和假设。", "每轮发散后选一个方向深入。", "用反例检查创意是否站得住。"],
  },
  "creative-engineering": {
    title: "创意工程师",
    identityLine: "创意型工程派",
    keywords: ["生成", "实现", "迭代"],
    goldenLine: "你不只要点子，你要能跑起来的点子。",
    summary: "你适合用 AI 辅助脚本、分镜、工具、页面和交互原型，把创意变成可展示作品。",
    strengths: ["创意能落地", "迭代速度快", "愿意尝试工具组合"],
    risks: ["可能忽略最终受众", "容易在技术实现上消耗过多"],
    advice: ["先写清作品要给谁看。", "让 AI 同时给创意版和可执行版。", "每次迭代只改一个核心变量。"],
  },
  "creative-efficiency": {
    title: "内容策划家",
    identityLine: "创意型效率派",
    keywords: ["内容", "节奏", "包装"],
    goldenLine: "你用 AI 把灵感排成队，让表达持续发生。",
    summary: "你适合用 AI 生成选题、标题、脚本、发布节奏和内容复用方案。",
    strengths: ["内容组织能力强", "能稳定产出", "善于包装表达"],
    risks: ["可能牺牲深度", "容易让内容变得模板化"],
    advice: ["为内容设定固定栏目和变化点。", "让 AI 输出多个标题但保留你的判断。", "定期复盘哪些内容真的有效。"],
  },
  "efficiency-learning": {
    title: "知识整理官",
    identityLine: "效率型学习派",
    keywords: ["整理", "清单", "复用"],
    goldenLine: "你会把信息整理成下一次可以直接使用的资产。",
    summary: "你适合用 AI 做笔记整理、资料归档、学习路线和知识库结构。",
    strengths: ["信息管理强", "能减少重复劳动", "适合长期积累"],
    risks: ["可能过度整理", "容易追求整齐而不是理解"],
    advice: ["每份资料只提炼 3 个可复用结论。", "让 AI 区分现在要用和以后备用。", "把整理结果放进真实任务里验证。"],
  },
  "efficiency-engineering": {
    title: "自动化调度员",
    identityLine: "效率型工程派",
    keywords: ["调度", "自动化", "检查"],
    goldenLine: "你擅长让 AI 接管流程里的重复部分，并保留关键控制点。",
    summary: "你适合用 AI 建立任务清单、自动化脚本、检查流程和项目推进节奏。",
    strengths: ["流程感强", "能设计检查点", "适合管理重复任务"],
    risks: ["可能把简单任务流程化过度", "容易忽略异常情况"],
    advice: ["先判断任务是否值得自动化。", "为每个自动化步骤设置人工确认点。", "让 AI 输出失败时的处理路径。"],
  },
  "efficiency-creative": {
    title: "表达运营家",
    identityLine: "效率型创意派",
    keywords: ["运营", "表达", "复用"],
    goldenLine: "你会把创意变成稳定生产线，再让表达持续迭代。",
    summary: "你适合用 AI 做内容排期、素材复用、社媒文案、活动策划和表达优化。",
    strengths: ["能把创意流程化", "适合持续输出", "善于复用素材"],
    risks: ["可能让表达变得过于公式化", "容易为了效率牺牲新鲜感"],
    advice: ["保留一部分内容用于自由试验。", "让 AI 帮你做复用，但由你决定主张。", "定期删除效果差的模板。"],
  },
};

export function personaKey(main: IdentityKey, secondary: IdentityKey): string {
  return `${main}-${secondary}`;
}
```

- [ ] **Step 5: Add the 16-question bank**

Create `src/data/questions.ts`:

```ts
import type { Question } from "../types";

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "面对一个完全陌生的新任务，你最可能先让 AI 做什么？",
    options: [
      { id: "a", text: "梳理背景、关键概念和我需要先理解的问题。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "拆成可以马上执行的步骤，并指出第一步怎么做。", identityWeights: { engineering: 3 }, dimensionWeights: { tempo: -1, output: -1 } },
      { id: "c", text: "给我几个不同方向的灵感或可能玩法。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 1, risk: 1 } },
      { id: "d", text: "整理成清单、优先级和时间安排。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: 1, tempo: -1 } }
    ]
  },
  {
    id: "q2",
    prompt: "你拿到一大段资料时，更希望 AI 先帮你产出什么？",
    options: [
      { id: "a", text: "核心观点、证据链和不确定之处。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "可操作的任务列表和检查顺序。", identityWeights: { engineering: 2, efficiency: 1 }, dimensionWeights: { tempo: -1, output: -1 } },
      { id: "c", text: "适合转成内容的角度、标题和表达方式。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 1, output: -1 } },
      { id: "d", text: "结构化摘要、分类标签和后续提醒。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: 1, output: 1 } }
    ]
  },
  {
    id: "q3",
    prompt: "当 AI 给出的答案看起来不错时，你通常会怎么做？",
    options: [
      { id: "a", text: "追问依据、边界和反例，确认它是否可靠。", identityWeights: { learning: 2 }, dimensionWeights: { risk: -3, output: 1 } },
      { id: "b", text: "把答案放进实际任务里跑一遍，看哪里会卡。", identityWeights: { engineering: 3 }, dimensionWeights: { tempo: -1, risk: -1 } },
      { id: "c", text: "让它再换几种风格，看看有没有更有意思的版本。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 2, risk: 1 } },
      { id: "d", text: "保存成模板，下次遇到类似任务直接复用。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: 1, output: 1 } }
    ]
  },
  {
    id: "q4",
    prompt: "你最希望 Agent 帮你承担哪类工作？",
    options: [
      { id: "a", text: "持续查找、比较和整理信息。", identityWeights: { learning: 3 }, dimensionWeights: { agency: 1, output: 1 } },
      { id: "b", text: "按目标自动推进一串可验证步骤。", identityWeights: { engineering: 3 }, dimensionWeights: { agency: 2, tempo: -1 } },
      { id: "c", text: "不断生成备选创意，我来挑选和组合。", identityWeights: { creative: 3 }, dimensionWeights: { agency: 1, tempo: 2 } },
      { id: "d", text: "帮我跟踪任务、提醒节点和整理进度。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: 2, tempo: -1 } }
    ]
  },
  {
    id: "q5",
    prompt: "如果你要准备一次展示或汇报，你会最先用 AI 做什么？",
    options: [
      { id: "a", text: "提炼主题、论点和支撑材料。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "拆出制作步骤和每页需要完成的内容。", identityWeights: { engineering: 2, efficiency: 1 }, dimensionWeights: { tempo: -1, output: -1 } },
      { id: "c", text: "生成开场、标题和更抓人的表达方式。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 1, output: -1 } },
      { id: "d", text: "规划时间线、版本节奏和检查清单。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: 1, tempo: -1 } }
    ]
  },
  {
    id: "q6",
    prompt: "当你发现自己提示词写得不清楚时，你倾向于怎么改？",
    options: [
      { id: "a", text: "补充背景、定义和判断标准。", identityWeights: { learning: 2 }, dimensionWeights: { risk: -1, output: 1 } },
      { id: "b", text: "把任务拆小，一次只让 AI 做一个明确动作。", identityWeights: { engineering: 3 }, dimensionWeights: { agency: -1, tempo: -1 } },
      { id: "c", text: "先让 AI 自由发挥，再从结果里找方向。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 2, risk: 2 } },
      { id: "d", text: "改成固定格式，让输出更容易比较和复用。", identityWeights: { efficiency: 3 }, dimensionWeights: { output: 1, risk: -1 } }
    ]
  },
  {
    id: "q7",
    prompt: "你最满意的一次 AI 使用体验通常是什么样？",
    options: [
      { id: "a", text: "它帮我理解了原本看不懂的东西。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "它帮我解决了一个具体问题或卡点。", identityWeights: { engineering: 3 }, dimensionWeights: { tempo: -1, output: -1 } },
      { id: "c", text: "它给出了我自己想不到的表达或创意。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 2, risk: 1 } },
      { id: "d", text: "它让我原本混乱的事情变得有秩序。", identityWeights: { efficiency: 3 }, dimensionWeights: { output: 1, agency: 1 } }
    ]
  },
  {
    id: "q8",
    prompt: "如果 AI 的回答和你的直觉不一致，你会更可能怎么处理？",
    options: [
      { id: "a", text: "让它解释推理过程，再找资料核对。", identityWeights: { learning: 3 }, dimensionWeights: { risk: -3, output: 1 } },
      { id: "b", text: "设计一个小测试，看哪个方案实际可行。", identityWeights: { engineering: 3 }, dimensionWeights: { risk: -1, tempo: -1 } },
      { id: "c", text: "把它当成一个新角度，继续扩展可能性。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 2, risk: 2 } },
      { id: "d", text: "记录分歧点，等完成主要任务后再复查。", identityWeights: { efficiency: 3 }, dimensionWeights: { tempo: -1, output: 1 } }
    ]
  },
  {
    id: "q9",
    prompt: "你更喜欢 AI 输出哪种形式？",
    options: [
      { id: "a", text: "分层解释、概念关系和参考依据。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "步骤、命令、代码或可直接执行的动作。", identityWeights: { engineering: 3 }, dimensionWeights: { output: -2, tempo: -1 } },
      { id: "c", text: "多个版本、风格示例和灵感清单。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 2, output: -1 } },
      { id: "d", text: "表格、待办、模板和优先级。", identityWeights: { efficiency: 3 }, dimensionWeights: { output: 1, agency: 1 } }
    ]
  },
  {
    id: "q10",
    prompt: "你使用 AI 时最担心什么？",
    options: [
      { id: "a", text: "信息不准或逻辑不严谨。", identityWeights: { learning: 3 }, dimensionWeights: { risk: -3 } },
      { id: "b", text: "结果看起来对，但实际跑不通。", identityWeights: { engineering: 3 }, dimensionWeights: { risk: -2, tempo: -1 } },
      { id: "c", text: "内容变得平庸，没有个人风格。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 1, agency: -1 } },
      { id: "d", text: "输出太散，最后没有节省时间。", identityWeights: { efficiency: 3 }, dimensionWeights: { tempo: -2, output: 1 } }
    ]
  },
  {
    id: "q11",
    prompt: "如果你要学一个新工具，你最想让 AI 怎么陪你？",
    options: [
      { id: "a", text: "先解释它的核心概念和适用边界。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "带我做一个最小可运行示例。", identityWeights: { engineering: 3 }, dimensionWeights: { output: -2, tempo: -1 } },
      { id: "c", text: "展示它能做出的不同玩法。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 2, risk: 1 } },
      { id: "d", text: "给我一套从入门到熟练的练习计划。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: 1, tempo: -1 } }
    ]
  },
  {
    id: "q12",
    prompt: "你更容易把 AI 融入哪种日常流程？",
    options: [
      { id: "a", text: "阅读、笔记、复习和资料整理。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "排查问题、写脚本和搭建小工具。", identityWeights: { engineering: 3 }, dimensionWeights: { output: -1, tempo: -1 } },
      { id: "c", text: "构思内容、改写表达和生成素材。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 1, output: -1 } },
      { id: "d", text: "安排任务、总结会议和维护清单。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: 1, output: 1 } }
    ]
  },
  {
    id: "q13",
    prompt: "当你有一个模糊想法时，你希望 AI 第一轮怎么回应？",
    options: [
      { id: "a", text: "帮我把概念说清楚，指出它和哪些知识有关。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "帮我判断它能不能做，并列出实现路径。", identityWeights: { engineering: 3 }, dimensionWeights: { tempo: -1, output: -1 } },
      { id: "c", text: "帮我扩展成更多设定、风格或故事可能。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 2, risk: 1 } },
      { id: "d", text: "帮我整理成目标、资源和下一步计划。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: 1, tempo: -1 } }
    ]
  },
  {
    id: "q14",
    prompt: "你更愿意怎样控制 AI 的自主性？",
    options: [
      { id: "a", text: "让它先收集和比较信息，我来判断结论。", identityWeights: { learning: 2 }, dimensionWeights: { agency: 1, risk: -1 } },
      { id: "b", text: "给它明确目标和约束，让它连续推进步骤。", identityWeights: { engineering: 2, efficiency: 1 }, dimensionWeights: { agency: 3, tempo: -1 } },
      { id: "c", text: "让它大胆尝试多种方向，我负责挑选。", identityWeights: { creative: 3 }, dimensionWeights: { agency: 2, tempo: 2, risk: 1 } },
      { id: "d", text: "只让它处理固定流程，关键节点必须提醒我。", identityWeights: { efficiency: 3 }, dimensionWeights: { agency: -2, risk: -2 } }
    ]
  },
  {
    id: "q15",
    prompt: "如果你要把一次 AI 对话沉淀下来，你最想保留什么？",
    options: [
      { id: "a", text: "概念解释、引用线索和判断依据。", identityWeights: { learning: 3 }, dimensionWeights: { output: 1, risk: -1 } },
      { id: "b", text: "可复用的步骤、命令和排错记录。", identityWeights: { engineering: 3 }, dimensionWeights: { output: -1, tempo: -1 } },
      { id: "c", text: "有启发的表达、标题和创意片段。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 1, output: -1 } },
      { id: "d", text: "模板、清单和下一次可以直接套用的流程。", identityWeights: { efficiency: 3 }, dimensionWeights: { output: 1, agency: 1 } }
    ]
  },
  {
    id: "q16",
    prompt: "完成任务前，你最希望 AI 最后帮你检查什么？",
    options: [
      { id: "a", text: "逻辑漏洞、事实错误和遗漏的关键点。", identityWeights: { learning: 3 }, dimensionWeights: { risk: -3, output: 1 } },
      { id: "b", text: "步骤是否可执行，结果是否能交付。", identityWeights: { engineering: 3 }, dimensionWeights: { tempo: -1, risk: -1 } },
      { id: "c", text: "表达是否有吸引力，风格是否一致。", identityWeights: { creative: 3 }, dimensionWeights: { tempo: 1, output: -1 } },
      { id: "d", text: "格式、优先级、截止时间和后续事项。", identityWeights: { efficiency: 3 }, dimensionWeights: { output: 1, tempo: -1 } }
    ]
  }
];
```

- [ ] **Step 6: Add validation function shell**

Create `src/scoring.ts`:

```ts
import type { IdentityKey, Persona, Question } from "./types";
import { IDENTITY_ORDER, personaKey } from "./data/personas";

export function validateQuestionBank(
  questions: Question[],
  personas: Record<string, Persona>,
): string[] {
  const errors: string[] = [];

  if (questions.length !== 16) {
    errors.push(`Expected 16 questions, received ${questions.length}`);
  }

  const questionIds = new Set<string>();
  for (const question of questions) {
    if (questionIds.has(question.id)) {
      errors.push(`Duplicate question id: ${question.id}`);
    }
    questionIds.add(question.id);

    if (question.options.length !== 4) {
      errors.push(`${question.id} must contain exactly 4 options`);
    }

    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (optionIds.has(option.id)) {
        errors.push(`Duplicate option id in ${question.id}: ${option.id}`);
      }
      optionIds.add(option.id);
    }
  }

  for (const main of IDENTITY_ORDER) {
    for (const secondary of IDENTITY_ORDER) {
      if (main === secondary) continue;
      const key = personaKey(main as IdentityKey, secondary as IdentityKey);
      if (!personas[key]) {
        errors.push(`Missing persona copy for ${key}`);
      }
    }
  }

  return errors;
}
```

- [ ] **Step 7: Run validation tests**

Run:

```bash
npm test -- tests/questionBank.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit data model**

```bash
git add src/types.ts src/data/questions.ts src/data/personas.ts src/scoring.ts tests/questionBank.test.ts
git commit -m "feat: add quiz data model"
```

---

### Task 3: Scoring Engine

**Files:**
- Modify: `src/scoring.ts`
- Create: `tests/scoring.test.ts`

- [ ] **Step 1: Write failing scoring tests**

Create `tests/scoring.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PERSONAS } from "../src/data/personas";
import { QUESTIONS } from "../src/data/questions";
import { calculateResult } from "../src/scoring";
import type { IdentityKey, Question } from "../src/types";

function pickDominant(identity: IdentityKey): Record<string, string> {
  return Object.fromEntries(
    QUESTIONS.map((question) => {
      const option = question.options
        .slice()
        .sort((left, right) => (right.identityWeights[identity] ?? 0) - (left.identityWeights[identity] ?? 0))[0];
      return [question.id, option.id];
    }),
  );
}

describe("calculateResult", () => {
  it("returns the highest identity as main identity", () => {
    const result = calculateResult(QUESTIONS, PERSONAS, pickDominant("creative"));
    expect(result.mainIdentity).toBe("creative");
    expect(result.persona.title.length).toBeGreaterThan(0);
  });

  it("returns a deterministic secondary identity", () => {
    const result = calculateResult(QUESTIONS, PERSONAS, {
      ...pickDominant("engineering"),
      q1: "a",
      q2: "a",
      q3: "a",
      q4: "a",
    });
    expect(result.mainIdentity).toBe("engineering");
    expect(result.secondaryIdentity).toBe("learning");
  });

  it("builds the four-letter type code from dimension scores", () => {
    const miniQuestions: Question[] = [
      {
        id: "q1",
        prompt: "x",
        options: [
          {
            id: "a",
            text: "x",
            identityWeights: { learning: 3, creative: 1 },
            dimensionWeights: { agency: 2, tempo: 2, output: 2, risk: 2 },
          },
        ],
      },
      {
        id: "q2",
        prompt: "y",
        options: [
          {
            id: "a",
            text: "y",
            identityWeights: { creative: 3, learning: 1 },
            dimensionWeights: { agency: 2, tempo: 2, output: 2, risk: 2 },
          },
        ],
      },
    ];

    const result = calculateResult(miniQuestions, PERSONAS, { q1: "a", q2: "a" });
    expect(result.typeCode).toBe("DEIO");
    expect(result.persona.title).toBe("灵感研究员");
  });

  it("throws a clear error when an answer is missing", () => {
    expect(() => calculateResult(QUESTIONS, PERSONAS, {})).toThrow("Missing answer for q1");
  });
});
```

- [ ] **Step 2: Run scoring tests and verify failure**

Run:

```bash
npm test -- tests/scoring.test.ts
```

Expected: FAIL because `calculateResult` is not exported.

- [ ] **Step 3: Implement scoring**

Replace `src/scoring.ts` with:

```ts
import type {
  DimensionKey,
  IdentityKey,
  Persona,
  Question,
  QuizResult,
  ScoreMap,
} from "./types";
import { DIMENSIONS, IDENTITY_ORDER, personaKey } from "./data/personas";

export function emptyScores<T extends string>(keys: readonly T[]): ScoreMap<T> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as ScoreMap<T>;
}

export function validateQuestionBank(
  questions: Question[],
  personas: Record<string, Persona>,
): string[] {
  const errors: string[] = [];

  if (questions.length !== 16) {
    errors.push(`Expected 16 questions, received ${questions.length}`);
  }

  const questionIds = new Set<string>();
  for (const question of questions) {
    if (questionIds.has(question.id)) {
      errors.push(`Duplicate question id: ${question.id}`);
    }
    questionIds.add(question.id);

    if (question.options.length !== 4) {
      errors.push(`${question.id} must contain exactly 4 options`);
    }

    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (optionIds.has(option.id)) {
        errors.push(`Duplicate option id in ${question.id}: ${option.id}`);
      }
      optionIds.add(option.id);
    }
  }

  for (const main of IDENTITY_ORDER) {
    for (const secondary of IDENTITY_ORDER) {
      if (main === secondary) continue;
      const key = personaKey(main, secondary);
      if (!personas[key]) {
        errors.push(`Missing persona copy for ${key}`);
      }
    }
  }

  return errors;
}

function addWeights<T extends string>(target: ScoreMap<T>, weights: Partial<ScoreMap<T>>): void {
  for (const [key, value] of Object.entries(weights) as Array<[T, number]>) {
    target[key] += value;
  }
}

function rankIdentities(scores: ScoreMap<IdentityKey>): IdentityKey[] {
  return IDENTITY_ORDER.slice().sort((left, right) => {
    const delta = scores[right] - scores[left];
    if (delta !== 0) return delta;
    return IDENTITY_ORDER.indexOf(left) - IDENTITY_ORDER.indexOf(right);
  });
}

export function calculateResult(
  questions: Question[],
  personas: Record<string, Persona>,
  answers: Record<string, string>,
): QuizResult {
  const identityScores = emptyScores(IDENTITY_ORDER);
  const dimensionScores = emptyScores(DIMENSIONS.map((dimension) => dimension.key));

  for (const question of questions) {
    const answerId = answers[question.id];
    if (!answerId) {
      throw new Error(`Missing answer for ${question.id}`);
    }

    const option = question.options.find((candidate) => candidate.id === answerId);
    if (!option) {
      throw new Error(`Invalid answer ${answerId} for ${question.id}`);
    }

    addWeights(identityScores, option.identityWeights);
    addWeights(dimensionScores, option.dimensionWeights);
  }

  const [mainIdentity, secondaryIdentity] = rankIdentities(identityScores);
  const persona = personas[personaKey(mainIdentity, secondaryIdentity)];

  if (!persona) {
    throw new Error(`Missing persona for ${mainIdentity}-${secondaryIdentity}`);
  }

  const dimensions = DIMENSIONS.map((dimension) => {
    const score = dimensionScores[dimension.key as DimensionKey];
    const pole = score >= 0 ? dimension.positive : dimension.negative;
    return {
      key: dimension.key,
      letter: pole.letter,
      label: pole.label,
      description: pole.description,
      score,
    };
  });

  return {
    mainIdentity,
    secondaryIdentity,
    identityScores,
    dimensionScores,
    typeCode: dimensions.map((dimension) => dimension.letter).join(""),
    dimensions,
    persona,
  };
}
```

- [ ] **Step 4: Run scoring and validation tests**

Run:

```bash
npm test -- tests/questionBank.test.ts tests/scoring.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit scoring engine**

```bash
git add src/scoring.ts tests/scoring.test.ts
git commit -m "feat: implement quiz scoring"
```

---

### Task 4: Quiz Flow UI

**Files:**
- Modify: `src/app.ts`
- Modify: `src/styles.css`
- Create: `tests/app.test.ts`

- [ ] **Step 1: Write failing app flow tests**

Create `tests/app.test.ts`:

```ts
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
```

- [ ] **Step 2: Run app tests and verify failure**

Run:

```bash
npm test -- tests/app.test.ts
```

Expected: FAIL because the current app only renders the start screen.

- [ ] **Step 3: Implement quiz flow and result rendering**

Replace `src/app.ts` with:

```ts
import { PERSONAS, IDENTITY_LABELS } from "./data/personas";
import { QUESTIONS } from "./data/questions";
import { calculateResult } from "./scoring";
import type { Question, QuizResult } from "./types";

type Screen = "start" | "quiz" | "result";

interface AppState {
  screen: Screen;
  currentIndex: number;
  answers: Record<string, string>;
  error: string;
  result: QuizResult | null;
}

export function createApp(root: HTMLElement, questions: Question[] = QUESTIONS): void {
  const state: AppState = {
    screen: "start",
    currentIndex: 0,
    answers: {},
    error: "",
    result: null,
  };

  const render = () => {
    if (state.screen === "start") renderStart(root, state, render);
    if (state.screen === "quiz") renderQuiz(root, questions, state, render);
    if (state.screen === "result") renderResult(root, state, render);
  };

  render();
}

function renderStart(root: HTMLElement, state: AppState, render: () => void): void {
  root.innerHTML = `
    <main class="app-shell hero-shell">
      <section class="start-panel">
        <p class="eyebrow">AI Preference Test</p>
        <h1>AI 使用偏好测试</h1>
        <p class="subtitle">16 题，约 3-5 分钟，测出你更习惯如何使用 AI 与 Agent。</p>
        <div class="start-meta">
          <span>本地计算</span>
          <span>不保存答案</span>
          <span>生成分享海报</span>
        </div>
        <button type="button" class="primary-button" data-action="start">开始测试</button>
      </section>
    </main>
  `;

  root.querySelector("[data-action='start']")?.addEventListener("click", () => {
    state.screen = "quiz";
    render();
  });
}

function renderQuiz(root: HTMLElement, questions: Question[], state: AppState, render: () => void): void {
  const question = questions[state.currentIndex];
  const selected = state.answers[question.id];
  const progress = Math.round(((state.currentIndex + 1) / questions.length) * 100);

  root.innerHTML = `
    <main class="app-shell">
      <section class="quiz-panel">
        <div class="quiz-topline">
          <span>第 ${state.currentIndex + 1} / ${questions.length} 题</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div>
        <h2>${question.prompt}</h2>
        <div class="option-list">
          ${question.options
            .map(
              (option) => `
                <button
                  type="button"
                  class="option-button ${selected === option.id ? "selected" : ""}"
                  data-option-id="${option.id}"
                  aria-pressed="${selected === option.id ? "true" : "false"}"
                >
                  <span>${option.id.toUpperCase()}</span>
                  <strong>${option.text}</strong>
                </button>
              `,
            )
            .join("")}
        </div>
        ${state.error ? `<p class="inline-error" role="alert">${state.error}</p>` : ""}
        <div class="nav-row">
          <button type="button" class="secondary-button" data-action="prev" ${state.currentIndex === 0 ? "disabled" : ""}>上一题</button>
          <button type="button" class="primary-button" data-action="next">
            ${state.currentIndex === questions.length - 1 ? "查看结果" : "下一题"}
          </button>
        </div>
      </section>
    </main>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-option-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.answers[question.id] = button.dataset.optionId ?? "";
      state.error = "";
      render();
    });
  });

  root.querySelector("[data-action='prev']")?.addEventListener("click", () => {
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    state.error = "";
    render();
  });

  root.querySelector("[data-action='next']")?.addEventListener("click", () => {
    if (!state.answers[question.id]) {
      state.error = "请先选择一个最像你的选项";
      render();
      return;
    }

    if (state.currentIndex < questions.length - 1) {
      state.currentIndex += 1;
      state.error = "";
      render();
      return;
    }

    try {
      state.result = calculateResult(questions, PERSONAS, state.answers);
      state.screen = "result";
      state.error = "";
    } catch {
      state.error = "结果计算失败，请返回检查答案或重新测试。";
    }
    render();
  });
}

function scoreRows(result: QuizResult): string {
  return Object.entries(result.identityScores)
    .map(([key, value]) => `<li><span>${IDENTITY_LABELS[key as keyof typeof IDENTITY_LABELS]}</span><strong>${value}</strong></li>`)
    .join("");
}

function renderResult(root: HTMLElement, state: AppState, render: () => void): void {
  const result = state.result;
  if (!result) {
    root.innerHTML = `<main class="app-shell"><p class="inline-error">结果计算失败，请重新测试。</p></main>`;
    return;
  }

  root.innerHTML = `
    <main class="result-shell">
      <section class="poster-card" id="result-poster" aria-label="结果海报">
        <p class="poster-kicker">YOUR AI PERSONA</p>
        <h1>${result.persona.title}</h1>
        <p class="poster-code">${result.typeCode} · ${result.persona.identityLine}</p>
        <div class="keyword-row">${result.persona.keywords.map((keyword) => `<span>${keyword}</span>`).join("")}</div>
        <p class="poster-line">${result.persona.goldenLine}</p>
      </section>

      <section class="result-details">
        <p class="eyebrow">你的 AI 使用人格</p>
        <h2>${result.persona.title}</h2>
        <p>${result.persona.summary}</p>
        <div class="action-row">
          <button type="button" class="primary-button" data-action="download-poster">生成结果图片</button>
          <button type="button" class="secondary-button" data-action="restart">重新测试</button>
        </div>
        ${state.error ? `<p class="inline-error" role="alert">${state.error}</p>` : ""}

        <div class="detail-grid">
          <article>
            <h3>身份分数</h3>
            <ul class="score-list">${scoreRows(result)}</ul>
          </article>
          <article>
            <h3>四字母偏好</h3>
            <ul>${result.dimensions.map((dimension) => `<li><strong>${dimension.letter} · ${dimension.label}</strong>：${dimension.description}</li>`).join("")}</ul>
          </article>
          <article>
            <h3>优势</h3>
            <ul>${result.persona.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
          </article>
          <article>
            <h3>风险</h3>
            <ul>${result.persona.risks.map((item) => `<li>${item}</li>`).join("")}</ul>
          </article>
        </div>

        <article class="advice-panel">
          <h3>3 条 AI 使用建议</h3>
          <ol>${result.persona.advice.map((item) => `<li>${item}</li>`).join("")}</ol>
        </article>

        <aside class="advanced-note">
          <strong>进阶测试暂未开放</strong>
          <span>当前版本先提供快测结果，未来可扩展更细的 Agent 信任、工具调用和验证偏好。</span>
        </aside>
      </section>
    </main>
  `;

  root.querySelector("[data-action='restart']")?.addEventListener("click", () => {
    state.screen = "start";
    state.currentIndex = 0;
    state.answers = {};
    state.error = "";
    state.result = null;
    render();
  });
}
```

- [ ] **Step 4: Extend responsive styles**

Append to `src/styles.css`:

```css
.hero-shell {
  background:
    radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.16), transparent 32%),
    radial-gradient(circle at 82% 28%, rgba(249, 115, 22, 0.16), transparent 28%),
    #f8fafc;
}

.start-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 28px;
}

.start-meta span,
.keyword-row span {
  border-radius: 999px;
  padding: 8px 12px;
  background: #ede9fe;
  color: #5b21b6;
  font-weight: 800;
  font-size: 0.9rem;
}

.quiz-panel,
.result-details {
  width: min(860px, 100%);
  padding: 32px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.1);
}

.quiz-topline,
.nav-row,
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.progress-track {
  height: 10px;
  margin: 14px 0 28px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7c3aed, #f97316);
}

.option-list {
  display: grid;
  gap: 12px;
  margin: 24px 0;
}

.option-button {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 14px;
  align-items: center;
  width: 100%;
  min-height: 70px;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  color: #111827;
  text-align: left;
  cursor: pointer;
}

.option-button span {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #f1f5f9;
  font-weight: 900;
}

.option-button strong {
  line-height: 1.5;
}

.option-button.selected {
  border-color: #7c3aed;
  background: #f5f3ff;
}

.secondary-button {
  min-height: 48px;
  padding: 0 18px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #334155;
  font-weight: 800;
  cursor: pointer;
}

.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.inline-error {
  padding: 12px 14px;
  border-radius: 12px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 800;
}

.result-shell {
  min-height: 100vh;
  padding: 28px;
  display: grid;
  gap: 24px;
  justify-items: center;
  background: #f8fafc;
}

.poster-card {
  width: min(520px, 100%);
  min-height: 620px;
  padding: 34px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 30px;
  color: #ffffff;
  background: linear-gradient(135deg, #111827 0%, #7c3aed 58%, #f97316 100%);
  box-shadow: 0 28px 90px rgba(88, 28, 135, 0.3);
}

.poster-kicker {
  margin: 0 0 auto;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  opacity: 0.82;
}

.poster-card h1 {
  font-size: clamp(3rem, 14vw, 5.2rem);
}

.poster-code,
.poster-line {
  font-size: 1.1rem;
  line-height: 1.6;
}

.keyword-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0;
}

.keyword-row span {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.detail-grid article,
.advice-panel,
.advanced-note {
  padding: 20px;
  border-radius: 16px;
  background: #f8fafc;
}

.score-list {
  padding: 0;
  list-style: none;
}

.score-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.advanced-note {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  color: #475569;
}

@media (max-width: 720px) {
  .quiz-panel,
  .result-details {
    padding: 22px 16px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .quiz-topline,
  .nav-row,
  .action-row {
    align-items: stretch;
    flex-direction: column;
  }

  .nav-row button,
  .action-row button {
    width: 100%;
  }
}
```

- [ ] **Step 5: Run app tests**

Run:

```bash
npm test -- tests/app.test.ts tests/smoke.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit quiz UI**

```bash
git add src/app.ts src/styles.css tests/app.test.ts
git commit -m "feat: build quiz flow UI"
```

---

### Task 5: Result Poster Image Generation

**Files:**
- Create: `src/poster.ts`
- Modify: `src/app.ts`
- Create: `tests/poster.test.ts`

- [ ] **Step 1: Write failing poster tests**

Create `tests/poster.test.ts`:

```ts
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
```

- [ ] **Step 2: Run poster tests and verify failure**

Run:

```bash
npm test -- tests/poster.test.ts
```

Expected: FAIL because `src/poster.ts` does not exist.

- [ ] **Step 3: Implement SVG and PNG download helpers**

Create `src/poster.ts`:

```ts
import type { QuizResult } from "./types";

const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1350;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function keywordText(result: QuizResult): string {
  return result.persona.keywords.join(" · ");
}

export function buildPosterSvg(result: QuizResult): string {
  const title = escapeXml(result.persona.title);
  const typeLine = escapeXml(`${result.typeCode} · ${result.persona.identityLine}`);
  const keywords = escapeXml(keywordText(result));
  const goldenLine = escapeXml(result.persona.goldenLine);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="58%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="32" stdDeviation="30" flood-color="#1f0f46" flood-opacity="0.32"/>
    </filter>
  </defs>
  <rect width="1080" height="1350" rx="72" fill="url(#bg)"/>
  <circle cx="910" cy="150" r="190" fill="#ffffff" opacity="0.12"/>
  <circle cx="120" cy="1030" r="260" fill="#ffffff" opacity="0.09"/>
  <g filter="url(#shadow)">
    <rect x="78" y="78" width="924" height="1194" rx="54" fill="#ffffff" opacity="0.10" stroke="#ffffff" stroke-opacity="0.28"/>
  </g>
  <text x="120" y="160" fill="#ffffff" opacity="0.82" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="34" font-weight="800" letter-spacing="5">YOUR AI PERSONA</text>
  <text x="120" y="560" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="118" font-weight="900">${title}</text>
  <text x="120" y="660" fill="#ffffff" opacity="0.92" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="46" font-weight="800">${typeLine}</text>
  <rect x="120" y="730" width="840" height="86" rx="43" fill="#ffffff" opacity="0.16"/>
  <text x="160" y="785" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="34" font-weight="700">${keywords}</text>
  <foreignObject x="120" y="880" width="840" height="230">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,'Microsoft YaHei',sans-serif;color:#fff;font-size:42px;font-weight:800;line-height:1.45;">
      ${goldenLine}
    </div>
  </foreignObject>
  <text x="120" y="1210" fill="#ffffff" opacity="0.72" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="28" font-weight="700">AI 使用偏好测试 · 本地计算 · 不保存答案</text>
</svg>`.trim();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadPosterImage(result: QuizResult): Promise<void> {
  const svg = buildPosterSvg(result);
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Poster image failed to load"));
    });
    image.src = svgUrl;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = POSTER_WIDTH;
    canvas.height = POSTER_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available");
    }

    context.drawImage(image, 0, 0);
    const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!pngBlob) {
      throw new Error("PNG export failed");
    }

    downloadBlob(pngBlob, `ai-persona-${result.typeCode}.png`);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
```

- [ ] **Step 4: Integrate poster button**

In `src/app.ts`, add this import:

```ts
import { downloadPosterImage } from "./poster";
```

In `renderResult`, after the restart button listener, add:

```ts
  root.querySelector("[data-action='download-poster']")?.addEventListener("click", async () => {
    try {
      await downloadPosterImage(result);
      state.error = "";
    } catch {
      state.error = "结果图片生成失败，可以先使用截图保存海报。";
      render();
    }
  });
```

- [ ] **Step 5: Run poster and app tests**

Run:

```bash
npm test -- tests/poster.test.ts tests/app.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit poster generation**

```bash
git add src/poster.ts src/app.ts tests/poster.test.ts
git commit -m "feat: add result poster export"
```

---

### Task 6: README, Build Verification, And Browser QA

**Files:**
- Create: `README.md`
- Modify: `src/styles.css` if browser QA finds layout issues.

- [ ] **Step 1: Create README**

Create `README.md`:

```md
# AI 使用偏好测试

一个本地运行的 AI 使用偏好快测网页。用户完成 16 道题后，会得到中文人格称号、轻量四字母代码、主副身份解释和可下载结果海报。

## 功能

- 16 题 AI 使用偏好快测
- 本地浏览器内评分
- 不登录、不上传、不保存测试数据
- 结果页包含人格海报、优势、风险和 3 条建议
- 支持生成结果图片
- 预留进阶测试入口

## 本地运行

```bash
npm install
npm run dev
```

启动后打开终端里显示的本地地址。Vite 默认会提供类似 `http://localhost:5173/` 的地址。

## 测试

```bash
npm test
```

## 构建

```bash
npm run build
```

构建产物会生成到 `dist/`。这是纯前端静态站点，后续可以部署到静态托管平台。

## 隐私说明

当前版本所有答题、评分和结果生成都在浏览器本地完成。项目不包含账号、后端数据库或远端统计。

## 当前边界

- 进阶测试入口仅做预留。
- 暂不支持结果链接复现。
- 暂不做匿名统计。
```

- [ ] **Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS for `smoke`, `questionBank`, `scoring`, `poster`, and `app` tests.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS and `dist/` is created.

- [ ] **Step 4: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 5: Browser QA desktop**

Open the local URL in the Codex in-app browser and verify:

- Start page shows title, privacy badges, and start button.
- Quiz page shows `第 1 / 16 题`, progress bar, and 4 options.
- Clicking next without a choice shows `请先选择一个最像你的选项`.
- Completing 16 answers reaches result page.
- Result page shows poster, details, suggestions, restart, and `进阶测试暂未开放`.
- Clicking generate result image downloads a file named like `ai-persona-CEPV.png`; if browser blocks export, the page shows `结果图片生成失败，可以先使用截图保存海报。`.

- [ ] **Step 6: Browser QA mobile width**

Use a narrow viewport around 390px width and verify:

- Start page text does not overlap.
- Quiz option text wraps cleanly inside buttons.
- Result poster stays inside viewport width.
- Detail cards stack into one column.
- Buttons are tappable and not squeezed.

- [ ] **Step 7: Commit README and QA fixes**

```bash
git add README.md src/styles.css
git commit -m "docs: add local run instructions"
```

If `src/styles.css` did not change during QA, run:

```bash
git add README.md
git commit -m "docs: add local run instructions"
```

---

## Final Verification Before Handoff

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `git status --short` and confirm only intentional files are changed.
- [ ] Report the local URL used for browser QA.
- [ ] Report whether poster download produced PNG or showed the fallback error.
