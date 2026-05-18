interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const CANVAS_ID = "particle-canvas";

function createParticles(width: number, height: number): Particle[] {
  const count = Math.max(34, Math.min(72, Math.floor((width * height) / 24000)));

  return Array.from({ length: count }, (_, index) => ({
    x: (index * 97) % Math.max(width, 1),
    y: (index * 53) % Math.max(height, 1),
    vx: Math.sin(index * 1.9) * 0.24,
    vy: Math.cos(index * 1.4) * 0.24,
    radius: 1.2 + (index % 4) * 0.42,
  }));
}

function reducedMotionEnabled(): boolean {
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export function initParticleBackground(container: HTMLElement = document.body): HTMLCanvasElement {
  const existing = document.getElementById(CANVAS_ID);
  if (existing instanceof HTMLCanvasElement) {
    return existing;
  }

  const canvas = document.createElement("canvas");
  canvas.id = CANVAS_ID;
  canvas.setAttribute("aria-hidden", "true");
  container.prepend(canvas);

  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }
  const renderingContext = context;

  let width = 0;
  let height = 0;
  let frame = 0;
  let particles: Particle[] = [];
  const reduceMotion = reducedMotionEnabled();

  function resize(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth || 1280;
    height = window.innerHeight || 800;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    renderingContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = createParticles(width, height);
  }

  function draw(): void {
    renderingContext.clearRect(0, 0, width, height);

    for (const particle of particles) {
      if (!reduceMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
      }
    }

    renderingContext.lineWidth = 1;
    for (let index = 0; index < particles.length; index += 1) {
      for (let next = index + 1; next < particles.length; next += 1) {
        const a = particles[index];
        const b = particles[next];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > 145) continue;

        renderingContext.strokeStyle = `rgba(35, 116, 207, ${0.16 * (1 - distance / 145)})`;
        renderingContext.beginPath();
        renderingContext.moveTo(a.x, a.y);
        renderingContext.lineTo(b.x, b.y);
        renderingContext.stroke();
      }
    }

    for (const [index, particle] of particles.entries()) {
      const pulse = reduceMotion ? 0 : Math.sin(frame / 28 + index) * 0.36;
      renderingContext.fillStyle = index % 3 === 0 ? "rgba(37, 99, 235, 0.44)" : "rgba(14, 165, 233, 0.34)";
      renderingContext.beginPath();
      renderingContext.arc(particle.x, particle.y, particle.radius + pulse, 0, Math.PI * 2);
      renderingContext.fill();
    }

    frame += 1;
    if (!reduceMotion) {
      window.requestAnimationFrame(draw);
    }
  }

  resize();
  draw();
  window.addEventListener("resize", resize);

  return canvas;
}
