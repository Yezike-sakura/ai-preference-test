import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initParticleBackground } from "../src/particles";

const context = {
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  fill: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  setTransform: vi.fn(),
  stroke: vi.fn(),
};

describe("particle background", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it("adds an aria-hidden canvas and starts drawing particles", () => {
    const canvas = initParticleBackground(document.body);

    expect(canvas.id).toBe("particle-canvas");
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.style.zIndex).toBe("0");
    expect(canvas.style.pointerEvents).toBe("none");
    expect(document.body.contains(canvas)).toBe(true);
    expect(context.setTransform).toHaveBeenCalled();
    expect(context.arc).toHaveBeenCalled();
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });
});
