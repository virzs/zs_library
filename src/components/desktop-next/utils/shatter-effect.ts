interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

const PARTICLE_GRID = 8;
const ANIMATION_DURATION = 600;
const SPREAD_FORCE = 2.5;
const GRAVITY = 0.15;

function loadCorsImage(src: string, timeout = 3000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve(null);
    }, timeout);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

function extractColorsFromImage(
  img: HTMLImageElement,
  gridCols: number,
  gridRows: number,
): string[][] | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = gridCols;
    canvas.height = gridRows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, gridCols, gridRows);
    const imageData = ctx.getImageData(0, 0, gridCols, gridRows);
    const { data } = imageData;

    const colors: string[][] = [];
    for (let row = 0; row < gridRows; row++) {
      colors[row] = [];
      for (let col = 0; col < gridCols; col++) {
        const idx = (row * gridCols + col) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3] / 255;
        if (a < 0.1) {
          colors[row][col] = "rgba(150, 150, 150, 0.6)";
        } else {
          colors[row][col] = `rgba(${r}, ${g}, ${b}, ${Math.max(a, 0.6)})`;
        }
      }
    }
    return colors;
  } catch {
    // canvas tainted by cross-origin image
    return null;
  }
}

function sampleColorsFromDOM(
  element: Element,
  gridCols: number,
  gridRows: number,
): string[][] {
  const colors: string[][] = [];

  const collectedColors: string[] = [];
  const children = element.querySelectorAll("*");
  children.forEach((child) => {
    const style = window.getComputedStyle(child);
    for (const prop of ["backgroundColor", "color"] as const) {
      const val = style[prop];
      if (val && val !== "rgba(0, 0, 0, 0)" && val !== "transparent") {
        collectedColors.push(val);
      }
    }
  });

  const fallback = collectedColors.length > 0
    ? collectedColors
    : ["rgba(150, 150, 150, 0.8)"];

  for (let row = 0; row < gridRows; row++) {
    colors[row] = [];
    for (let col = 0; col < gridCols; col++) {
      colors[row][col] = fallback[(row * gridCols + col) % fallback.length];
    }
  }

  return colors;
}

async function sampleElementColors(
  element: Element,
  gridCols: number,
  gridRows: number,
): Promise<string[][]> {
  const img = element.querySelector("img");
  if (img) {
    const src = img.src || img.getAttribute("src");
    if (src) {
      if (img.crossOrigin === "anonymous" && img.complete && img.naturalWidth > 0) {
        const fromDirect = extractColorsFromImage(img, gridCols, gridRows);
        if (fromDirect) return fromDirect;
      }

      const corsImg = await loadCorsImage(src);
      if (corsImg) {
        const fromCors = extractColorsFromImage(corsImg, gridCols, gridRows);
        if (fromCors) return fromCors;
      }
    }
  }

  return sampleColorsFromDOM(element, gridCols, gridRows);
}

function createParticles(rect: DOMRect, colors: string[][]): Particle[] {
  const particles: Particle[] = [];
  const gridRows = colors.length;
  const gridCols = colors[0]?.length ?? PARTICLE_GRID;
  const cellW = rect.width / gridCols;
  const cellH = rect.height / gridRows;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const x = col * cellW;
      const y = row * cellH;

      const dx = x + cellW / 2 - centerX;
      const dy = y + cellH / 2 - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const normalizedDx = dx / dist;
      const normalizedDy = dy / dist;

      const force = SPREAD_FORCE * (0.5 + Math.random());

      particles.push({
        x,
        y,
        size: Math.max(cellW, cellH) * (0.6 + Math.random() * 0.5),
        color: colors[row][col],
        vx: normalizedDx * force + (Math.random() - 0.5) * 1.5,
        vy: normalizedDy * force + (Math.random() - 0.5) * 1.5 - 1,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
      });
    }
  }

  return particles;
}

export async function playShatterEffect(element: Element): Promise<void> {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const colors = await sampleElementColors(element, PARTICLE_GRID, PARTICLE_GRID);
  const particles = createParticles(rect, colors);

  if (element instanceof HTMLElement) {
    element.style.visibility = "hidden";
  }

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    pointer-events: none;
    z-index: 10000;
    overflow: visible;
  `;
  document.body.appendChild(container);

  const particleEls = particles.map((p) => {
    const el = document.createElement("div");
    el.style.cssText = `
      position: absolute;
      left: ${p.x}px;
      top: ${p.y}px;
      width: ${p.size}px;
      height: ${p.size}px;
      background: ${p.color};
      border-radius: 2px;
      pointer-events: none;
      will-change: transform, opacity;
    `;
    container.appendChild(el);
    return el;
  });

  return new Promise((resolve) => {
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const el = particleEls[i];

        const currentX = p.x + p.vx * ease * 60;
        const currentY = p.y + p.vy * ease * 60 + GRAVITY * ease * ease * 60 * 30;
        const currentOpacity = 1 - ease;
        const currentScale = 1 - ease * 0.7;
        const currentRotation = p.rotation + p.rotationSpeed * ease * 10;

        el.style.transform = `translate(${currentX - p.x}px, ${currentY - p.y}px) scale(${currentScale}) rotate(${currentRotation}deg)`;
        el.style.opacity = String(currentOpacity);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        container.remove();
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}
