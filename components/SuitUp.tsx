// Piece-by-piece armour animation. Everything visible is a function of one timeline position
// (`time`), so suiting up and taking the armour off are the same animation in two directions.
import { useEffect, useRef } from 'react';

// Both images share this coordinate space (see public/*-hero.webp).
const W = 944;
const H = 1340;
// Room around the figure for incoming pieces and exhaust, in image units.
const PAD = { x: 640, top: 420, bottom: 520 };
const CW = W + PAD.x * 2;
const CH = H + PAD.top + PAD.bottom;

const FLIGHT = 1.35; // seconds a piece is in the air
const APPROACH = 0.8; // share of the flight spent flying in; then it hovers ...
const SNAP = 0.9; // ... and slams home
const HOVER = 62; // how far off the body a piece hovers before it locks
const COOL = 0.9; // seconds the glowing seams take to cool after locking
const MAX_PARTICLES = 700;
const UNDO_SPEED = 1.6; // taking the armour off runs a little faster

// molten reveal under the cursor, simulated on a coarse field and upscaled smoothly
const FIELD = 3; // image units per field cell
const FW = Math.ceil(W / FIELD);
const FH = Math.ceil(H / FIELD);
const REVEAL_RADIUS = 190;
const LINGER = 1.1; // seconds the revealed trail takes to close again

interface PieceDef {
  at: number; // take-off time, seconds
  from: [number, number]; // where the piece appears, far away from the body
  spin: number; // roll at take-off (rad)
  bend: number; // how far, and to which side, the flight path curves
  poly: number[]; // x, y pairs; neighbours share edges, both images are cut along them
}

const PIECES: PieceDef[] = [
  // gloves
  { at: 0, from: [-430, 820], spin: -2.2, bend: 0.4, poly: [0, 420, 31, 465, 159, 486, 177, 476, 195, 501, 214, 515, 240, 540, 233, 671, 0, 650] },
  { at: 0.18, from: [1380, 900], spin: 2.2, bend: -0.4, poly: [830, 568, 783, 580, 763, 603, 727, 620, 713, 748, 944, 740, 944, 500] },
  // boots
  { at: 0.55, from: [-300, 1560], spin: -1.8, bend: -0.35, poly: [287, 884, 342, 887, 392, 893, 407, 881, 405, 913, 392, 936, 389, 1018, 290, 1030] },
  { at: 0.72, from: [1120, 1640], spin: 1.9, bend: 0.35, poly: [329, 1155, 374, 1165, 392, 1200, 409, 1200, 404, 1310, 284, 1310, 284, 1180] },
  // forearms
  { at: 1.05, from: [-440, 60], spin: -1.7, bend: 0.35, poly: [279, 369, 284, 398, 327, 426, 316, 451, 214, 515, 195, 501, 177, 476, 159, 486, 194, 404] },
  { at: 1.2, from: [1400, 120], spin: 1.7, bend: -0.35, poly: [708, 426, 782, 476, 830, 568, 783, 580, 763, 603, 682, 526, 646, 463, 660, 467] },
  // calves
  { at: 1.5, from: [-420, 1250], spin: -1.5, bend: -0.4, poly: [453, 769, 453, 776, 440, 803, 427, 835, 407, 881, 392, 893, 342, 887, 287, 884, 298, 781] },
  { at: 1.66, from: [1380, 1420], spin: 1.4, bend: 0.4, poly: [511, 977, 495, 1060, 434, 1150, 409, 1200, 392, 1200, 374, 1165, 329, 1155, 324, 1140, 374, 1060, 377, 982] },
  // knees and upper shins
  { at: 1.95, from: [-400, 760], spin: -1.4, bend: 0.45, poly: [306, 699, 372, 692, 388, 655, 445, 650, 472, 690, 455, 737, 453, 769, 298, 781] },
  { at: 2.1, from: [1360, 1000], spin: 1.5, bend: -0.45, poly: [434, 815, 439, 810, 494, 800, 516, 845, 534, 850, 514, 960, 511, 977, 377, 982, 378, 960, 392, 935, 396, 900, 419, 850] },
  // thighs
  { at: 2.4, from: [-440, 420], spin: -1.2, bend: -0.4, poly: [319, 625, 340, 532, 391, 485, 433, 505, 466, 530, 470, 601, 474, 650, 472, 690, 445, 650, 388, 655, 372, 692, 296, 707] },
  { at: 2.55, from: [1400, 520], spin: 1.2, bend: 0.4, poly: [478, 640, 510, 592, 551, 561, 595, 602, 642, 628, 611, 703, 554, 810, 516, 845, 494, 800, 439, 810, 434, 815, 449, 785, 454, 740, 472, 690, 474, 650] },
  // upper arms
  { at: 2.85, from: [-380, -160], spin: -1.5, bend: 0.3, poly: [299, 295, 326, 288, 366, 266, 399, 267, 404, 288, 388, 353, 361, 395, 327, 426, 284, 398, 279, 369] },
  { at: 3, from: [1340, -160], spin: 1.5, bend: -0.3, poly: [641, 308, 674, 316, 698, 344, 708, 426, 660, 467, 639, 430, 642, 371] },
  // hips, abdomen
  { at: 3.3, from: [1250, 1300], spin: 1.1, bend: 0.45, poly: [397, 445, 455, 483, 556, 506, 599, 495, 631, 626, 595, 602, 551, 561, 510, 592, 478, 640, 470, 601, 466, 530, 433, 505, 391, 485, 340, 532] },
  { at: 3.5, from: [-430, 640], spin: -1, bend: 0.35, poly: [380, 398, 435, 393, 479, 365, 495, 344, 530, 346, 525, 499, 455, 483, 397, 445] },
  { at: 3.62, from: [1390, 640], spin: 1, bend: -0.35, poly: [530, 346, 561, 348, 578, 385, 616, 436, 627, 411, 608, 497, 599, 495, 556, 506, 525, 499] },
  // chest: both halves slam together, then the collar
  { at: 3.95, from: [-440, 200], spin: -0.9, bend: -0.3, poly: [531, 346, 495, 344, 479, 365, 435, 393, 380, 398, 388, 353, 404, 288, 408, 262, 531, 262] },
  { at: 3.95, from: [1390, 240], spin: 0.9, bend: 0.3, poly: [645, 262, 641, 308, 642, 371, 627, 411, 616, 436, 578, 385, 561, 348, 531, 346, 531, 262] },
  { at: 4.3, from: [520, -300], spin: 0.6, bend: 0.5, poly: [392, 204, 441, 185, 483, 166, 493, 191, 508, 211, 538, 231, 579, 210, 588, 186, 637, 222, 646, 249, 645, 262, 408, 262, 410, 245] },
  // shoulders
  { at: 4.6, from: [-360, -240], spin: -1.3, bend: 0.35, poly: [293, 183, 392, 173, 410, 245, 399, 267, 366, 266, 326, 288, 299, 295] },
  { at: 4.74, from: [1330, -220], spin: 1.3, bend: -0.35, poly: [637, 222, 731, 232, 734, 347, 698, 344, 674, 316, 641, 308, 646, 249] },
  // helmet shell, then the faceplate closes over the face
  { at: 5.1, from: [160, -300], spin: -0.8, bend: -0.45, poly: [455, 14, 612, 14, 596, 155, 585, 187, 574, 214, 531, 236, 499, 214, 482, 192, 472, 165, 461, 133, 455, 14, 483, 66, 483, 122, 479, 140, 487, 160, 493, 184, 494, 198, 505, 209, 514, 201, 546, 201, 552, 198, 558, 186, 566, 166, 579, 156, 585, 138, 583, 128, 585, 72, 559, 54, 551, 90, 522, 90, 511, 52, 483, 66] },
  { at: 5.75, from: [1300, -120], spin: 0.9, bend: -0.4, poly: [483, 66, 511, 52, 522, 90, 551, 90, 559, 54, 585, 72, 583, 128, 585, 138, 579, 156, 566, 166, 558, 186, 552, 198, 546, 201, 514, 201, 505, 209, 494, 198, 493, 184, 487, 160, 479, 140, 483, 122] },
];
const END = Math.max(...PIECES.map(p => p.at)) + FLIGHT + COOL;
/** Moment the thrusters light. */
const IGNITE = END - COOL;

