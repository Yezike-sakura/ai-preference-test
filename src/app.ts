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
