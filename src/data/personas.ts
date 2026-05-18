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
    positive: { letter: "D", label: "委托型", description: "更愿意把任务交给 AI 推进，再检查关键结果。" },
    negative: { letter: "C", label: "掌控型", description: "更愿意自己掌握节奏，让 AI 执行明确片段。" },
  },
  {
    key: "tempo",
    positive: { letter: "E", label: "探索型", description: "倾向先扩展可能性，再筛选方向。" },
    negative: { letter: "F", label: "完成型", description: "倾向尽快收束方案，把任务推进到完成。" },
  },
  {
    key: "output",
    positive: { letter: "I", label: "整合型", description: "偏好让 AI 汇总信息、提炼结构和连接线索。" },
    negative: { letter: "P", label: "产出型", description: "偏好让 AI 直接生成内容、代码、草稿或方案。" },
  },
  {
    key: "risk",
    positive: { letter: "O", label: "开放试错型", description: "愿意快速试不同提示、工具和 Agent 工作流。" },
    negative: { letter: "V", label: "谨慎验证型", description: "更重视检查来源、边界和结果可靠性。" },
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