// nozzle position and exhaust direction, matching the pose
const JETS = [
  { x: 144, y: 537, dx: -0.06, dy: 1, size: 0.8, hand: true },
  { x: 816, y: 624, dx: 0.06, dy: 1, size: 0.8, hand: true },
  { x: 356, y: 1000, dx: -0.16, dy: 1, size: 0.78, hand: false },
  { x: 346, y: 1280, dx: -0.16, dy: 1, size: 0.8, hand: false },
];
// lamps in the armour picture, kept dark until the suit powers up
const REACTOR = {
  seen: 3.95 + FLIGHT, // both chest halves are on
  at: 4.3 + FLIGHT, // the collar locks
  x: 531, y: 325, poly: [497, 308, 505, 302, 556, 308, 566, 322, 549, 350, 513, 346],
};
const FACEPLATE = PIECES.length - 1;
const EYES = [
  { x: 504, y: 131, poly: [489, 124, 494, 123, 519, 131, 517, 137, 491, 132] },
  { x: 562, y: 133, poly: [579, 126, 576, 139, 549, 139, 547, 134] },
];
/** Length of the white-hot core at the nozzle, image units. */
const CORE = 190;

interface Particle {
  x: number; y: number; vx: number; vy: number;
  age: number; life: number; size: number;
  kind: 'flame' | 'fire' | 'spark' | 'smoke';
}
interface Sprite {
  x: number; y: number; w: number; h: number;
  /** Centre and half extents of the metal that is actually visible. */
  cx: number; cy: number; rx: number; ry: number;
  cold: HTMLCanvasElement;
  hot: HTMLCanvasElement; // seams still glowing
  shade: HTMLCanvasElement; // the piece seen edge-on or from the back
  mask: HTMLCanvasElement; // area of the photo this piece replaces
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };

const makeCanvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const glow = (stops: [number, string][]) => {
  const c = makeCanvas(64, 64);
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  stops.forEach(([o, color]) => grad.addColorStop(o, color));
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
};

/** Teardrop of white-hot exhaust: bright at the nozzle (top), fading to blue. */
const buildCore = () => {
  const w = 64, h = 160;
  const c = makeCanvas(w, h);
  const g = c.getContext('2d')!;
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    const half = 0.42 * Math.sqrt(smooth(v / 0.1)) * (1 - v * 0.72);
    for (let x = 0; x < w; x++) {
      const u = Math.abs((x + 0.5) / w - 0.5) / Math.max(0.02, half);
      const a = Math.exp(-u * u * 3.2) * Math.pow(1 - v, 1.1) * smooth(v / 0.05) * (1 - smooth((Math.abs((x + 0.5) / w - 0.5) - 0.36) / 0.14));
      const hot = Math.exp(-u * u * 7) * (1 - v);
      const k = (y * w + x) * 4;
      img.data[k] = 70 + 185 * hot;
      img.data[k + 1] = 150 + 105 * hot;
      img.data[k + 2] = 255;
      img.data[k + 3] = 255 * a;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
};

/** Turbulent tongue of fire: white-yellow at the nozzle (top), orange, then red wisps. */
const buildFlame = (noise: Float32Array, seed: number) => {
  const w = 72, h = 200;
  const c = makeCanvas(w, h);
  const g = c.getContext('2d')!;
  const img = g.createImageData(w, h);
  const n = (x: number, y: number) => noise[((y & 255) << 8) | (x & 255)];
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    const sway = (n(seed * 61, y * 0.6 + seed * 37) - 0.5) * 0.5 * v;
    const half = 0.4 * Math.sqrt(smooth(v / 0.12)) * (1 - v * 0.55);
    for (let x = 0; x < w; x++) {
      const px = (x + 0.5) / w - 0.5;
      const u = (px - sway) / Math.max(0.02, half);
      const body = Math.exp(-u * u * 2.2) * Math.pow(1 - v, 0.75) * smooth(v / 0.04);
      const eaten = n(x * 1.3 + seed * 53, y - seed * 71) * 0.6 + n(x * 3 + seed * 17, y * 2 - seed * 29) * 0.4;
      const a = smooth((body - eaten * v * 0.75) / 0.5) * (1 - smooth((Math.abs(px) - 0.36) / 0.14));
      const t = clamp01(a * (1.15 - v) * 1.15);
      const k = (y * w + x) * 4;
      img.data[k] = 255;
      img.data[k + 1] = 60 + 185 * Math.pow(t, 0.9);
      img.data[k + 2] = 8 + 200 * t * t * t;
      img.data[k + 3] = 255 * a;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
};

/** Coarse alpha of both figures together: where there is anything to reveal or cut. */
const buildSolid = (images: HTMLImageElement[]) => {
  const c = makeCanvas(FW, FH);
  const g = c.getContext('2d', { willReadFrequently: true })!;
  images.forEach(img => g.drawImage(img, 0, 0, W / FIELD, H / FIELD));
  const data = g.getImageData(0, 0, FW, FH).data;
  const solid = new Uint8Array(FW * FH);
  for (let i = 0; i < solid.length; i++) solid[i] = data[i * 4 + 3] > 4 ? 1 : 0;
  return solid;
};

/** Seamless smooth noise, 0..1, size 256 x 256. */
const buildNoise = () => {
  const N = 256;
  const out = new Float32Array(N * N);
  [[8, 0.5], [16, 0.3], [32, 0.2]].forEach(([freq, amp]) => {
    const grid = Float32Array.from({ length: freq * freq }, () => Math.random());
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const gx = (x / N) * freq, gy = (y / N) * freq;
        const ix = gx | 0, iy = gy | 0;
        const tx = smooth(gx - ix), ty = smooth(gy - iy);
        const jx = (ix + 1) % freq, jy = (iy + 1) % freq;
        const top = grid[iy * freq + ix] * (1 - tx) + grid[iy * freq + jx] * tx;
        const low = grid[jy * freq + ix] * (1 - tx) + grid[jy * freq + jx] * tx;
        out[y * N + x] += amp * (top * (1 - ty) + low * ty);
      }
    }
  });
  return out;
};

