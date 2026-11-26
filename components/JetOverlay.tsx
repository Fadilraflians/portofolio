import { useEffect, useRef, type RefObject } from "react";

/**
 * Repulsor / boot thrusters drawn over a photo (2D canvas): clean ion jets. Each is a slim plasma plume (white-hot
 * core with standing shock diamonds inside an ice-blue sheath), rings of energy running down it, a few fine
 * streaks and a bright nozzle. The plume is a texture computed once and stretched per frame, so it is cheap.
 * `power` holds one 0..1 target per jet (read every frame), so each limb lights the moment its armour locks
 * and goes out when it leaves, also when the suit-up is reversed half way.
 *
 * Place it inside the photo's box (absolute; the canvas covers just the plumes of its jets, which may reach
 * beyond the box: give each far-apart jet its own overlay, so few pixels are redrawn).
 * Jet points, directions and sizes are shares of the box. Nothing is drawn with reduced motion.
 */

export type Jet = {
  /** Nozzle centre, as shares of the box width / height. */
  x: number;
  y: number;
  /** Exhaust direction (any length). */
  dx: number;
  dy: number;
  /** Plume length, as a share of the box width. */
  size: number;
  /** Nozzle radius, as a share of the box width. */
  width: number;
};

/** Canvas pixels per CSS pixel: capped, lower on touch devices. */
const canvasRatio = () =>
  Math.min(
    window.devicePixelRatio || 1,
    window.matchMedia("(pointer: coarse)").matches ? 1.25 : 1.5,
  );
const PLUME_W = 160;
const PLUME_H = 512;
const RINGS = 4;
const STREAKS = 9;

