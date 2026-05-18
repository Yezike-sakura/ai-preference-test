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
