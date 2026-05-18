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

function wrapEscapedText(value: string, maxCharacters: number): string[] {
  const normalized = value.replace(/\s+/g, " ").trim();
  const characters = Array.from(normalized);
  const lines: string[] = [];

  for (let index = 0; index < characters.length; index += maxCharacters) {
    lines.push(escapeXml(characters.slice(index, index + maxCharacters).join("").trim()));
  }

  return lines.length > 0 ? lines : [""];
}

function renderTspans(lines: string[], x: number, lineHeight: number): string {
  return lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`)
    .join("\n    ");
}

export function buildPosterSvg(result: QuizResult): string {
  const titleLines = wrapEscapedText(result.persona.title, 12);
  const typeLine = escapeXml(`${result.typeCode} · ${result.persona.identityLine}`);
  const keywordLines = wrapEscapedText(keywordText(result), 30);
  const goldenLines = wrapEscapedText(result.persona.goldenLine, 23);

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
  <text x="120" y="560" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="118" font-weight="900">
    ${renderTspans(titleLines, 120, 124)}
  </text>
  <text x="120" y="660" fill="#ffffff" opacity="0.92" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="46" font-weight="800">${typeLine}</text>
  <rect x="120" y="730" width="840" height="86" rx="43" fill="#ffffff" opacity="0.16"/>
  <text x="160" y="785" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="34" font-weight="700">
    ${renderTspans(keywordLines, 160, 44)}
  </text>
  <text x="120" y="920" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="42" font-weight="800">
    ${renderTspans(goldenLines, 120, 61)}
  </text>
  <text x="120" y="1210" fill="#ffffff" opacity="0.72" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="28" font-weight="700">AI 使用偏好测试 · 本地计算 · 不保存答案</text>
</svg>`.trim();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  try {
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
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