const distToPoly = (poly: number[], x: number, y: number) => {
  let best = Infinity;
  for (let i = 0; i < poly.length; i += 2) {
    const ax = poly[i], ay = poly[i + 1];
    const bx = poly[(i + 2) % poly.length], by = poly[(i + 3) % poly.length];
    const dx = bx - ax, dy = by - ay;
    const t = clamp01(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1));
    best = Math.min(best, Math.hypot(x - ax - dx * t, y - ay - dy * t));
  }
  return best;
};

/** Pixels no polygon covers go to the nearest piece, so no shred is ever left behind. */
const strayCells = (solid: Uint8Array): number[][] => {
  const probe = makeCanvas(1, 1).getContext('2d')!;
  const paths = PIECES.map(({ poly }) => {
    const p = new Path2D();
    for (let i = 0; i < poly.length; i += 2) p.lineTo(poly[i], poly[i + 1]);
    p.closePath();
    return p;
  });
  // one label for the inside of each polygon keeps this cheap
  const c = makeCanvas(FW, FH);
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.scale(1 / FIELD, 1 / FIELD);
  paths.forEach(p => g.fill(p));
  const covered = g.getImageData(0, 0, FW, FH).data;
  const result: number[][] = PIECES.map(() => []);
  for (let i = 0; i < solid.length; i++) {
    if (!solid[i] || covered[i * 4 + 3] > 250) continue;
    const x = (i % FW) * FIELD, y = ((i / FW) | 0) * FIELD;
    const cx = x + FIELD / 2, cy = y + FIELD / 2;
    if (paths.some(p => probe.isPointInPath(p, cx, cy))) continue;
    let best = 0, bestD = Infinity;
    PIECES.forEach((def, k) => {
      const d = distToPoly(def.poly, cx, cy);
      if (d < bestD) { bestD = d; best = k; }
    });
    result[best].push(x, y);
  }
  return result;
};

const buildSprite = (def: PieceDef, stray: number[], armor: HTMLImageElement): Sprite => {
  const path = new Path2D();
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let i = 0; i < def.poly.length; i += 2) {
    const x = def.poly[i], y = def.poly[i + 1];
    if (i) path.lineTo(x, y); else path.moveTo(x, y);
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  path.closePath();
  const outline = new Path2D(path);
  for (let i = 0; i < stray.length; i += 2) {
    const x = stray[i], y = stray[i + 1];
    path.rect(x, y, FIELD, FIELD);
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + FIELD); y1 = Math.max(y1, y + FIELD);
  }
  x0 -= 3; y0 -= 3; x1 += 3; y1 += 3;
  const w = x1 - x0, h = y1 - y0;

  const cold = makeCanvas(w, h);
  const c = cold.getContext('2d')!;
  c.translate(-x0, -y0);
  c.fill(path, 'nonzero');
  c.lineWidth = 4; // slight overlap hides the seams between neighbours
  c.stroke(path);
  c.globalCompositeOperation = 'source-in';
  c.drawImage(armor, 0, 0, W, H);

  // the seams glow where the piece has just been welded on
  const mask = makeCanvas(w, h);
  const m = mask.getContext('2d')!;
  m.translate(-x0, -y0);
  m.fill(path, 'nonzero');
  m.lineWidth = 4;
  m.stroke(path);

  const hot = makeCanvas(w, h);
  const g = hot.getContext('2d')!;
  g.fillStyle = 'rgba(255,96,20,0.16)';
  g.fillRect(0, 0, w, h);
  g.translate(-x0, -y0);
  g.lineJoin = 'round';
  const seams: [number, string][] = [[26, 'rgba(255,80,10,0.22)'], [13, 'rgba(255,130,30,0.5)'], [4, 'rgba(255,225,160,0.95)']];
  seams.forEach(([lineWidth, color]) => {
    g.lineWidth = lineWidth;
    g.strokeStyle = color;
    g.stroke(outline);
  });
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(cold, 0, 0);

  const shade = makeCanvas(w, h);
  const d = shade.getContext('2d')!;
  d.drawImage(cold, 0, 0);
  d.globalCompositeOperation = 'source-in';
  d.fillStyle = '#0a0b12';
  d.fillRect(0, 0, w, h);

  // the polygons have generous margins; fly the piece around its visible middle
  // (measured on a small copy: reading the sprite itself back would take it off the GPU)
  const probe = makeCanvas(w / FIELD, h / FIELD);
  const pw = probe.width, ph = probe.height;
  const pg = probe.getContext('2d', { willReadFrequently: true })!;
  pg.drawImage(cold, 0, 0, pw, ph);
  const alpha = pg.getImageData(0, 0, pw, ph).data;
  let ax0 = pw, ay0 = ph, ax1 = 0, ay1 = 0;
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      if (alpha[(y * pw + x) * 4 + 3] < 60) continue;
      if (x < ax0) ax0 = x;
      if (x > ax1) ax1 = x;
      if (y < ay0) ay0 = y;
      if (y > ay1) ay1 = y;
    }
  }
  const sx = w / pw, sy = h / ph;
  return {
    x: x0, y: y0, w, h, cold, hot, shade, mask,
    cx: x0 + ((ax0 + ax1 + 1) / 2) * sx, cy: y0 + ((ay0 + ay1 + 1) / 2) * sy,
    rx: Math.max(8, ((ax1 - ax0) / 2) * sx), ry: Math.max(8, ((ay1 - ay0) / 2) * sy),
  };
};

