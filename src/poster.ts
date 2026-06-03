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
      <stop offset="0%" stop-color="#06111f"/>
      <stop offset="58%" stop-color="#0b60ff"/>
      <stop offset="100%" stop-color="#00c2ff"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="32" stdDeviation="30" flood-color="#003a8f" flood-opacity="0.34"/>
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

function isLikelyMobileBrowser(): boolean {
  const userAgent = navigator.userAgent;
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(userAgent);
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;

  return mobileUserAgent || coarsePointer;
}

function openMobilePreviewWindow(): Window | null {
  if (!isLikelyMobileBrowser()) {
    return null;
  }

  const previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    return null;
  }

  previewWindow.document.write(`
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>正在生成结果图片</title>
    <style>
      body {
        margin: 0;
        min-height: 100dvh;
        display: grid;
        place-items: center;
        background: #eaf7ff;
        color: #07111f;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      p { padding: 24px; font-size: 18px; font-weight: 700; text-align: center; }
    </style>
  </head>
  <body>
    <p>结果图片生成中...</p>
  </body>
</html>`);
  previewWindow.document.close();

  return previewWindow;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Poster image preview failed"));
    reader.readAsDataURL(blob);
  });
}

async function tryShareBlob(blob: Blob, filename: string): Promise<boolean> {
  if (!("File" in window)) {
    return false;
  }

  const file = new File([blob], filename, { type: blob.type });
  const shareData: ShareData = {
    files: [file],
    title: "AI 使用偏好测试结果",
    text: "我的 AI 协作人格结果",
  };

  if (!navigator.canShare?.(shareData) || !navigator.share) {
    return false;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }
    return false;
  }
}

async function showMobilePreview(previewWindow: Window, blob: Blob, filename: string): Promise<void> {
  const dataUrl = await readBlobAsDataUrl(blob);
  previewWindow.document.open();
  previewWindow.document.write(`
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 使用偏好测试结果图</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100dvh;
        padding: 18px;
        display: grid;
        gap: 14px;
        justify-items: center;
        background: #eaf7ff;
        color: #07111f;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .notice {
        width: min(100%, 520px);
        padding: 14px 16px;
        border: 1px solid rgba(11, 96, 255, 0.18);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.82);
        box-shadow: 0 16px 40px rgba(0, 78, 160, 0.12);
        font-size: 15px;
        line-height: 1.55;
      }
      img {
        width: min(100%, 520px);
        height: auto;
        border-radius: 22px;
        box-shadow: 0 22px 70px rgba(0, 78, 160, 0.22);
      }
      a {
        width: min(100%, 520px);
        min-height: 48px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        color: #ffffff;
        background: linear-gradient(135deg, #073cff, #00a7ff 70%, #00c2ff);
        font-size: 16px;
        font-weight: 850;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="notice">图片已生成。手机端请长按下方图片保存；如果浏览器支持，也可以点击按钮下载。</div>
    <img src="${dataUrl}" alt="AI 使用偏好测试结果图" />
    <a href="${dataUrl}" download="${filename}">下载结果图片</a>
  </body>
</html>`);
  previewWindow.document.close();
  previewWindow.focus();
}

export async function downloadPosterImage(result: QuizResult): Promise<void> {
  const mobilePreviewWindow = openMobilePreviewWindow();
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

    const filename = `ai-persona-${result.typeCode}.png`;
    if (mobilePreviewWindow) {
      await showMobilePreview(mobilePreviewWindow, pngBlob, filename);
      return;
    }

    const shared = await tryShareBlob(pngBlob, filename);
    if (!shared) {
      downloadBlob(pngBlob, filename);
    }
  } catch (error) {
    if (mobilePreviewWindow && !mobilePreviewWindow.closed) {
      mobilePreviewWindow.document.open();
      mobilePreviewWindow.document.write("<p>结果图片生成失败，请返回原页面后使用截图保存海报。</p>");
      mobilePreviewWindow.document.close();
    }
    throw error;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