const smooth = (a: number, b: number, v: number) => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** The plume, nozzle at the top, computed per pixel. */
function makePlume(core: boolean) {
  const sprite = document.createElement("canvas");
  sprite.width = PLUME_W;
  sprite.height = PLUME_H;
  const context = sprite.getContext("2d")!;
  const image = context.createImageData(PLUME_W, PLUME_H);
  for (let y = 0; y < PLUME_H; y++) {
    const v = y / (PLUME_H - 1);
    const end = 1 - smooth(0.7, 1, v);
    const begin = smooth(0, 0.008, v);
    // As wide as the nozzle from the first pixel, a slight swell, then a long taper.
    const wide = (0.4 + 0.14 * smooth(0, 0.2, v)) * (1 - 0.68 * v);
    for (let x = 0; x < PLUME_W; x++) {
      const u = Math.abs((x + 0.5) / PLUME_W - 0.5) * 2;
      let r: number, g: number, b: number, a: number;
      if (core) {
        const d = u / (0.22 * (1 - 0.72 * v));
        a =
          Math.exp(-d * d) *
          (1 - smooth(0.05, 0.72, v)) *
          (0.76 + 0.24 * Math.cos(v * Math.PI * 22)) *
          begin;
        r = 232;
        g = 248;
        b = 255;
      } else {
        const d = u / wide;
        // Flat-topped across: a solid body with a soft edge, not a thin glow.
        const s = Math.exp(-(d ** 4) * 1.5) * (1 - v) ** 0.85 * end * begin;
        a = s;
        // Deep blue at the edge, ice blue inside.
        r = 24 + 110 * s;
        g = 110 + 110 * s;
        b = 255;
      }
      const i = (y * PLUME_W + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = Math.min(255, a * 255);
    }
  }
  context.putImageData(image, 0, 0);
  return sprite;
}

export function JetOverlay({
  jets,
  power,
  behind = false,
}: {
  jets: Jet[];
  power: RefObject<number[]>;
  /** Draw behind the photo (for nozzles that face away, like boot soles). */
  behind?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jetsRef = useRef(jets);
  jetsRef.current = jets;

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !box || !ctx) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;

    const sheath = makePlume(false);
    const core = makePlume(true);
    let width = 0;
    let height = 0;
    // the box, and where the canvas starts inside it
    let boxWidth = 0;
    let boxHeight = 0;
    let left = 0;
    let top = 0;
    let raf = 0;
    let visible = false;
    let alive = true;
    let last = 0;
    const level = new Float32Array(16);

    const resize = () => {
      boxWidth = box.clientWidth;
      boxHeight = box.clientHeight;
      // just large enough for every plume with its glow
      const xs: number[] = [];
      const ys: number[] = [];
      for (const jet of jetsRef.current) {
        const R = boxWidth * jet.width;
        const L = boxWidth * jet.size * 1.36;
        const len = Math.hypot(jet.dx, jet.dy) || 1;
        const ux = jet.dx / len;
        const uy = jet.dy / len;
        for (const across of [-4.3 * R, 4.3 * R]) {
          for (const along of [-2.5 * R, L + R]) {
            xs.push(jet.x * boxWidth + ux * along - uy * across);
            ys.push(jet.y * boxHeight + uy * along + ux * across);
          }
        }
      }
      left = Math.floor(Math.min(...xs));
      top = Math.floor(Math.min(...ys));
      width = Math.ceil(Math.max(...xs)) - left;
      height = Math.ceil(Math.max(...ys)) - top;
      canvas.style.left = `${left}px`;
      canvas.style.top = `${top}px`;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const dpr = canvasRatio();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive || !visible) return;
      const dt = last
        ? Math.min(0.05, Math.max(0, (now - last) / 1000))
        : 0.016;
      last = now;
      const list = jetsRef.current;
      const t = now / 1000;
      ctx.clearRect(0, 0, width, height);
      let any = false;

      list.forEach((jet, i) => {
        // Thrust eases up as it ignites, and cuts quickly.
        const target = power.current?.[i] ?? 0;
        level[i] += (target - level[i]) * Math.min(1, dt * (target > level[i] ? 5 : 9));
        const lv = level[i];
        if (lv > 0.01 || target) any = true;
        if (lv < 0.01) return;

        const x = jet.x * boxWidth - left;
        const y = jet.y * boxHeight - top;
        const len = Math.hypot(jet.dx, jet.dy) || 1;
        const ux = jet.dx / len;
        const uy = jet.dy / len;
        const R = boxWidth * jet.width;
        // A steady jet with the slightest breathing, growing out of the nozzle as it ignites.
        const breathe =
          1 + 0.025 * Math.sin(t * 9 + i * 2.1) + 0.012 * Math.sin(t * 23 + i);
        const L = boxWidth * jet.size * 1.3 * lv * breathe;

        ctx.save();
        ctx.translate(x, y);
        // Local frame: the jet points down.
        ctx.rotate(Math.atan2(uy, ux) - Math.PI / 2);

        // Soft light around the plume.
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.32 * lv;
        ctx.drawImage(sheath, -R * 4.2, -R * 0.15, R * 8.4, L * 1.05);
        ctx.globalAlpha = 0.95 * lv;
        ctx.drawImage(sheath, -R * 2.7, 0, R * 5.4, L);

        ctx.globalCompositeOperation = "lighter";
        // Rings of energy running down the jet, narrowing with it.
        for (let k = 0; k < RINGS; k++) {
          const f = (t * 1.5 + k / RINGS + i * 0.17) % 1;
          const wide = R * (1.05 + 0.35 * smooth(0, 0.2, f)) * (1 - 0.8 * f);
          ctx.globalAlpha = 0.5 * lv * smooth(0, 0.1, f) * (1 - f) ** 1.4;
          ctx.strokeStyle = "rgb(150, 220, 255)";
          ctx.lineWidth = Math.max(0.6, R * 0.1 * (1 - f));
          ctx.beginPath();
          ctx.ellipse(0, L * f * 0.85, wide, wide * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Core with shock diamonds.
        ctx.globalAlpha = lv;
        ctx.drawImage(core, -R * 2.7, 0, R * 5.4, L * 0.92);

        // Fine streaks.
        ctx.strokeStyle = "rgb(190, 232, 255)";
        ctx.lineWidth = 0.8;
        for (let k = 0; k < STREAKS; k++) {
          const f = (t * (1.5 + (k % 3) * 0.3) + k * 0.381) % 1;
          const at = L * (0.05 + 0.85 * f);
          const sx = Math.sin(k * 12.9 + i) * R * 0.85 * (1 - 0.65 * f);
          ctx.globalAlpha = 0.4 * lv * smooth(0, 0.15, f) * (1 - f);
          ctx.beginPath();
          ctx.moveTo(sx, at);
          ctx.lineTo(sx * 0.94, at + L * 0.06);
          ctx.stroke();
        }

        // Nozzle: a bright disc with a crisp rim.
        ctx.globalAlpha = lv;
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 2.4);
        glow.addColorStop(0, "rgba(240, 250, 255, 0.95)");
        glow.addColorStop(0.28, "rgba(120, 205, 255, 0.55)");
        glow.addColorStop(1, "rgba(30, 110, 255, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, R * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(215, 242, 255, 0.9)";
        ctx.lineWidth = Math.max(0.7, R * 0.1);
        ctx.beginPath();
        ctx.ellipse(0, 0, R * 0.95, R * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1;
      });

      ctx.globalCompositeOperation = "source-over";
      if (any) raf = requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, width, height);
        last = 0;
      }
    };
    const wake = () => {
      if (!raf && alive && visible) raf = requestAnimationFrame(frame);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(box);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    intersection.observe(box);
    resize();
    const poke = window.setInterval(wake, 250); // picks up `power` changes while idle
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearInterval(poke);
      resizeObserver.disconnect();
      intersection.disconnect();
    };
  }, [power]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute ${behind ? "-z-10" : "z-10"}`}
    />
  );
}