interface SuitUpProps {
  src: string;
  armorSrc: string;
  /** true: put the armour on, false: take it off. */
  suited: boolean;
  /** Fires once, when the figure is first well inside the viewport. */
  onFirstView?: () => void;
}

const SuitUp = ({ src, armorSrc, suited, onFirstView }: SuitUpProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const suitedRef = useRef(suited);
  const wakeRef = useRef<() => void>(() => {});
  const firstViewRef = useRef(onFirstView);
  firstViewRef.current = onFirstView;

  useEffect(() => {
    suitedRef.current = suited;
    wakeRef.current();
  }, [suited]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!host || !canvas || !ctx) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const layer = makeCanvas(1, 1); // the photo with the already-armoured regions cut away
    const lctx = layer.getContext('2d')!;
    const body = makeCanvas(1, 1); // photo plus every locked piece; only redrawn when one locks
    const bctx = body.getContext('2d')!;
    let bodyKey = '';
    const peek = makeCanvas(1, 1); // the other image, seen through the honeycomb
    const pctx = peek.getContext('2d')!;
    const blue = glow([[0, 'rgba(225,245,255,1)'], [0.25, 'rgba(90,175,255,0.75)'], [1, 'rgba(30,90,255,0)']]);
    const fire = glow([[0, 'rgba(255,205,105,0.9)'], [0.35, 'rgba(255,130,25,0.5)'], [1, 'rgba(200,40,0,0)']]);

    const ember = glow([[0, 'rgba(255,170,70,0.85)'], [0.4, 'rgba(255,115,25,0.5)'], [0.75, 'rgba(210,60,5,0.14)'], [1, 'rgba(160,30,0,0)']]);
    const core = buildCore();
    const smoke = glow([[0, 'rgba(176,170,178,0.55)'], [0.5, 'rgba(128,124,140,0.24)'], [1, 'rgba(90,90,110,0)']]);
    const noise = buildNoise();
    const flames = [1, 2, 3, 4, 5, 6].map(seed => buildFlame(noise, seed));

    let photo: HTMLImageElement | null = null;
    let armor: HTMLImageElement | null = null;
    let sprites: Sprite[] = [];
    let particles: Particle[] = [];
    let solid: Uint8Array = new Uint8Array(0);
    const heat = new Float32Array(FW * FH); // how open the reveal is, per field cell
    const maskC = makeCanvas(FW, FH);
    const maskG = maskC.getContext('2d')!;
    const maskData = maskG.createImageData(FW, FH);
    const rimC = makeCanvas(FW, FH);
    const rimG = rimC.getContext('2d')!;
    const rimData = rimG.createImageData(FW, FH);
    const brush = { x: 0, y: 0, fresh: true };
    const pointer = { x: 0, y: 0, inside: false };
    let peeking = false;
    let time = suitedRef.current ? END : 0;
    let scale = 1;
    let visible = false;
    let raf = 0;
    let last = 0;
    let disposed = false;
    let viewTimer = 0;

    const add = (p: Particle) => { if (particles.length < MAX_PARTICLES) particles.push(p); };

    const sparks = (x: number, y: number, count: number, speed: number) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.3 + Math.random());
        add({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          age: 0, life: 0.3 + Math.random() * 0.5, size: 5 + Math.random() * 9, kind: 'spark',
        });
      }
    };

    /** Offset from the docked position, `q` = 0 (far away) .. 1 (locked). */
    const pathAt = (i: number, q: number) => {
      const def = PIECES[i], s = sprites[i];
      const sx = def.from[0] - s.cx, sy = def.from[1] - s.cy;
      const len = Math.hypot(sx, sy) || 1;
      const hx = (sx / len) * HOVER, hy = (sy / len) * HOVER;
      if (q >= APPROACH) {
        const snap = clamp01((q - SNAP) / (1 - SNAP));
        const left = 1 - snap * snap * snap; // slams home
        return { x: hx * left, y: hy * left };
      }
      const u = 1 - Math.pow(1 - q / APPROACH, 2.3);
      const mx = sx * 0.5 - sy * def.bend, my = sy * 0.5 + sx * def.bend;
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      return { x: sx * a + mx * b + hx * c, y: sy * a + my * b + hy * c };
    };

    const pose = (i: number) => {
      const def = PIECES[i];
      const p = clamp01((time - def.at) / FLIGHT);
      const at = pathAt(i, p);
      const e = 0.012;
      const p0 = Math.max(0, p - e), p1 = Math.min(1, p + e);
      const a = pathAt(i, p0), b = pathAt(i, p1);
      const span = (p1 - p0) * FLIGHT || 1;
      const q = clamp01(p / APPROACH);
      const left = Math.pow(1 - q, 2);
      const snap = clamp01((p - SNAP) / (1 - SNAP));
      const hover = smooth((p - 0.6) / 0.2) * (1 - snap);
      return {
        p,
        dx: at.x + Math.sin(time * 31 + i) * 2.2 * hover,
        dy: at.y + Math.cos(time * 27 + i * 2) * 2.2 * hover,
        vx: (b.x - a.x) / span,
        vy: (b.y - a.y) / span,
        rot: def.spin * left * 1.6,
        // a tiny light in the distance that rushes past the camera and settles on the body
        grow: p >= 1 ? 1 : 0.1 + 1.2 * smooth(q / 0.72) - 0.16 * smooth((q - 0.72) / 0.28) - 0.14 * snap * snap,
        flip: Math.cos(left * Math.PI * 2 * (i % 2 ? 1 : 1.5)),
        snap,
        heat: p < 1 ? 0 : 1 - smooth((time - def.at - FLIGHT) / COOL),
      };
    };

    /** The body is knocked back every time a piece hits it. */
    const recoil = () => {
      let x = 0, y = 0;
      if (reduce || !suitedRef.current) return { x, y };
      PIECES.forEach((def, i) => {
        const t = time - def.at - FLIGHT;
        if (t <= 0 || t > 0.85) return;
        const s = sprites[i];
        const len = Math.hypot(def.from[0] - s.cx, def.from[1] - s.cy) || 1;
        const k = 13 * Math.exp(-t * 8) * Math.sin(t * 26);
        x -= ((def.from[0] - s.cx) / len) * k;
        y -= ((def.from[1] - s.cy) / len) * k;
      });
      return { x, y };
    };

    const melt = (dt: number, still: boolean) => {
      // the brush glides after the pointer and paints the whole segment it travelled
      const fromX = brush.fresh ? pointer.x : brush.x;
      const fromY = brush.fresh ? pointer.y : brush.y;
      const follow = brush.fresh ? 1 : 1 - Math.exp(-dt / 0.07);
      brush.x = fromX + (pointer.x - fromX) * follow;
      brush.y = fromY + (pointer.y - fromY) * follow;
      brush.fresh = !pointer.inside;
      const painting = pointer.inside && still;
      const sx = brush.x - fromX, sy = brush.y - fromY;
      const len2 = sx * sx + sy * sy || 1;
      const fade = dt / (still ? LINGER : 0.3);
      const rise = 1 - Math.exp(-dt / 0.1);
      const clock = performance.now() / 1000;
      const ox = (clock * 5) | 0, oy = (clock * 16) | 0;
      const mask = maskData.data, rim = rimData.data;
      let open = false;
      for (let i = 0; i < heat.length; i++) {
        let v = heat[i];
        const k = i * 4;
        if (!solid[i] && v <= 0) continue;
        const fx = i % FW, fy = (i / FW) | 0;
        let goal = 0;
        if (painting) {
          const x = fx * FIELD, y = fy * FIELD;
          const dx = x - fromX, dy = y - fromY;
          if (Math.abs(x - brush.x) < REVEAL_RADIUS * 1.6 && Math.abs(y - brush.y) < REVEAL_RADIUS * 1.6) {
            const t = Math.min(1, Math.max(0, (dx * sx + dy * sy) / len2));
            const ex = dx - sx * t, ey = dy - sy * t;
            goal = Math.max(0, 1 - Math.sqrt(ex * ex + ey * ey) / REVEAL_RADIUS);
            goal = Math.min(1, goal * 1.9);
          }
        }
        v = goal > v ? v + (goal - v) * rise : Math.max(goal, v - fade);
        heat[i] = v;
        if (v <= 0.004) {
          heat[i] = 0;
          mask[k + 3] = rim[k + 3] = 0;
          continue;
        }
        open = true;
        // two noise layers drifting apart make the edge lick like flame
        const n = noise[(((fy + oy) & 255) << 8) | ((fx + ox) & 255)] * 0.6
          + noise[(((fy * 2 + oy * 2) & 255) << 8) | ((fx * 2 - ox) & 255)] * 0.4;
        const level = v * 1.35 - 0.25 - (n - 0.5) * 0.75;
        mask[k + 3] = 255 * smooth((level - 0.08) / 0.06);
        const d = level - 0.11;
        // white-hot line, orange glow trailing outwards, quick falloff inwards
        const glowing = Math.max(0, 1 - (d < 0 ? -d / 0.2 : d / 0.12)) * Math.min(1, v * 6);
        const core = glowing * glowing * glowing;
        rim[k] = 255;
        rim[k + 1] = 70 + 165 * core;
        rim[k + 2] = 10 + 150 * core * core;
        rim[k + 3] = 255 * glowing * glowing;
        if (core > 0.7 && solid[i] && Math.random() < dt * 0.12) {
          add({
            x: fx * FIELD, y: fy * FIELD, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 110,
            age: 0, life: 0.5 + Math.random() * 0.6, size: 4 + Math.random() * 7, kind: 'spark',
          });
        }
      }
      peeking = open;
      maskG.putImageData(maskData, 0, 0);
      rimG.putImageData(rimData, 0, 0);
    };

    const trail: ({ x: number; y: number } | null)[] = PIECES.map(() => null);

    /** Where a piece's rockets point and how hard they burn. */
    const exhaust = (i: number, a: ReturnType<typeof pose>, dir: number) => {
      const s = sprites[i];
      const speed = Math.hypot(a.vx, a.vy);
      // thrown against the direction of travel, sagging downwards while it hovers
      let x = (-a.vx * dir) / 700, y = (-a.vy * dir) / 700 + 0.4;
      const len = Math.hypot(x, y) || 1;
      x /= len; y /= len;
      return {
        x, y,
        thrust: clamp01(0.38 + speed / 1300),
        width: Math.max(16, Math.min(46, Math.min(s.rx, s.ry) * 0.75)) * (0.25 + a.grow * 0.75),
        reach: Math.min(s.rx, s.ry) * 0.55 * a.grow,
      };
    };

    const stamp = (img: HTMLCanvasElement, x: number, y: number, size: number, alpha: number) => {
      ctx.globalAlpha = clamp01(alpha);
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    };

    /** Twin rocket plume behind a flying piece. */
    const drawPlume = (i: number, a: ReturnType<typeof pose>, now: number, dir: number) => {
      const s = sprites[i];
      const e = exhaust(i, a, dir);
      const alpha = smooth(a.p / 0.05) * (1 - smooth((a.p - 0.97) / 0.03));
      if (alpha <= 0) return;
      const frame = Math.floor(now / 45 + i * 2);
      ctx.globalCompositeOperation = 'lighter';
      // light thrown on everything around it
      stamp(ember, s.cx + a.dx, s.cy + a.dy, 300 * a.grow, alpha * (0.14 + 0.2 * e.thrust));
      ctx.save();
      ctx.translate(s.cx + a.dx + e.x * e.reach, s.cy + a.dy + e.y * e.reach);
      ctx.rotate(Math.atan2(-e.x, e.y));
      for (let k = -1; k <= 1; k += 2) {
        const wave = 1 + Math.sin(now / 23 + i * 3 + k) * 0.1;
        const len = e.width * (1.6 + e.thrust * 4.4) * wave;
        const tongue = flames[(frame + (k > 0 ? 3 : 0)) % flames.length];
        ctx.save();
        ctx.translate(k * e.width * 0.52, 0);
        ctx.globalAlpha = alpha * 0.85;
        ctx.drawImage(tongue, -e.width * 0.75, -4, e.width * 1.5, len);
        ctx.globalAlpha = alpha;
        ctx.drawImage(core, -e.width * 0.34, -4, e.width * 0.68, len * 0.48);
        ctx.restore();
      }
      ctx.restore();
      stamp(blue, s.cx + a.dx + e.x * e.reach, s.cy + a.dy + e.y * e.reach, e.width * 2.4, alpha * 0.55);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };

    const drawPiece = (i: number, a: ReturnType<typeof pose>) => {
      const s = sprites[i];
      const flip = Math.sign(a.flip || 1) * Math.max(0.12, Math.abs(a.flip));
      const alpha = smooth(a.p / 0.08);
      // afterimages while it is fast
      const fast = clamp01((Math.hypot(a.vx, a.vy) - 500) / 1500);
      for (let ghost = fast > 0.05 ? 2 : 0; ghost >= 0; ghost--) {
        ctx.save();
        ctx.translate(s.cx + a.dx - a.vx * ghost * 0.012, s.cy + a.dy - a.vy * ghost * 0.012);
        ctx.rotate(a.rot);
        ctx.scale(a.grow * flip, a.grow);
        ctx.translate(s.x - s.cx, s.y - s.cy);
        ctx.globalAlpha = alpha * (ghost ? (0.2 * fast) / ghost : 1);
        ctx.drawImage(s.cold, 0, 0);
        if (!ghost) {
          if (i === FACEPLATE) {
            // lamps stay off until the suit is closed
            ctx.translate(-s.x, -s.y);
            EYES.forEach(e => fillPoly(e.poly, 'rgba(12,10,14,0.92)'));
            ctx.translate(s.x, s.y);
          }
          const dark = flip < 0 ? 0.8 : 0.65 * (1 - flip);
          if (dark > 0.01) {
            ctx.globalAlpha = alpha * dark;
            ctx.drawImage(s.shade, 0, 0);
          }
          if (a.snap > 0) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = a.snap;
            ctx.drawImage(s.hot, 0, 0);
          }
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const fillPoly = (poly: number[], color: string) => {
      ctx.beginPath();
      for (let i = 0; i < poly.length; i += 2) ctx.lineTo(poly[i], poly[i + 1]);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    /** 0 = dead, 1 = lit; stutters like a lamp starting up. */
    const bootUp = (since: number) => {
      const t = time - since;
      if (t <= 0) return 0;
      if (t >= 0.5 || reduce) return 1;
      return Math.sin(t * 58) > 0.1 - t * 2 ? smooth(t / 0.35) : 0.12;
    };

    /** Arc reactor and eyes. */
    const drawLights = (now: number, kick: { x: number; y: number }) => {
      const reactor = bootUp(REACTOR.at);
      const eyes = bootUp(IGNITE);
      ctx.save();
      ctx.translate(kick.x, kick.y);
      if (time >= REACTOR.seen && reactor < 1) fillPoly(REACTOR.poly, `rgba(14,16,26,${0.9 * (1 - reactor)})`);
      if (time >= IGNITE && eyes < 1) EYES.forEach(e => fillPoly(e.poly, `rgba(12,10,14,${0.92 * (1 - eyes)})`));
      ctx.globalCompositeOperation = 'lighter';
      const pulse = reduce ? 0.8 : 0.78 + Math.sin(now / 420) * 0.12;
      if (reactor > 0) {
        const surge = Math.max(0, 1 - Math.abs(time - REACTOR.at - 0.35) / 0.35);
        stamp(blue, REACTOR.x, REACTOR.y, 150 + surge * 260, reactor * (0.34 * pulse + surge * 0.5));
      }
      if (eyes > 0) {
        const glare = Math.max(0, 1 - Math.abs(time - IGNITE - 0.3) / 0.4);
        EYES.forEach(e => stamp(fire, e.x, e.y, 50 + glare * 90, eyes * (0.3 * pulse + glare * 0.6)));
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const step = (dt: number) => {
      const before = time;
      const dir = suitedRef.current ? 1 : -1;
      if (reduce) time = dir > 0 ? END : 0;
      else time = Math.min(END, Math.max(0, time + dt * (dir > 0 ? 1 : -UNDO_SPEED)));

      if (!reduce) {
        PIECES.forEach((def, i) => {
          const s = sprites[i];
          const { cx, cy } = s;
          const a = pose(i);
          const prev = trail[i];
          if (a.p > 0 && a.p < 1 && time !== before) {
            const e = exhaust(i, a, dir);
            const px = cx + a.dx + e.x * e.reach, py = cy + a.dy + e.y * e.reach;
            const qx = prev ? prev.x : px, qy = prev ? prev.y : py;
            // fire and smoke are laid along the whole stretch flown since the last frame
            const want = (40 + 100 * e.thrust) * dt;
            const n = Math.floor(want) + (Math.random() < want % 1 ? 1 : 0);
            for (let k = 0; k < n; k++) {
              const t = Math.random();
              const v = (160 + Math.random() * 280) * a.grow;
              add({
                x: qx + (px - qx) * t + (Math.random() - 0.5) * e.width * 0.8,
                y: qy + (py - qy) * t + (Math.random() - 0.5) * e.width * 0.8,
                vx: e.x * v + (Math.random() - 0.5) * 70, vy: e.y * v + (Math.random() - 0.5) * 70,
                age: 0, life: 0.22 + Math.random() * 0.34, size: e.width * (0.9 + Math.random() * 0.9), kind: 'fire',
              });
            }
            if (Math.random() < dt * 16) {
              const t = Math.random();
              add({
                x: qx + (px - qx) * t + e.x * 70 * a.grow, y: qy + (py - qy) * t + e.y * 70 * a.grow,
                vx: e.x * 60 + (Math.random() - 0.5) * 40, vy: e.y * 60 - 18,
                age: 0, life: 0.9 + Math.random() * 0.7, size: e.width * (1.3 + Math.random()), kind: 'smoke',
              });
            }
            if (Math.random() < dt * 30) sparks(px, py, 1, 160);
            trail[i] = { x: px, y: py };
          } else trail[i] = null;

          const lock = def.at + FLIGHT;
          if (before < lock !== time < lock) {
            const len = Math.hypot(def.from[0] - cx, def.from[1] - cy) || 1;
            const nx = (def.from[0] - cx) / len, ny = (def.from[1] - cy) / len;
            const big = Math.min(1.5, 0.5 + (s.rx + s.ry) / 160);
            sparks(cx, cy, Math.round(16 * big), 420);
            // pressurised gas blown out of the joint
            for (let k = 0; k < 14; k++) {
              const ang = Math.random() * Math.PI * 2;
              const ox = Math.cos(ang), oy = Math.sin(ang);
              const v = 120 + Math.random() * 160;
              add({
                x: cx + ox * s.rx * 0.8, y: cy + oy * s.ry * 0.8,
                vx: ox * v + nx * 60, vy: oy * v + ny * 60 - 30,
                age: 0, life: 0.25 + Math.random() * 0.3, size: 26 + Math.random() * 30, kind: 'fire',
              });
              if (k % 3 === 0) {
                add({
                  x: cx + ox * s.rx, y: cy + oy * s.ry, vx: ox * v * 0.7, vy: oy * v * 0.7 - 20,
                  age: 0, life: 0.7 + Math.random() * 0.5, size: 44 + Math.random() * 40, kind: 'smoke',
                });
              }
            }
          }
        });

        // the thrusters light with a blast
        if (before < IGNITE && time >= IGNITE) {
          for (const j of JETS) {
            sparks(j.x, j.y, 18, 460);
            for (let k = 0; k < 16; k++) {
              const ang = Math.random() * Math.PI * 2;
              const v = 90 + Math.random() * 200;
              add({
                x: j.x, y: j.y + 20, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v * 0.5 + 120,
                age: 0, life: 0.5 + Math.random() * 0.4, size: 60 + Math.random() * 60, kind: k % 2 ? 'fire' : 'smoke',
              });
            }
          }
        }

        const power = smooth((time - IGNITE) / COOL);
        if (power > 0.02) {
          for (const j of JETS) {
            const want = 55 * dt * power;
            const n = Math.floor(want) + (Math.random() < want % 1 ? 1 : 0);
            for (let k = 0; k < n; k++) {
              const v = (400 + Math.random() * 150) * j.size;
              add({
                x: j.x + (Math.random() - 0.5) * 14, y: j.y + Math.random() * 10,
                vx: j.dx * v + (Math.random() - 0.5) * 80, vy: j.dy * v,
                age: 0, life: 0.5 + Math.random() * 0.26, size: (78 + Math.random() * 44) * j.size, kind: 'flame',
              });
            }
          }
        }
      }

      const still = time <= 0 || time >= END;
      if (peeking || (pointer.inside && still)) melt(dt, still);

      for (const p of particles) {
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === 'smoke') { p.vx *= 1 - 1.2 * dt; p.vy *= 1 - 1.2 * dt; }
        if (p.kind === 'spark') { p.vy += 240 * dt; p.vx *= 1 - 1.5 * dt; }
      }
      particles = particles.filter(p => p.age < p.life);
    };

    const drawFire = () => {
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        if (p.kind !== 'fire') continue;
        const t = p.age / p.life;
        stamp(fire, p.x, p.y, p.size * (0.65 + t * 1.2), (1 - t) * 0.6);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };

    const view = (g: CanvasRenderingContext2D) => {
      g.imageSmoothingQuality = 'high';
      // the layers hold just the figure, the main canvas also the airspace around it
      if (g === ctx) g.setTransform(scale, 0, 0, scale, Math.round(PAD.x * scale), Math.round(PAD.top * scale));
      else g.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!photo || !armor) return;
      view(ctx);

      for (const p of particles) {
        if (p.kind !== 'smoke') continue;
        const t = p.age / p.life;
        stamp(smoke, p.x, p.y, p.size * (0.7 + t * 1.6), smooth(t / 0.15) * (1 - t) * 0.3);
      }
      const kick = recoil();
      const dir = suitedRef.current ? 1 : -1;

      // exhaust sits behind the figure
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        if (p.kind !== 'flame') continue;
        const t = p.age / p.life;
        // narrow blue jet that swells into a soft ball of fire
        const size = p.size * (0.4 + t * 1.15);
        if (t < 0.65) stamp(blue, p.x, p.y, size, (1 - smooth((t - 0.3) / 0.35)) * 0.42);
        if (t > 0.36) stamp(ember, p.x, p.y, size * 1.5, smooth((t - 0.36) / 0.25) * (1 - smooth((t - 0.6) / 0.4)) * 0.25);
      }
      const thrust = smooth((time - IGNITE) / COOL);
      if (thrust > 0) {
        JETS.forEach((j, i) => {
          const wave = reduce ? 0 : Math.sin(now / 38 + i * 2) * 0.07 + Math.sin(now / 15 + i * 5) * 0.05;
          const len = CORE * j.size * thrust * (1 + wave);
          const wide = 46 * j.size * (1 + wave * 0.5);
          ctx.save();
          ctx.translate(j.x, j.y);
          ctx.rotate(Math.atan2(-j.dx, j.dy));
          ctx.globalAlpha = thrust * 0.62;
          const tongue = flames[(Math.floor(now / 50) + i * 2) % flames.length];
          ctx.drawImage(tongue, -wide * 1.05, -6, wide * 2.1, len * 1.75);
          ctx.globalAlpha = thrust * 0.55;
          ctx.drawImage(core, -wide, -10, wide * 2, len * 1.15);
          ctx.globalAlpha = thrust;
          ctx.drawImage(core, -wide * 0.4, -6, wide * 0.8, len * 0.8);
          ctx.restore();
        });
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      if (peeking && (time <= 0 || time >= END)) {
        const other = time >= END ? photo : armor;
        const base = other === photo ? armor : photo;
        const reset = (g: CanvasRenderingContext2D, c: HTMLCanvasElement) => {
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.globalCompositeOperation = 'source-over';
          g.globalAlpha = 1;
          g.imageSmoothingQuality = 'high';
          g.clearRect(0, 0, c.width, c.height);
          view(g);
        };
        const fw = FW * FIELD, fh = FH * FIELD;
        reset(lctx, layer);
        lctx.drawImage(base, 0, 0, W, H);
        lctx.globalCompositeOperation = 'destination-out';
        lctx.drawImage(maskC, 0, 0, fw, fh);
        reset(pctx, peek);
        pctx.drawImage(maskC, 0, 0, fw, fh);
        pctx.globalCompositeOperation = 'source-in';
        pctx.drawImage(other, 0, 0, W, H);
        // complementary masks add up to exactly one figure
        lctx.setTransform(1, 0, 0, 1, 0, 0);
        lctx.globalCompositeOperation = 'lighter';
        lctx.drawImage(peek, 0, 0);
        view(lctx);
        lctx.globalCompositeOperation = 'source-atop';
        lctx.drawImage(rimC, 0, 0, fw, fh);
        ctx.drawImage(layer, 0, 0, layer.width / scale, layer.height / scale);
      } else if (time <= 0) {
        ctx.drawImage(photo, 0, 0, W, H);
      } else if (time >= END) {
        ctx.drawImage(armor, 0, 0, W, H);
      } else {
        const poses = PIECES.map((_, i) => pose(i));
        const flying = (a: typeof poses[number]) => a.p > 0 && a.p < 1;
        // far-away pieces swing around behind the body
        const behind = (a: typeof poses[number]) => flying(a) && a.grow < 0.62;
        poses.forEach((a, i) => {
          if (!behind(a)) return;
          drawPlume(i, a, now, dir);
          drawPiece(i, a);
        });

        const key = poses.map(a => (a.p >= 1 ? 1 : 0)).join('');
        if (key !== bodyKey) {
          bodyKey = key;
          bctx.setTransform(1, 0, 0, 1, 0, 0);
          bctx.globalCompositeOperation = 'source-over';
          bctx.clearRect(0, 0, body.width, body.height);
          view(bctx);
          if (key.includes('0')) {
            bctx.drawImage(photo, 0, 0, W, H);
            bctx.globalCompositeOperation = 'destination-out';
            poses.forEach((a, i) => { if (a.p >= 1) bctx.drawImage(sprites[i].mask, sprites[i].x, sprites[i].y); });
            bctx.globalCompositeOperation = 'source-over';
          }
          poses.forEach((a, i) => { if (a.p >= 1) bctx.drawImage(sprites[i].cold, sprites[i].x, sprites[i].y); });
        }
        lctx.setTransform(1, 0, 0, 1, 0, 0);
        lctx.globalAlpha = 1;
        lctx.globalCompositeOperation = 'copy';
        lctx.drawImage(body, 0, 0);
        view(lctx);
        lctx.globalCompositeOperation = 'destination-out';
        poses.forEach((a, i) => {
          if (a.snap <= 0 || a.p >= 1) return;
          lctx.globalAlpha = smooth(a.snap);
          lctx.drawImage(sprites[i].mask, sprites[i].x, sprites[i].y);
        });
        // the rockets light up the suit as they come in
        lctx.globalCompositeOperation = 'source-atop';
        poses.forEach((a, i) => {
          if (!flying(a) || a.grow < 0.62) return;
          const p = sprites[i];
          const size = 420;
          lctx.globalAlpha = 0.5 * smooth((a.p - 0.3) / 0.3);
          lctx.drawImage(ember, p.cx + a.dx - size / 2, p.cy + a.dy - size / 2, size, size);
        });
        ctx.drawImage(layer, kick.x, kick.y, layer.width / scale, layer.height / scale);

        // seams still cooling
        ctx.globalCompositeOperation = 'lighter';
        poses.forEach((a, i) => {
          if (a.p < 1 || a.heat <= 0.01) return;
          ctx.globalAlpha = a.heat;
          ctx.drawImage(sprites[i].hot, sprites[i].x + kick.x, sprites[i].y + kick.y);
        });
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        drawLights(now, kick);

        drawFire();
        poses.forEach((a, i) => {
          if (flying(a) && !behind(a)) drawPlume(i, a, now, dir);
        });
        poses.forEach((a, i) => {
          if (flying(a) && !behind(a)) drawPiece(i, a);
        });
        // the seams flare up as a piece hits
        ctx.globalCompositeOperation = 'lighter';
        poses.forEach((_, i) => {
          const t = time - PIECES[i].at - FLIGHT;
          if (t < 0 || t > 0.2) return;
          const p = sprites[i];
          ctx.globalAlpha = 1 - t / 0.2;
          ctx.drawImage(p.hot, p.x + kick.x, p.y + kick.y);
        });
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      if (time >= END && !peeking) drawLights(now, kick);
      if (time <= 0 || time >= END) drawFire();
      ctx.globalCompositeOperation = 'lighter';
      const power = smooth((time - IGNITE) / COOL);
      if (power > 0) {
        const flicker = reduce ? 1 : 0.9 + Math.sin(now / 45) * 0.06 + Math.sin(now / 17) * 0.04;
        for (const j of JETS) {
          const size = (j.hand ? 130 : 140) * flicker;
          const y = j.y + (j.hand ? 4 : 10);
          stamp(blue, j.x, y, size, power * 0.5);
          stamp(blue, j.x, y, size * 0.36, power);
        }
      }
      for (const p of particles) {
        if (p.kind !== 'spark') continue;
        const t = 1 - p.age / p.life;
        stamp(fire, p.x, p.y, p.size * (0.5 + t), t);
      }
      ctx.globalAlpha = 1;
    };

    /** Touch every texture once, so the GPU does not upload them all in the middle of the flight. */
    const warmUp = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.004;
      [...sprites.flatMap(p => [p.cold, p.hot, p.shade, p.mask]), ...flames, core, blue, fire, ember, smoke]
        .forEach(c => ctx.drawImage(c, 0, 0, 2, 2));
      if (armor) ctx.drawImage(armor, 0, 0, 2, 2);
      draw(performance.now());
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || document.hidden || !armor) return;
      const dt = last ? Math.max(0, Math.min(0.12, (now - last) / 1000)) : 1 / 60;
      last = now;
      step(dt);
      draw(now);
      const resting = particles.length === 0 && !peeking && !pointer.inside && (suitedRef.current ? reduce : time <= 0);
      if (!resting) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (disposed || raf || !visible || document.hidden || !armor) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const resize = () => {
      // oversample on 1x screens: fine panel lines alias badly otherwise
      const dpr = Math.min(1.6, Math.max(1.35, window.devicePixelRatio || 1));
      scale = Math.max(0.05, (host.clientWidth / W) * dpr);
      canvas.width = Math.round(CW * scale);
      layer.width = peek.width = body.width = Math.round(W * scale);
      canvas.height = Math.round(CH * scale);
      layer.height = peek.height = body.height = Math.round(H * scale);
      bodyKey = '';
      draw(performance.now());
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    io.observe(host);

    // give the visitor a moment with the photo before the armour arrives
    const firstView = new IntersectionObserver(([entry]) => {
      window.clearTimeout(viewTimer);
      if (!entry.isIntersecting) return;
      viewTimer = window.setTimeout(() => {
        firstView.disconnect();
        firstViewRef.current?.();
      }, 1200);
    }, { threshold: 0.6 });

    const onMove = (e: PointerEvent) => {
      // offsetX/Y stay correct while the parent tilts in 3D
      if (e.target !== host) return;
      pointer.x = (e.offsetX / host.clientWidth) * W;
      pointer.y = (e.offsetY / host.clientHeight) * H;
      pointer.inside = true;
      wake();
    };
    const onLeave = () => { pointer.inside = false; };
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });
    host.addEventListener('pointercancel', onLeave, { passive: true });

    document.addEventListener('visibilitychange', wake);

    Promise.all([loadImage(src), loadImage(armorSrc)]).then(([a, b]) => {
      if (disposed) return;
      photo = a;
      armor = b;
      solid = buildSolid([a, b]);
      const stray = strayCells(solid);
      sprites = PIECES.map((def, i) => buildSprite(def, stray[i], b));
      resize();
      warmUp();
      wake();
      firstView.observe(host);
    }).catch(() => { /* nothing to animate without the images */ });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(viewTimer);
      ro.disconnect();
      io.disconnect();
      firstView.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointercancel', onLeave);
      document.removeEventListener('visibilitychange', wake);
      wakeRef.current = () => {};
    };
  }, [src, armorSrc]);

  return (
    <div ref={hostRef} className="relative w-full h-full" style={{ touchAction: 'pan-y' }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `${(-PAD.x / W) * 100}%`,
          top: `${(-PAD.top / H) * 100}%`,
          width: `${(CW / W) * 100}%`,
          height: `${(CH / H) * 100}%`,
          maxWidth: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default SuitUp;
