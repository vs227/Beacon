export type TypographyVortexMode = "dark" | "light";

export type TypographyVortexOptions = {
  mode: TypographyVortexMode;
  phrase: string;
  speed: number;
  ringGrowth: number;
  opacity: number;
  dissolveRadius: number;
  particleAmount: number;
  suctionDuration: number;
};

function resolveMode(mode: TypographyVortexOptions["mode"] | number | string | undefined): TypographyVortexMode {
  if (mode === "light" || mode === 1 || mode === "1") return "light";
  return "dark";
}

type Ring = {
  radius: number;
  fontSize: number;
  alpha: number;
  speed: number;
  offset: number;
  spacing: number;
  wobble: number;
  bitmap: HTMLCanvasElement;
  size: number;
};

type Stray = {
  radius: number;
  angle: number;
  speed: number;
  character: string;
  alpha: number;
  fontSize: number;
};

type Dust = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  life: number;
  maxLife: number;
  phase: number;
  spin: number;
  color: string;
  sucked: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = seed + 0x6d2b79f5 | 0;
  let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
  value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};

export function createTypographyVortexRenderer(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  getOptions: () => TypographyVortexOptions,
) {
  const context = canvas.getContext("2d");
  const layer = document.createElement("canvas");
  const layerContext = layer.getContext("2d", { willReadFrequently: true });
  if (!context || !layerContext) return () => undefined;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const pointer = { x: 0, y: 0, inside: false };
  const suction = { x: 0, y: 0, started: 0, until: 0 };
  let width = 0;
  let height = 0;
  let rings: Ring[] = [];
  let strays: Stray[] = [];
  let particles: Dust[] = [];
  let dissolve = 0;
  let lastSpawn = 0;
  let lastAmbientSpawn = 0;
  let lastTime = 0;
  let stateFrame = 0;
  let frame = 0;
  let visible = true;
  let renderSignature = "";

  const buildRings = () => {
    const options = getOptions();
    const phrase = options.phrase || "SABLE / SYSTEMS IN MOTION / ";
    const random = mulberry32(7 * 17 + 3);
    const fontFamily = '"ThreeUI Fragment Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
    const ringPixelRatio = Math.max(pixelRatio, 1.5);
    const maximumRadius = Math.hypot(Math.max(width * 0.55, width * 0.48), Math.max(height * 0.52, height * 0.5)) + 40;
    rings = [];
    let radius = Math.max(26, width * 0.038);
    let index = 0;
    while (radius < maximumRadius) {
      const sparse = index % 3 === 2;
      const ringBase = {
        radius,
        fontSize: clamp(8 + radius * 0.016, 8, 18),
        alpha: clamp(0.75 + (radius / maximumRadius) * 0.25, 0.80, 1.0) * (sparse ? 0.88 : 1) * options.opacity,
        speed: (0.05 + 40 / (radius + 60)) * 0.35,
        offset: random() * Math.PI * 2,
        spacing: sparse ? 2.4 + random() * 1.2 : 1.02 + random() * 0.14,
        wobble: random() * Math.PI * 2,
      };
      const size = Math.ceil((ringBase.radius + ringBase.fontSize * 2) * 2);
      const bitmap = document.createElement("canvas");
      bitmap.width = bitmap.height = Math.ceil(size * ringPixelRatio);
      const bitmapContext = bitmap.getContext("2d");
      if (!bitmapContext) break;
      bitmapContext.scale(ringPixelRatio, ringPixelRatio);
      bitmapContext.translate(size / 2, size / 2);
      bitmapContext.font = `600 ${ringBase.fontSize}px ${fontFamily}`;
      bitmapContext.textAlign = "center";
      bitmapContext.textBaseline = "middle";
      const ink = resolveMode(options.mode) === "light" ? "42,44,52" : "255,255,255";
      bitmapContext.fillStyle = `rgba(${ink},${ringBase.alpha})`;
      const step = (ringBase.fontSize * 0.62 * ringBase.spacing) / ringBase.radius;
      const count = Math.max(4, Math.floor((Math.PI * 2) / step));
      const actualStep = (Math.PI * 2) / count;
      for (let characterIndex = 0; characterIndex < count; characterIndex += 1) {
        const angle = characterIndex * actualStep;
        const character = phrase[characterIndex % phrase.length];
        if (character === " ") continue;
        bitmapContext.save();
        bitmapContext.translate(Math.cos(angle) * ringBase.radius, Math.sin(angle) * ringBase.radius);
        bitmapContext.rotate(angle + Math.PI / 2);
        bitmapContext.fillText(character, 0, 0);
        bitmapContext.restore();
      }
      rings.push({ ...ringBase, bitmap, size });
      radius *= Math.max(1.08, options.ringGrowth);
      index += 1;
    }

    strays = [];
    for (let strayIndex = 0; strayIndex < 34; strayIndex += 1) {
      strays.push({
        radius: 30 + random() * (maximumRadius - 60),
        angle: random() * Math.PI * 2,
        speed: (random() - 0.5) * 0.06,
        character: phrase[(random() * phrase.length) | 0],
        alpha: (0.65 + random() * 0.35) * options.opacity,
        fontSize: 9 + random() * 6,
      });
    }
  };

  const resize = () => {
    const bounds = host.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    layer.width = Math.round(width * pixelRatio);
    layer.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    layerContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = [];
    renderSignature = "";
  };

  const spawnPointerDust = (time: number, radius: number) => {
    return;
  };

  const spawnAmbientDust = (time: number, ambientWidth: number) => {
    return;
  };

  const updateDust = (time: number, deltaTime: number) => {
    return;
  };

  const draw = (time: number) => {
    const options = getOptions();
    const isLight = resolveMode(options.mode) === "light";
    const signature = `${options.mode}|${options.phrase}|${options.ringGrowth}|${options.opacity}|${width}|${height}`;
    if (signature !== renderSignature) {
      renderSignature = signature;
      buildRings();
    }
    context.clearRect(0, 0, width, height);
    // Transparent background — no opaque solid fill
    layerContext.clearRect(0, 0, width, height);
    const deltaTime = Math.min(time - (lastTime || time), 100);
    lastTime = time;
    const dissolveTarget = pointer.inside && !reduced ? 1 : 0;
    dissolve = lerp(dissolve, dissolveTarget, 1 - Math.pow(0.78, deltaTime / 16.6));
    if (dissolve < 0.002) dissolve = 0;
    const centerX = width * 0.52;
    const centerY = height * 0.485;
    const seconds = time / 1000 * options.speed;
    const guideInk = isLight ? "42,44,52" : "255,255,255";
    const strayInk = isLight ? "48,50,58" : "255,255,255";

    context.save();
    context.translate(centerX, centerY);
    context.strokeStyle = `rgba(${guideInk},${(isLight ? 0.1 : 0.14) * options.opacity})`;
    context.lineWidth = 1;
    context.setLineDash([1, 5]);
    for (const ring of rings) {
      context.beginPath();
      context.arc(0, 0, ring.radius * 1.115, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();

    layerContext.save();
    layerContext.translate(centerX, centerY);
    for (const ring of rings) {
      const base = ring.offset + seconds * ring.speed + Math.sin(seconds * 0.11 + ring.wobble) * 0.02;
      layerContext.save();
      layerContext.rotate(base);
      layerContext.drawImage(ring.bitmap, -ring.size / 2, -ring.size / 2, ring.size, ring.size);
      layerContext.restore();
    }
    const fontFamily = '"ThreeUI Fragment Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
    layerContext.textAlign = "center";
    layerContext.textBaseline = "middle";
    for (const stray of strays) {
      const angle = stray.angle + seconds * stray.speed;
      layerContext.font = `600 ${stray.fontSize}px ${fontFamily}`;
      layerContext.fillStyle = `rgba(${strayInk},${stray.alpha})`;
      layerContext.save();
      layerContext.translate(Math.cos(angle) * stray.radius, Math.sin(angle) * stray.radius);
      layerContext.rotate(angle + Math.PI / 2);
      layerContext.fillText(stray.character, 0, 0);
      layerContext.restore();
    }
    layerContext.restore();

    const ambientWidth = clamp(width * 0.22, 108, 180);
    const radius = clamp(Math.min(width, height) * 0.24, 128, 196) * options.dissolveRadius;
    spawnAmbientDust(time, ambientWidth);
    spawnPointerDust(time, radius);

    if (!reduced) {
      layerContext.save();
      layerContext.globalCompositeOperation = "destination-out";
      const ambientMask = layerContext.createLinearGradient(0, 0, ambientWidth, 0);
      ambientMask.addColorStop(0, "rgba(0,0,0,.98)");
      ambientMask.addColorStop(0.34, "rgba(0,0,0,.88)");
      ambientMask.addColorStop(0.72, "rgba(0,0,0,.36)");
      ambientMask.addColorStop(1, "rgba(0,0,0,0)");
      layerContext.fillStyle = ambientMask;
      layerContext.fillRect(0, 0, ambientWidth, height);
      layerContext.restore();
    }

    if (dissolve > 0.002) {
      const maskedRadius = radius * (0.42 + dissolve * 0.58);
      layerContext.save();
      layerContext.globalCompositeOperation = "destination-out";
      const mask = layerContext.createRadialGradient(pointer.x, pointer.y, maskedRadius * 0.06, pointer.x, pointer.y, maskedRadius);
      mask.addColorStop(0, "rgba(0,0,0,1)");
      mask.addColorStop(0.57, "rgba(0,0,0,.98)");
      mask.addColorStop(0.84, "rgba(0,0,0,.42)");
      mask.addColorStop(1, "rgba(0,0,0,0)");
      layerContext.fillStyle = mask;
      layerContext.beginPath();
      layerContext.arc(pointer.x, pointer.y, maskedRadius, 0, Math.PI * 2);
      layerContext.fill();
      layerContext.restore();
    }

    context.drawImage(layer, 0, 0, layer.width, layer.height, 0, 0, width, height);
    updateDust(time, deltaTime);
    if (dissolve > 0.02) {
      context.save();
      const dissolveInk = isLight ? "42,44,52" : "210,210,205";
      context.strokeStyle = `rgba(${dissolveInk},${(0.08 + dissolve * 0.13) * options.opacity})`;
      context.lineWidth = 1;
      context.setLineDash([2, 6]);
      context.beginPath();
      context.arc(pointer.x, pointer.y, radius * (0.42 + dissolve * 0.58), 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    if (++stateFrame % 5 === 0) {
      const suctionActive = !reduced && time < suction.until;
      host.dataset.dissolveState = reduced ? "reduced" : suctionActive ? "suction" : pointer.inside ? "active" : dissolve > 0.02 ? "recovering" : "ambient";
      host.dataset.suctionState = suctionActive ? "active" : "idle";
      host.dataset.particles = String(particles.length);
      host.dataset.dissolveStrength = dissolve.toFixed(2);
    }
  };

  const animate = (time: number) => {
    draw(time);
    frame = visible && !document.hidden ? requestAnimationFrame(animate) : 0;
  };
  const locatePointer = (event: PointerEvent) => {
    const bounds = host.getBoundingClientRect();
    pointer.x = clamp(event.clientX - bounds.left, 0, bounds.width);
    pointer.y = clamp(event.clientY - bounds.top, 0, bounds.height);
    pointer.inside = true;
  };
  const onPointerLeave = () => { pointer.inside = false; };
  const onPointerDown = (event: PointerEvent) => {
    locatePointer(event);
    const options = getOptions();
    suction.x = pointer.x;
    suction.y = pointer.y;
    suction.started = performance.now();
    suction.until = suction.started + options.suctionDuration;
    for (const particle of particles) {
      particle.sucked = true;
      particle.life = Math.max(particle.life, options.suctionDuration + 20);
      particle.maxLife = Math.max(particle.maxLife, options.suctionDuration + 20);
    }
    host.dataset.suctionState = "active";
  };
  const onVisibility = () => {
    if (!document.hidden && visible && !frame) frame = requestAnimationFrame(animate);
  };
  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    if (visible && !frame && !document.hidden) frame = requestAnimationFrame(animate);
    if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });

  host.addEventListener("pointerenter", locatePointer);
  host.addEventListener("pointermove", locatePointer);
  host.addEventListener("pointerleave", onPointerLeave);
  host.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("visibilitychange", onVisibility);
  resizeObserver.observe(host);
  intersectionObserver.observe(host);
  resize();
  frame = requestAnimationFrame(animate);

  return () => {
    if (frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    host.removeEventListener("pointerenter", locatePointer);
    host.removeEventListener("pointermove", locatePointer);
    host.removeEventListener("pointerleave", onPointerLeave);
    host.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
