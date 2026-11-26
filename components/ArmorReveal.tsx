// Halftone Reveal by React Bits (https://reactbits.dev/animations/halftone-reveal), MIT licence.
// Copied from the React Bits registry (HalftoneReveal-TS-TW). Local changes: demo image (remote Unsplash
// photo) removed; settings ref updated in a layout effect instead of during render; added a
// `transparentPaper` option (alpha canvas, premultiplied output for mono/duotone and the revealed photo).
// Adapted to this portfolio: 22 body panels + helmet + faceplate measured on public/ironman-hero.webp
// (panel map public/ironman-panels.png); the `flipped` prop replaces `flipSignal` and can reverse the
// suit-up mid-way; `onReady` and `onProgress` let the page time its own effects.
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

// Demo image (remote Unsplash photo) removed: always pass `src`.
const DEFAULT_SRC = "";
const NO_BLEED: [number, number] = [0, 0];

export type HalftoneRevealMode = "mono" | "duotone" | "color";

export type HalftoneRevealShape =
  "dot" | "ellipse" | "square" | "diamond" | "line" | "cross";

export interface HalftoneRevealProps {
  src?: string;
  /** Local addition: when set, `src` shows sharp and this photo is revealed through halftone dots. */
  revealSrc?: string;
  /** Local addition (`effect="armor"`): grayscale map of the armour pieces, aligned with revealSrc, red
   *  (value = panel id * 8 + 4). Pieces then follow the armour's own seams. */
  piecesSrc?: string;
  fit?: "contain" | "cover";
  mode?: HalftoneRevealMode;
  shape?: HalftoneRevealShape;
  cellSize?: number;
  angle?: number;
  dotScale?: number;
  inkColor?: string;
  accentColor?: string;
  paperColor?: string;
  /** Local addition: draw no paper at all (transparent canvas), so the page shows through. */
  transparentPaper?: boolean;
  contrast?: number;
  brightness?: number;
  invert?: boolean;
  roughness?: number;
  misregistration?: number;
  revealRadius?: number;
  softness?: number;
  linger?: number;
  reverse?: boolean;
  wander?: boolean;
  clickBurst?: boolean;
  /** Local addition: false switches the hover and tap effects off (`flipSignal` still switches the photo). */
  interactive?: boolean;
  /** Local addition: how far (px, sideways / up and down) the canvas reaches beyond the box, so a switch can play
   *  around the photo too. Kept inside the window; the box and its pointer area stay the same. */
  bleed?: [number, number];
  /** Local addition (with revealSrc): a tap/click spreads the other photo over the whole frame and keeps it;
   *  the next tap switches back. Hover still reveals the photo that is not showing. */
  toggleOnTap?: boolean;
  /** Local addition (swap mode): "lightning" tints the switch glow electric blue instead of the accent;
   *  "glitch" replaces the switch shockwave with a Spider-Verse glitch (sliced, shifted, red/cyan split bands
   *  that flip to the other photo one by one), kept inside the figure. */
  effect?: "halftone" | "lightning" | "glitch" | "armor";
  /** Local addition (`effect="glitch"`): centre of the spider web (share of the frame), e.g. the hands. */
  webCenter?: [number, number];
  /** Local addition (with revealSrc): which photo is kept (false = `src`, true = `revealSrc`). A change plays
   *  the switch; changing it back mid-way runs the same film backwards from where it is. */
  flipped?: boolean;
  /** `flipped` changes switch the photo at once, without playing the film. */
  instant?: boolean;
  /** After every frame: which photo is kept, and whether the pointer is revealing the other one. */
  onDrawn?: (flipped: boolean, touching: boolean) => void;
  /** Fires once all pictures are loaded and the effect draws. */
  onReady?: () => void;
  /** How far the switch is, every frame of it: 0 = all `src`, 1 = all `revealSrc`. */
  onProgress?: (done: number) => void;
  intro?: boolean;
  className?: string;
  style?: CSSProperties;
}

type Settings = {
  fit: "contain" | "cover";
  mode: number;
  shape: number;
  cellSize: number;
  angle: number;
  dotScale: number;
  inkColor: string;
  accentColor: string;
  paperColor: string;
  clear: boolean;
  contrast: number;
  brightness: number;
  invert: boolean;
  roughness: number;
  misregistration: number;
  revealRadius: number;
  softness: number;
  linger: number;
  reverse: boolean;
  wander: boolean;
  clickBurst: boolean;
  interactive: boolean;
  instant: boolean;
  bleed: [number, number];
  toggleOnTap: boolean;
  effect: string;
  webCenter: [number, number];
  intro: boolean;
};

type MaskTarget = {
  texture: WebGLTexture | null;
  framebuffer: WebGLFramebuffer | null;
  width: number;
  height: number;
};

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const MASK = `#version 300 es
precision highp float;
uniform sampler2D uPrevious;
uniform vec2 uTexture;
uniform vec2 uView;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uSoftness;
uniform float uStrength;
uniform float uFade;
out vec4 outColor;

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
  return length(p - a - ab * h);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uTexture;
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uView;
  float trail = max(texture(uPrevious, uv).r - uFade, 0.0);
  float band = max(uRadius * uSoftness, 1.0);
  float brush = clamp((uRadius - segment(p, uFrom, uTo)) / band, 0.0, 1.0);
  brush = brush * brush * (3.0 - 2.0 * brush);
  outColor = vec4(max(trail, brush * uStrength), 0.0, 0.0, 1.0);
}`;

const VIEW = `#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uMask;
uniform sampler2D uReveal;
uniform sampler2D uPieces;
uniform float uHasPieces;
const float uSwap = __uSwap__;
uniform float uFlipped;
const float uStyle = __uStyle__;
uniform float uTime;
uniform float uFlipK;
uniform vec2 uWebC;
uniform vec3 uFlip;
uniform vec2 uResolution;
uniform vec2 uView;
uniform float uDpr;
uniform vec4 uFrame;
uniform float uTexels;
const float uMode = __uMode__;
const float uShape = __uShape__;
uniform float uCell;
uniform float uAngle;
uniform float uScale;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform vec3 uPaper;
const float uClear = __uClear__;
uniform float uContrast;
uniform float uBrightness;
uniform float uInvert;
uniform float uRough;
uniform float uShift;
uniform vec3 uMatte;
uniform vec3 uMatte2;
uniform float uKey2;
uniform float uKey;
uniform float uReverse;
uniform float uIntro;
uniform vec4 uBursts[4];
uniform float uBurstWidth;
out vec4 outColor;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const vec3 CYAN = vec3(0.0, 0.64, 0.93);
const vec3 MAGENTA = vec3(0.92, 0.07, 0.56);
const vec3 YELLOW = vec3(1.0, 0.91, 0.0);
const vec3 KEY = vec3(0.11, 0.1, 0.12);
const vec3 RED = vec3(1.0, 0.16, 0.12);
const vec3 GREEN = vec3(0.12, 1.0, 0.3);
const vec3 BLUE = vec3(0.16, 0.32, 1.0);

mat2 rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec4 photo(vec2 p, float lod, float margin) {
  vec2 uv = (p - uFrame.xy) / uFrame.zw;
  vec4 c = textureLod(uImage, clamp(uv, 0.0, 1.0), lod);
  vec2 slack = margin * uCell / uFrame.zw;
  vec2 inside = step(-slack, uv) * step(uv, 1.0 + slack);
  float keep = inside.x * inside.y * c.a;
  keep *= mix(1.0, smoothstep(0.05, 0.2, distance(c.rgb, uMatte2)), uKey2);
  return vec4(c.rgb, keep);
}

// Second photo (same frame as the first, keyed against its own background colour).
vec4 revealPhoto(vec2 p) {
  vec2 uv = (p - uFrame.xy) / uFrame.zw;
  vec4 c = textureLod(uReveal, clamp(uv, 0.0, 1.0), 0.0);
  vec2 inside = step(0.0, uv) * step(uv, vec2(1.0));
  float keep = inside.x * inside.y * c.a;
  keep *= mix(1.0, smoothstep(0.05, 0.2, distance(c.rgb, uMatte)), uKey);
  return vec4(c.rgb, keep);
}

float grade(float v) {
  v = clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
  return mix(v, 1.0 - v, uInvert);
}

vec3 gradeColor(vec3 c) {
  return vec3(grade(c.r), grade(c.g), grade(c.b));
}

vec3 tone(vec3 c) {
  return pow(max(c, 0.0), vec3(1.5));
}

float press(float t, float alpha) {
  return (0.05 + clamp(t, 0.0, 1.0) * 0.89) * alpha;
}

float plate(float t, float alpha) {
  return (0.02 + clamp(t, 0.0, 1.0) * 0.92) * alpha;
}

vec3 decode(vec3 c) {
  return pow(max(c, 0.0), vec3(2.2));
}

vec4 separate(vec3 color) {
  vec3 target = clamp(tone(gradeColor(color)) / max(tone(uPaper), vec3(0.02)), 0.0, 1.0);
  vec3 absorbC = 1.0 - decode(CYAN);
  vec3 absorbM = 1.0 - decode(MAGENTA);
  vec3 absorbY = 1.0 - decode(YELLOW);
  float bright = pow(max(max(target.r, target.g), target.b), 0.4545);
  float key = pow(clamp(1.0 - bright / 0.62, 0.0, 1.0), 1.4) * 0.95;
  vec3 rest = clamp(target / max(1.0 - key * (1.0 - decode(KEY)), vec3(0.03)), 0.0, 1.0);
  vec3 a = 1.0 - rest;
  for (int i = 0; i < 3; i++) {
    vec3 tc = 1.0 - a.x * absorbC;
    vec3 tm = 1.0 - a.y * absorbM;
    vec3 ty = 1.0 - a.z * absorbY;
    mat3 slope = mat3(-absorbC * tm * ty, -absorbM * tc * ty, -absorbY * tc * tm);
    if (abs(determinant(slope)) < 1e-6) break;
    a = clamp(a - inverse(slope) * (tc * tm * ty - rest), 0.0, 1.0);
  }
  return vec4(a, key);
}

vec3 emit(vec3 color) {
  vec3 target = max(tone(gradeColor(color)) - tone(uPaper), 0.0);
  mat3 lights = mat3(decode(RED), decode(GREEN), decode(BLUE));
  return clamp(inverse(lights) * target, 0.0, 1.0);
}

float metric(vec2 f) {
  if (uShape < 0.5) return length(f);
  if (uShape < 1.5) return length(f * vec2(0.8, 1.15));
  if (uShape < 2.5) return max(abs(f.x), abs(f.y));
  if (uShape < 3.5) return abs(f.x) + abs(f.y);
  if (uShape < 4.5) return abs(f.y);
  return min(abs(f.x), abs(f.y));
}

float reach(float t) {
  t = clamp(t, 0.0, 1.0);
  if (uShape < 0.5) return t < 0.785 ? sqrt(t / 3.14159) : mix(0.5, 0.72, (t - 0.785) / 0.215);
  if (uShape < 1.5) return t < 0.7 ? sqrt(t * 0.92 / 3.14159) : mix(0.4497, 0.72, (t - 0.7) / 0.3);
  if (uShape < 2.5) return 0.5 * sqrt(t) + 0.02 * t;
  if (uShape < 3.5) return t < 0.5 ? sqrt(t * 0.5) : 1.0 - sqrt((1.0 - t) * 0.5);
  if (uShape < 4.5) return 0.52 * t;
  return (1.0 - sqrt(1.0 - t)) * 0.5 + 0.02 * t;
}

vec2 center(vec2 p, float angle) {
  vec2 q = rotate(angle) * p / uCell;
  vec2 c = floor(q) + 0.5;
  if (uShape > 3.5 && uShape < 4.5) c.x = q.x;
  return rotate(-angle) * c * uCell;
}

float dots(vec2 p, float angle, float t, float seed, float grow) {
  vec2 q = rotate(angle) * p / uCell;
  float d = metric(fract(q) - 0.5);
  d += (noise(p * 0.42 + seed * 17.0) - 0.5) * uRough * 0.18;
  float r = reach(t) * uScale * grow;
  float w = max(fwidth(d), 0.0001) * 0.75;
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);
}

float coverage(vec4 image) {
  float shade = dot(tone(gradeColor(image.rgb)), LUMA);
  float paper = dot(tone(uPaper), LUMA);
  float span = dot(tone(uInk), LUMA) - paper;
  float t = abs(span) < 0.02 ? 1.0 - shade : (shade - paper) / span;
  return press(t, image.a);
}

float burst(vec2 p) {
  float value = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 b = uBursts[i];
    if (b.w <= 0.0) continue;
    float offset = distance(p, b.xy) - b.z;
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * b.w);
  }
  return value;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

// Jagged lightning bolts radiating from c out to rad (count bolts; seed fixes their directions).
// Returns a bright core plus a soft glow around each bolt, tapering towards the tips.
// Distance (px) to the nearest thread of a spider web centred on c: 18 spokes plus straight-chord rings
// every 28px (the rings run straight between spokes, like a real orb web).
// Armour plates: a brick grid of PLATE px tiles; xy = tile centre, zw = tile id.
const float PLATE = 22.0;
vec4 plateOf(vec2 p) {
  float row = floor(p.y / PLATE);
  float shift = mod(row, 2.0) * 0.5 * PLATE;
  float col = floor((p.x + shift) / PLATE);
  return vec4((col + 0.5) * PLATE - shift, (row + 0.5) * PLATE, col, row);
}

// Iron Man armour panels, in the order they go on. They follow the panels of the armour in the photo (segmented
// along its own seams, see piecesSrc): boots, ankles, shins, knees, thighs, hips, hands, forearms, arms, shoulders,
// abdomen, chest, helmet (28); the faceplate (29) swings down by itself.
const int HELMET = 22;
const int FACE = 23;
// Centre of each panel (share of the frame).
uniform vec4 uPieceInfo[23]; // centre, radius (share of the frame height)
#define PIECE_C(i) uPieceInfo[i].xy
#define PIECE_R(i) uPieceInfo[i].z
// The panels in the air this frame, worked out once per frame on the CPU (pixels):
uniform int uFlying;
uniform vec4 uFlyA[14]; // panel, clock, away, shut
uniform vec4 uFlyB[14]; // position, scale, reach of everything it draws
uniform vec4 uFlyC[14]; // way in (unit), bend side, unused
uniform vec4 uFlyD[14]; // motion per frame, unused
// Panel at a frame-normalised point.
float pieceOf(vec2 n) {
  if (uHasPieces < 0.5) return float(HELMET - 1);
  return floor(textureLod(uPieces, clamp(n, 0.0, 1.0), 0.0).r * 255.0 / 8.0);
}

// The clock of piece i in the suit-up (t = 0..1): 0 = far away, FLY_END = beside its limb, CLAMP_END = shut.
const float FLY_END = 0.58;
const float CLAMP_START = 0.46;
const float CLAMP_END = 0.9;
float pieceK(int i, float t) {
  // One panel after the other: each takes ~2.6s, the next sets off ~0.25s later.
  if (i >= HELMET) return (t - 0.64) / 0.236;
  return (t - 0.005 - float(i) * (0.613 / float(HELMET - 1))) / 0.236;
}

float ease5(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

// The faceplate in the armour photo, hinged at the forehead.
const float FACE_X = 0.5646;
bool isFace(vec2 n) {
  return abs(pieceOf(n) - float(FACE)) < 0.5;
}

// The faceplate as a curved shell turning on pivots at the temples: openK 0 = shut, 1 = up over the forehead.
// Premultiplied colour at frame-normalised point n.
const float PIVOT = 0.092;
vec4 visor(vec2 n, float openK) {
  float turn = openK * 1.2;
  float cs = cos(turn);
  float sn = sin(turn);
  vec4 result = vec4(0.0);
  // Inner shell first (its thickness shows below the rim), then the outer one.
  for (int layer = 0; layer < 2; layer++) {
    float depth = layer == 0 ? 0.04 : 0.05;
    float x = FACE_X + (n.x - FACE_X) / (1.0 + 0.1 * sn);
    float curve = (x - FACE_X) / 0.058;
    float z = depth * sqrt(max(1.0 - curve * curve, 0.0));
    vec2 q = vec2(x, PIVOT + (n.y - PIVOT + z * sn) / cs);
    if (!isFace(q)) continue;
    vec4 a = revealPhoto(uFrame.xy + q * uFrame.zw);
    if (layer == 0) {
      // Hidden behind the outer shell while shut.
      if (sn > 0.04) result = vec4(mix(vec3(dot(a.rgb, LUMA)), a.rgb, 0.4) * 0.22 * a.a, a.a);
      continue;
    }
    vec2 eyeA = (q - vec2(0.534, 0.0978)) / vec2(0.022, 0.0065);
    vec2 eyeB = (q - vec2(0.595, 0.0993)) / vec2(0.022, 0.0065);
    float eyes = max(exp(-dot(eyeA, eyeA)), exp(-dot(eyeB, eyeB)));
    // Light from above slides over the curved metal as it turns.
    float band = (q.y - mix(0.145, 0.045, openK)) / 0.02;
    float gloss = exp(-band * band) * sin(clamp(openK, 0.0, 1.0) * 3.14159) * 0.32;
    float side = 1.0 - 0.35 * curve * curve * sn;
    vec3 col = a.rgb * (1.0 - 0.85 * eyes) * side * (1.0 + 0.12 * sn) + gloss;
    result = vec4(min(col, vec3(1.0)) * a.a, a.a);
  }
  return result;
}

// Nanotech hex lattice: xy = offset from the nearest hex cell centre, zw = that cell's id (p in cell units).
vec4 hexCell(vec2 p) {
  const vec2 s = vec2(1.0, 1.7320508);
  vec4 hc = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
  vec4 h = vec4(p - hc.xy * s, p - (hc.zw + 0.5) * s);
  return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, hc.xy) : vec4(h.zw, hc.zw + 0.5);
}
// Hexagonal distance from a cell centre: 0 at the centre, 0.5 on the cell's sides.
float hexDist(vec2 v) {
  v = abs(v);
  return max(dot(v, vec2(0.5, 0.8660254)), v.x);
}

const float WEB_RING = 28.0;
float webDist(vec2 p, vec2 c) {
  vec2 v = p - c;
  float r = length(v);
  float a = atan(v.y, v.x);
  float spokes = 18.0;
  float sa = abs(fract(a / 6.28318 * spokes + 0.5) - 0.5) / spokes * 6.28318;
  float spokeD = sin(sa) * r;
  float rr = r * cos(sa);
  float ringD = abs(fract(rr / WEB_RING + 0.5) - 0.5) * WEB_RING;
  return min(spokeD, ringD);
}

float bolts(vec2 p, vec2 c, float rad, float seed, float count) {
  vec2 v = p - c;
  float dist = length(v);
  if (dist > rad || dist < 2.0) return 0.0;
  float ang = atan(v.y, v.x) / 6.28318 + 0.5;
  float jag = (fbm(vec2(dist * 0.035 + seed * 5.0, seed * 3.1 + uTime * 7.0)) - 0.5) * 1.1;
  float s = fract(ang * count + seed + jag);
  float px = abs(s - 0.5) * 6.28318 * dist / count;
  float taper = 1.0 - dist / rad;
  float core = 1.0 - smoothstep(0.0, 1.2 + 1.6 * taper, px);
  float halo = exp(-px / (5.0 + 6.0 * taper));
  return (core + 0.45 * halo) * taper;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;
  float lod = log2(max(uCell * uTexels, 1.0));
  float base = uAngle;
  vec2 drift = vec2(uShift, uShift * -0.6);

  vec2 field = p / max(uView.x, uView.y) - uView / max(uView.x, uView.y) * 0.5;
  float delay = length(field) * 1.15 + hash(floor(p / uCell)) * 0.06;
  float grow = smoothstep(0.0, 1.0, clamp((uIntro * 1.7 - delay) / 0.45, 0.0, 1.0));

  vec3 print = uPaper;
  // Transparent-paper output (premultiplied colour + alpha), filled for mono and duotone.
  vec3 clearC = print;
  float clearA = 1.0;
  if (uMode < 0.5) {
    float k = dots(p, base, coverage(photo(center(p, base), lod, 0.5)), 0.0, grow);
    print = mix(uPaper, uInk, k);
    // Only print where the photo itself is opaque (no dots over its transparent background).
    float cellAlpha = photo(center(p, base), lod, 0.5).a;
    clearC = uInk * k * cellAlpha;
    clearA = k * cellAlpha;
  } else if (uMode < 1.5) {
    float second = base + 0.5236;
    float tA = coverage(photo(center(p, base), lod, 0.5));
    float tB = coverage(photo(center(p + drift, second) - drift, lod, 0.5));
    float kA = dots(p, base, pow(tA, 1.9), 0.0, grow);
    float kB = dots(p + drift, second, clamp(tB * 1.3, 0.0, 1.0) * 0.8, 1.0, grow);
    float cellAlpha = photo(center(p, base), lod, 0.5).a;
    clearA = (kA + kB * (1.0 - kA)) * cellAlpha;
    clearC = (uInk * kA + uAccent * kB * (1.0 - kA)) * cellAlpha;
    if (dot(uPaper, LUMA) > 0.5) {
      print = uPaper * mix(vec3(1.0), uAccent, kB) * mix(vec3(1.0), uInk, kA);
    } else {
      print = min(uPaper + uAccent * kB + uInk * kA, vec3(1.0));
    }
  } else if (dot(uPaper, LUMA) > 0.5) {
    float ac = base - 0.5236;
    float am = base + 0.5236;
    float ay = base - 0.7854;
    vec4 sc = photo(center(p + drift, ac) - drift, lod, 0.5);
    vec4 sm = photo(center(p - drift, am) + drift, lod, 0.5);
    vec4 sy = photo(center(p + drift.yx, ay) - drift.yx, lod, 0.5);
    vec4 sk = photo(center(p, base), lod, 0.5);
    float kc = sc.a > 0.0 ? dots(p + drift, ac, plate(separate(sc.rgb).x, sc.a), 1.0, grow) : 0.0;
    float km = sm.a > 0.0 ? dots(p - drift, am, plate(separate(sm.rgb).y, sm.a), 2.0, grow) : 0.0;
    float ky = sy.a > 0.0 ? dots(p + drift.yx, ay, plate(separate(sy.rgb).z, sy.a), 3.0, grow) : 0.0;
    float kk = sk.a > 0.0 ? dots(p, base, plate(separate(sk.rgb).w, sk.a), 4.0, grow) : 0.0;
    print = uPaper;
    print *= mix(vec3(1.0), CYAN, kc);
    print *= mix(vec3(1.0), MAGENTA, km);
    print *= mix(vec3(1.0), YELLOW, ky);
    print *= mix(vec3(1.0), KEY, kk);
  } else {
    float ar = base - 0.5236;
    float ag = base + 0.5236;
    vec4 sr = photo(center(p + drift, ar) - drift, lod, 0.5);
    vec4 sg = photo(center(p - drift, ag) + drift, lod, 0.5);
    vec4 sb = photo(center(p, base), lod, 0.5);
    float kr = dots(p + drift, ar, plate(emit(sr.rgb).x, sr.a), 1.0, grow);
    float kg = dots(p - drift, ag, plate(emit(sg.rgb).y, sg.a), 2.0, grow);
    float kb = dots(p, base, plate(emit(sb.rgb).z, sb.a), 3.0, grow);
    print = min(uPaper + RED * kr + GREEN * kg + BLUE * kb, vec3(1.0));
  }

  vec2 maskUv = vec2(p.x / uView.x, 1.0 - p.y / uView.y);
  float brushMask = textureLod(uMask, maskUv, 0.0).r;
  float shown = max(brushMask, burst(p));
  // Lightning style only tints the switch glow electric blue (bolts are drawn by ThunderOverlay).
  float electric = 0.0;
  // Switch transition (uFlip = x, y, radius): a disc of the other photo spreading out, dissolving in through
  // a wide band of halftone dots behind a glowing shockwave.
  float flipDist = 0.0;
  float wave = 0.0;
  float echo = 0.0;
  float flash = 0.0;
  vec2 waveDir = vec2(0.0);
  if (uFlip.z > 0.0 && uStyle < 1.5) {
    flipDist = distance(p, uFlip.xy);
    waveDir = (p - uFlip.xy) / max(flipDist, 1.0);
    float band = max(uCell * 16.0, 110.0);
    shown = max(shown, 1.0 - smoothstep(uFlip.z - band, uFlip.z, flipDist));
    // Shockwave front, a thinner echo ring behind it, and a flash at the centre while the wave is young.
    wave = 1.0 - smoothstep(0.0, 70.0, abs(flipDist - uFlip.z));
    wave *= wave;
    echo = (1.0 - smoothstep(0.0, 26.0, abs(flipDist - uFlip.z * 0.78))) * 0.55;
    flash = exp(-uFlip.z / 90.0) * (1.0 - smoothstep(0.0, 180.0, flipDist));
    if (uStyle > 0.5) {
      wave = 0.0;
      echo = 0.0;
    }
  }
  shown = mix(shown, 1.0 - shown, uReverse);
  shown = shown * shown * (3.0 - 2.0 * shown);
  vec2 q = rotate(base) * p / uCell;
  float d = metric(fract(q) - 0.5);
  // Swap mode grows the dots past the cell corners (0.75 > 0.707) so a full reveal leaves no gaps.
  float r = mix(reach(1.0) * 1.08, 0.75, uSwap) * shown;
  float w = max(fwidth(d), 0.0001) * 0.75;
  float k = smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);
  if (uStyle > 1.5 && uStyle < 2.5) {
    // Spider style: the other photo shows through web threads that thicken until they fill the area.
    float threadW = shown * WEB_RING * 0.62;
    float wd = webDist(p, uWebC);
    k = shown > 0.002 ? smoothstep(threadW + 0.9, threadW - 0.9, wd) : 0.0;
  }
  vec4 sharp = photo(p, 0.0, 0.0);
  if (uSwap > 0.5) {
    // Swap mode: the first photo stays sharp; the second grows in as halftone dots. During a switch the
    // image is bent around the shockwave (refraction) with a red/blue split at the front.
    vec4 next = revealPhoto(p);
    if (wave > 0.001) {
      vec2 pw = p - waveDir * wave * 18.0;
      vec2 split = waveDir * wave * 6.0;
      vec4 s0 = photo(pw, 0.0, 0.0);
      vec4 n0 = revealPhoto(pw);
      sharp = vec4(photo(pw + split, 0.0, 0.0).r, s0.g, photo(pw - split, 0.0, 0.0).b, s0.a);
      next = vec4(revealPhoto(pw + split).r, n0.g, revealPhoto(pw - split).b, n0.a);
    }
    // After a tap toggle the two photos trade places.
    if (uFlipped > 0.5) {
      vec4 held = sharp;
      sharp = next;
      next = held;
    }
    vec4 basePm = vec4(sharp.rgb * sharp.a, sharp.a);
    vec4 nextPm = vec4(next.rgb * next.a, next.a);
    vec4 mixed = mix(basePm, nextPm, k);
    if (uStyle > 2.5) {
      vec4 person = photo(p, 0.0, 0.0);
      vec4 armour = revealPhoto(p);
      if (uFlipK > 0.0) {
        // Iron Man suit-up (reveal photo = armour). One after the other, the panels of the suit come gliding from
        // far away, tiny at first, each driven by clean ion thrusters, brake all the way in and press onto the
        // body with a seam that cools. The helmet arrives with its faceplate raised and closes around
        // the head; then the faceplate turns down over the face, locks, and the eyes come on. Taking it off is
        // the same film backwards, with the thrusters pushing the other way.
        bool assemble = uFlipped < 0.5;
        float t = assemble ? uFlipK : 1.0 - uFlipK;
        float F = uFrame.w;
        vec2 n = (p - uFrame.xy) / uFrame.zw;
        int here = int(pieceOf(n) + 0.5);
        float hereK = pieceK(here, t);
        float hereOn = smoothstep(CLAMP_END + 0.03, CLAMP_END + 0.08, hereK);
        bool face = here == FACE;
        bool head = here >= HELMET;
        // The face stays free until the faceplate is down.
        // Unlatch, one even swing down, and a soft stop.
        float plateDown = ease5((t - 0.875) / 0.07);
        if (face) hereOn *= step(0.9995, plateDown);
        vec4 g = mix(vec4(person.rgb * person.a, person.a), vec4(armour.rgb * armour.a, armour.a), hereOn);
        // The arc reactor stays dark until the chest has locked.
        vec2 fromReactor = (n - vec2(0.5625, 0.2425)) * vec2(uFrame.z / F, 1.0);
        float chestPost = (pieceK(HELMET - 1, t) - CLAMP_END) / 0.34;
        if (here >= HELMET - 2 && here < HELMET && hereOn > 0.0)
          g.rgb *= mix(1.0, smoothstep(0.1, 0.6, chestPost) * 0.8 + 0.2, exp(-dot(fromReactor, fromReactor) / 0.0012));

        // Docking guide: while its panel lines up, the place on the body shows a soft projected outline that
        // tightens, with a scan passing over it.
        if (here < FACE && hereK > 0.2 && hereK < CLAMP_END + 0.05) {
          float guide = smoothstep(0.2, 0.42, hereK) * (1.0 - smoothstep(CLAMP_END - 0.04, CLAMP_END + 0.05, hereK));
          float edge = 0.0;
          for (int r = 1; r <= 4; r++) {
            vec2 sp = float(r) * 1.5 / uFrame.zw;
            float id = float(here);
            edge += step(0.5, abs(id - pieceOf(n + vec2(sp.x, 0.0))) + abs(id - pieceOf(n - vec2(sp.x, 0.0)))
              + abs(id - pieceOf(n + vec2(0.0, sp.y))) + abs(id - pieceOf(n - vec2(0.0, sp.y)))) * 0.25;
          }
          // Where the panel ends in the air (no neighbour): the armour's own outline.
          float outline = smoothstep(0.1, 0.5, armour.a) * (1.0 - smoothstep(0.5, 0.95, armour.a));
          vec2 local = (n - PIECE_C(here)) * vec2(uFrame.z / F, 1.0) / PIECE_R(here);
          float scanAt = local.y - mix(-1.2, 1.2, fract(hereK * 2.2));
          float scan = exp(-scanAt * scanAt * 40.0);
          float light = (edge * edge * 0.7 + outline * 0.6 + scan * 0.28 + 0.05) * guide;
          g.rgb = min(g.rgb + vec3(0.55, 0.82, 1.0) * light * max(g.a, 0.0), vec3(g.a));
        }

        vec4 fly = vec4(0.0);
        vec4 jet = vec4(0.0); // thrusters, behind the panels (premultiplied)
        for (int slot = 0; slot < 14; slot++) {
          if (slot >= uFlying) break;
          vec4 fb = uFlyB[slot];
          vec2 dp = p - fb.xy;
          if (dot(dp, dp) > fb.w * fb.w) continue;
          vec4 fa = uFlyA[slot];
          int i = int(fa.x + 0.5);
          float lk = fa.y;
          float away = fa.z;
          float shut = fa.w;
          float scale = fb.z;
          vec2 dir = uFlyC[slot].xy;
          vec2 side = vec2(-dir.y, dir.x) * uFlyC[slot].z;
          vec2 motion = uFlyD[slot].xy;
          vec2 cpx = uFrame.xy + PIECE_C(i) * uFrame.zw;
          float rad = PIECE_R(i) * F;
          {
            float align = smoothstep(0.3, 0.62, lk) * (1.0 - smoothstep(0.6, 0.76, lk));
            // Contact: it is pushed a little too far in, then springs back flush.
            float press = clamp((lk - CLAMP_END + 0.04) / 0.13, 0.0, 1.0);
            float reachPx = rad * scale * 1.95 + 6.0 + length(motion);

            // The piece shades the body it is about to cover, and its flame lights it warmly.
            float coming = (1.0 - away) * (1.0 - shut);
            if (g.a > 0.0 && dot(dp, dp) < rad * rad * 7.0) {
            vec2 ds0 = (dp - vec2(0.0, rad * 0.14)) / (rad * 1.05);
            g.rgb *= 1.0 - 0.5 * coming * exp(-dot(ds0, ds0) * 1.6);
            g.rgb = min(g.rgb * (1.0 + vec3(0.1, 0.26, 0.4) * align * exp(-dot(dp, dp) / (rad * rad * 1.8))), vec3(g.a));
            }

            if (dot(dp, dp) < reachPx * reachPx) {
              float liftK = 1.0 - shut;
              float visible = smoothstep(0.0, 0.1, lk) * (1.0 - smoothstep(CLAMP_END + 0.07, CLAMP_END + 0.12, lk));
              float lockAt = clamp((lk - 0.8) / 0.14, 0.0, 1.0);
              float lockGlint = lockAt > 0.0 && lockAt < 1.0 ? sin(lockAt * 3.14159) : 0.0;
              // Samples along the path: motion blur while it is fast, soft edges when it is slow.
              vec4 sum = vec4(0.0);
              for (int m = 0; m < 3; m++) {
                float fm = (float(m) - 1.0) / 3.0;

                vec2 dm = dp + motion * fm + vec2(fm, fract(float(m) * 0.5) - 0.25) * 1.1;
                // Never turned, tilted or squeezed: the panel keeps its true shape, only moved and scaled.
                vec2 u = dm / scale;
                vec2 ns = (cpx + u - uFrame.xy) / uFrame.zw;
                if (ns.x < 0.0 || ns.y < 0.0 || ns.x > 1.0 || ns.y > 1.0) continue;
                if (i == HELMET) {
                  vec4 up = visor(ns, 1.0);
                  sum += up;
                  if (up.a > 0.5) continue;
                }
                if (int(pieceOf(ns) + 0.5) != i) continue;
                vec4 a = revealPhoto(cpx + u);
                if (a.a < 0.02) continue;
                // Thickness: a thin catch of light along the panel's own edge while it is off the body.
                vec2 ep = 1.8 / (uFrame.zw * scale);
                float rim = step(0.5, abs(pieceOf(ns - ep) - float(i))) * liftK;
                vec3 col = a.rgb * (1.0 - 0.22 * sin(press * 3.14159)) + vec3(0.75, 0.72, 0.68) * rim * 0.4;
                // A reflection slides across it while it travels in; a glint when it locks.
                float reflectAt = (u.x * 0.5 + u.y) / rad - mix(-1.8, 1.8, smoothstep(0.45, 0.88, lk));
                col += (col * 0.6 + 0.03) * exp(-reflectAt * reflectAt * 7.0) * liftK;
                col += col * lockGlint * 0.5;
                sum += vec4(min(col, vec3(1.0)) * a.a, a.a);
              }
              sum *= visible / 3.0;
              fly = sum + fly * (1.0 - sum.a);
            }

            // Ion thruster: a slim, clean plasma jet straight behind the panel, exactly opposite to its motion (a
            // pair on the large panels). White-hot core with standing shock diamonds in a cyan-blue sheath; it
            // shortens smoothly as the panel brakes.
            float thrust = smoothstep(0.0, 0.1, lk) * max(1.0 - smoothstep(0.15, 0.5, lk), 0.22 * (1.0 - smoothstep(0.6, 0.82, lk)));
            float size = clamp(rad * 0.3, 0.012 * F, 0.024 * F) * mix(scale, 1.0, 0.35);
            float lenF = size * (1.5 + 9.0 * thrust);
            if (thrust > 0.01 && dot(dp, dp) < (lenF + rad * scale * 1.3 + size * 4.0) * (lenF + rad * scale * 1.3 + size * 4.0)) {
              vec2 back = normalize(dir * 1.15 + side * (1.0 - 2.0 * away) * 0.7);
              if (!assemble) back = -back;
              vec2 dd = dp - back * rad * scale * 0.4;
              float along = dot(dd, back);
              float across = dd.x * back.y - dd.y * back.x;
              float twin = rad > 0.06 * F ? rad * scale * 0.34 : 0.0;
              float a0 = abs(abs(across) - twin);
              float tt = clamp(along / lenF, 0.0, 1.0);
              float on = smoothstep(-size * 0.6, size * 0.1, along) * (1.0 - smoothstep(0.75, 1.0, tt));
              float wid = size * (0.35 + 0.5 * smoothstep(0.0, 0.2, tt)) * (1.0 - 0.8 * tt);
              float r0 = a0 / max(wid, 0.5);
              float sheath = exp(-r0 * r0 * 1.8) * pow(1.0 - tt, 1.3);
              float c0 = a0 / max(size * 0.2 * (1.0 - 0.7 * tt), 0.5);
              float core = exp(-c0 * c0) * (1.0 - smoothstep(0.1, 0.8, tt));
              core *= 0.78 + 0.22 * cos(along / size * 5.2);
              // Pulses of energy running down the jet.
              float run = fract(along / (size * 4.5) - uTime * 5.0 + float(i) * 0.31) - 0.5;
              sheath *= 0.85 + 0.3 * exp(-run * run * 26.0);
              float power = on * (0.35 + 0.65 * thrust);
              vec3 fc = vec3(0.1, 0.42, 1.0) * sheath + vec3(0.3, 0.75, 1.0) * sheath * sheath + vec3(0.9, 0.97, 1.0) * core;
              float fI = clamp(sheath * 0.8 + core, 0.0, 1.0) * power;
              vec2 noz = vec2(along, abs(across) - twin);
              float flare = exp(-length(noz * vec2(1.0, 0.7)) / (size * 0.65)) * (0.3 + 0.7 * thrust) * smoothstep(0.0, 0.1, thrust);
              jet.rgb = min(jet.rgb + fc * power + vec3(0.45, 0.78, 1.0) * flare * 0.7, vec3(1.0));
              jet.a += max(fI, flare * 0.6) * (1.0 - jet.a);
            }
          }
        }
        // Everything is premultiplied here.
        g = vec4(min(g.rgb + jet.rgb, vec3(1.0)), g.a + jet.a * (1.0 - g.a));
        g.rgb = min(g.rgb, vec3(g.a));
        g = fly + g * (1.0 - fly.a);

        // Faceplate: carried in open on the helmet, then it turns down over the face on its temple pivots.
        float headOn = smoothstep(CLAMP_END + 0.03, CLAMP_END + 0.08, pieceK(HELMET, t));
        if (headOn > 0.0 && plateDown < 0.9995) {
          if (face) {
            // The opening: padded rim in shade around the face, and the shade of the plate coming down.
            float inside = 0.0;
            for (int r = 1; r <= 3; r++) {
              vec2 sp = float(r) * vec2(0.006, 0.0035);
              inside += (isFace(n + vec2(sp.x, 0.0)) ? 0.25 : 0.0) + (isFace(n - vec2(sp.x, 0.0)) ? 0.25 : 0.0)
                + (isFace(n + vec2(0.0, sp.y)) ? 0.25 : 0.0) + (isFace(n - vec2(0.0, sp.y)) ? 0.25 : 0.0);
            }
            inside /= 3.0;
            float shadeTop = 1.0 - smoothstep(0.04, mix(0.065, 0.157, plateDown), n.y);
            g.rgb *= mix(1.0, mix(0.22, 1.0, smoothstep(0.45, 1.0, inside)) * (1.0 - 0.5 * shadeTop), headOn);
          }
          // Two samples for soft edges.
          vec4 plate = 0.5 * (visor(n + 0.3 / uFrame.zw, 1.0 - plateDown) + visor(n - 0.3 / uFrame.zw, 1.0 - plateDown));
          plate *= headOn;
          g = plate + g * (1.0 - plate.a);
        }

        // Faceplate lock: a short flash along its rim; then the eyes flicker on.
        float lockT = (t - 0.945) / 0.055;
        if (head && lockT > 0.0) {
          vec2 eyeA = (n - vec2(0.534, 0.0978)) / vec2(0.022, 0.0065);
          vec2 eyeB = (n - vec2(0.595, 0.0993)) / vec2(0.022, 0.0065);
          float eyes = max(exp(-dot(eyeA, eyeA)), exp(-dot(eyeB, eyeB)));
          float power = smoothstep(0.1, 0.9, lockT);
          float flicker = mix(0.55 + 0.45 * sin(lockT * 34.0), 1.0, smoothstep(0.3, 0.75, lockT));
          g.rgb *= 1.0 - 0.85 * eyes * (1.0 - power * flicker);
          vec2 bloomA = eyeA * vec2(0.45, 0.3);
          vec2 bloomB = eyeB * vec2(0.45, 0.3);
          float bloom = max(exp(-dot(bloomA, bloomA)), exp(-dot(bloomB, bloomB))) * power * flicker * (1.0 - lockT);
          g.rgb = min(g.rgb + vec3(1.0, 0.85, 0.6) * bloom * g.a, vec3(1.0));
          vec2 stepN = 1.5 / uFrame.zw;
          bool rim = isFace(n + vec2(stepN.x, 0.0)) != isFace(n - vec2(stepN.x, 0.0))
            || isFace(n + vec2(0.0, stepN.y)) != isFace(n - vec2(0.0, stepN.y));
          if (rim) g.rgb = min(g.rgb + vec3(1.0, 0.8, 0.5) * pow(1.0 - min(lockT, 1.0), 2.0) * 0.4 * g.a, vec3(1.0));
        }

        // Fastening, right after contact: a bright point runs all the way round the panel's joint and seals it
        // (white-hot, cooling to orange behind), then latches snap shut in strips across the panel, and a sheen
        // passes as it goes live.
        float cool = (hereK - CLAMP_END - 0.02) / 0.6;
        if (here < FACE && cool > 0.0 && cool < 1.0) {
          float id = float(here);
          float seam = 0.0;
          for (int r = 1; r <= 4; r++) {
            vec2 sp = float(r) * 1.0 / uFrame.zw;
            seam += step(0.5, abs(id - pieceOf(n + vec2(sp.x, 0.0))) + abs(id - pieceOf(n - vec2(sp.x, 0.0)))
              + abs(id - pieceOf(n + vec2(0.0, sp.y))) + abs(id - pieceOf(n - vec2(0.0, sp.y)))) * 0.25;
          }
          vec2 local = (n - PIECE_C(here)) * vec2(uFrame.z / F, 1.0) / PIECE_R(here);
          float around = fract(atan(local.y, local.x) / 6.28318 + 0.25);
          float weld = smoothstep(0.0, 0.5, cool) * 1.02;
          float behindIt = weld - around;
          float sealed = step(0.0, behindIt);
          float point = sealed * exp(-behindIt * 22.0) * (1.0 - smoothstep(0.48, 0.56, cool));
          float ember = sealed * exp(-behindIt * 2.6) * (1.0 - smoothstep(0.5, 1.0, cool));
          vec3 hot = mix(vec3(1.0, 0.36, 0.1), vec3(1.0, 0.97, 0.92), clamp(point + ember * 0.3, 0.0, 1.0));
          vec3 add = hot * seam * (ember * 0.75 + point * 1.2);
          // Light of the weld point on the metal around it.
          add += vec3(1.0, 0.8, 0.6) * point * smoothstep(0.35, 1.0, length(local)) * 0.16;
          // Latches: four strips across the panel lock one after the other.
          float strip = clamp(floor((local.y * 0.5 + 0.5) * 4.0), 0.0, 3.0);
          float click = (cool - 0.4 - strip * 0.07) / 0.16;
          float latch = click > 0.0 ? exp(-click * 2.6) * smoothstep(0.0, 0.15, click) : 0.0;
          float strut = exp(-(fract((local.y * 0.5 + 0.5) * 4.0) - 0.5) * (fract((local.y * 0.5 + 0.5) * 4.0) - 0.5) * 18.0);
          add += (vec3(dot(g.rgb, LUMA)) * 0.9 + 0.06) * latch * strut * 0.6;
          // Going live.
          float sheenAt = local.x * 0.6 + local.y - mix(-1.8, 1.8, smoothstep(0.62, 0.98, cool));
          add += (g.rgb * 0.8 + 0.05) * exp(-sheenAt * sheenAt * 9.0) * step(0.62, cool) * 0.8;
          g.rgb = min(g.rgb + add * armour.a * hereOn, vec3(g.a));
        }
        // The reactor ignites.
        float ignite = chestPost > 0.0 && chestPost < 2.0 ? sin(clamp(chestPost * 0.5, 0.0, 1.0) * 3.14159) : 0.0;
        g.rgb = min(g.rgb + vec3(0.95, 0.85, 1.0) * exp(-dot(fromReactor, fromReactor) / 0.004) * ignite * 0.8 * g.a, vec3(g.a));

        mixed = vec4(min(g.rgb, vec3(g.a)), g.a);
      } else {
        // Nanotech (hover / tap): the suit is assembled by (or comes apart into) thousands of microscopic
        // nanites. A swarm of specks streams in ahead of the front; they dock as tiny bevelled metal cells, each
        // at its own moment and in clusters, then take on the colour of the suit and fuse into a sharp surface.
        // Neutral silver and graphite only, and no drawn lines.
        vec4 cur = uFlipped > 0.5 ? armour : person;
        vec4 tgt = uFlipped > 0.5 ? person : armour;
        float nano = shown;
        mixed = vec4(cur.rgb * cur.a, cur.a);
        if (nano > 0.004) {
          // Build front: the mask, broken up by a drifting swell so it never reads as a ring or a wave.
          vec2 at = p * 0.02;
          float swell = noise(at + uTime * 0.5) + 0.5 * noise(at * 2.7 - uTime * 0.7);
          float level = nano + (swell - 0.75) * 0.3;

          // Nanites: a fine hex lattice. Each cell docks at its own moment: clusters (patches of noise) first,
          // single cells scattered around them.
          const float NANITE = 4.0;
          vec4 hc = hexCell(p / NANITE);
          vec2 cid = hc.zw;
          float cellR = hexDist(hc.xy);
          vec2 mid = p - hc.xy * NANITE;
          float rnd = hash(cid * 0.37 + 1.7);
          float cluster = noise(cid * 0.16 + 5.0);
          float q = level - 0.1 - 0.2 * rnd - 0.22 * cluster;
          float dock = smoothstep(0.0, 0.07, q);
          float paint = smoothstep(0.07, 0.17, q);
          float fuse = smoothstep(0.15, 0.27, q);

          // The cell lands with a small overshoot and turns as it settles.
          float size = 0.56 * dock * (1.0 + 0.2 * sin(dock * 3.14159));
          float spin = (1.0 - dock) * (rnd - 0.5) * 3.0;
          vec2 face = rotate(spin) * hc.xy;
          float aa = max(1.0 / (NANITE * uDpr), 0.001);
          float tile = q > 0.0 ? 1.0 - smoothstep(size - aa, size + aa, hexDist(face)) : 0.0;

          // Micro relief: every nanite is tilted its own way, so they glint one by one as the light moves.
          float tiltA = rnd * 6.28318 + uTime * 2.4;
          vec2 tiltV = vec2(cos(tiltA), sin(tiltA)) * 0.45 + face * 1.1;
          float lit = dot(tiltV, vec2(-0.55, -0.83));
          float glint = pow(max(lit, 0.0), 3.0);
          vec3 steel = mix(vec3(0.13, 0.14, 0.16), vec3(0.6, 0.62, 0.65), smoothstep(-0.6, 0.8, lit)) + glint * 0.6;

          // Colour: metal, then one suit colour per nanite, then the sharp suit.
          vec4 chip = uFlipped > 0.5 ? photo(mid, 0.0, 0.0) : revealPhoto(mid);
          vec3 micro = mix(tgt.rgb, chip.rgb, chip.a) * (0.88 + 0.22 * lit) + glint * 0.18;
          vec3 skin = mix(micro, tgt.rgb, fuse);
          vec3 shell = mix(steel, skin, paint);
          shell *= 1.0 - 0.35 * smoothstep(0.34, 0.5, cellR) * (1.0 - fuse);

          float cover = max(tile, fuse);
          vec4 g = mix(cur, vec4(shell, tgt.a), cover);
          // Nanites still working hold on to the figure where the two photos differ.
          g.a = max(g.a, cur.a * tile * (1.0 - paint));

          // Swarm: three depths of specks streaming in towards the front, denser the closer it is.
          float ahead = smoothstep(0.02, 0.2, level) * (1.0 - smoothstep(0.3, 0.5, level));
          if (ahead > 0.01) {
            vec2 eddy = vec2(noise(p * 0.035 + uTime * 0.9), noise(p * 0.035 + 11.0 - uTime * 0.8)) - 0.5;
            for (int i = 0; i < 3; i++) {
              float fi = float(i);
              float grid = 3.4 + fi * 1.5;
              vec2 sp = (p + eddy * (16.0 + 10.0 * fi)) / grid + vec2(fi * 7.3, -uTime * (9.0 - 2.0 * fi));
              vec2 sid = floor(sp);
              float seed = hash(sid + fi * 3.1);
              vec2 jit = (vec2(hash(sid + 4.1), hash(sid + 8.3)) - 0.5) * 0.5;
              float speck = 1.0 - smoothstep(0.14, 0.32, hexDist(fract(sp) - 0.5 - jit));
              speck *= step(1.0 - ahead * (0.34 - 0.07 * fi), seed);
              float bright = 0.45 + 0.55 * sin(uTime * 12.0 + seed * 90.0);
              vec3 speckC = mix(vec3(0.2, 0.21, 0.23), vec3(0.95, 0.96, 0.98), bright);
              g.rgb = mix(g.rgb, speckC, speck * 0.9 * (1.0 - fuse));
            }
          }

          // Settled suit: a brief sparkle of single nanites locking in, nothing more.
          float lock = fuse * (1.0 - smoothstep(0.27, 0.5, q));
          g.rgb += step(0.94, hash(cid + floor(uTime * 16.0))) * lock * 0.35;

          mixed = vec4(min(g.rgb, vec3(1.0)) * g.a, g.a);
        }
      }
    }
    if (uStyle > 1.5 && uStyle < 2.5 && uFlipK > 0.0) {
      // Spider-Verse glitch: quick-changing horizontal bands shift sideways with a red/cyan split; each row
      // band flips to the other photo at its own moment, and a few bands flash comic red or cyan. The alpha
      // comes from the (shifted) photo itself, so the glitch stays inside the figure.
      float gk = uFlipK;
      float amp = sin(gk * 3.14159);
      float tick = floor(uTime * 14.0);
      float bandH = 10.0 + 34.0 * hash(vec2(tick, 3.7));
      float band = floor((p.y + hash(vec2(tick, 9.1)) * 40.0) / bandH);
      float rnd = hash(vec2(band, tick));
      float switchAt = 0.15 + 0.7 * hash(vec2(floor(p.y / 22.0), 7.7));
      float shift = (rnd - 0.5) * 42.0 * amp * step(0.45, hash(vec2(band, tick + 0.5)));
      vec2 pg = p + vec2(shift, 0.0);
      vec2 sp = vec2(7.0 * amp, 0.0);
      vec4 a0 = photo(pg, 0.0, 0.0);
      vec4 b0 = revealPhoto(pg);
      vec4 fromC = vec4(photo(pg + sp, 0.0, 0.0).r, a0.g, photo(pg - sp, 0.0, 0.0).b, a0.a);
      vec4 toC = vec4(revealPhoto(pg + sp).r, b0.g, revealPhoto(pg - sp).b, b0.a);
      if (uFlipped > 0.5) {
        vec4 held = fromC;
        fromC = toC;
        toC = held;
      }
      vec4 g = gk >= switchAt ? toC : fromC;
      float tintPick = hash(vec2(band, tick + 2.3));
      vec3 tint = tintPick < 0.12 ? vec3(1.0, 0.35, 0.45) : (tintPick < 0.24 ? vec3(0.35, 0.9, 1.0) : vec3(1.0));
      g.rgb = mix(g.rgb, min(g.rgb * tint * 1.25, vec3(1.0)), amp);
      // A glowing white web spreads from the hands over the figure while it switches, then fades.
      float front = gk * length(uView) * 1.25;
      float fromC2 = distance(p, uWebC);
      float thread = 1.0 - smoothstep(0.5, 1.6, webDist(p, uWebC));
      float reachW = 1.0 - smoothstep(front - 40.0, front, fromC2);
      float frontGlow = exp(-abs(fromC2 - front) / 18.0);
      float webA = clamp(thread * reachW * (0.25 + 0.75 * amp) + thread * frontGlow, 0.0, 1.0);
      g.rgb = mix(g.rgb, vec3(1.0), webA * 0.9);
      mixed = vec4(g.rgb * g.a, g.a);
    }
    if (uStyle > 0.5 && uStyle < 1.5 && uFlip.z > 0.0) {
      // Thor transformation: the lightning enters through the hammer and courses over the body. A jagged,
      // flickering electric front spreads from the switch origin (the hand) along the figure; behind it the
      // other photo appears, criss-crossed by crawling electric veins that fade, and the whole figure flashes
      // white-blue as the strike lands. Only on the figure (weighted by the photos' opacity).
      float tick = floor(uTime * 24.0);
      float jag = (fbm(p * 0.018 + vec2(tick * 0.37, tick * 0.21)) - 0.5) * 150.0
        + (noise(p * 0.08 + tick) - 0.5) * 28.0;
      float dn = flipDist + jag;
      float front = uFlip.z;
      float covered = 1.0 - smoothstep(front - 5.0, front + 5.0, dn);
      vec4 g = mix(sharp, next, covered);
      float body = max(sharp.a, next.a);
      // Hot rim along the front.
      float rim = exp(-abs(dn - front) / 9.0);
      // Veins: thin branching arcs crawling over the area just reached, fading out behind the front.
      float veinZone = covered * exp(-max(front - dn, 0.0) / 170.0);
      float v1 = abs(fbm(p * 0.035 + vec2(tick * 0.9, -tick * 0.6)) - 0.5);
      float v2 = abs(fbm(p * 0.07 + vec2(-tick * 1.3, tick * 0.8) + 7.0) - 0.5);
      float veins = (1.0 - smoothstep(0.0, 0.022, v1)) + 0.6 * (1.0 - smoothstep(0.0, 0.016, v2));
      // Strike flash: the figure lights up (flickering) as the lightning lands, then settles.
      float strobe = 0.7 + 0.3 * step(0.45, hash(vec2(tick, 1.7)));
      float strike = (exp(-front / 70.0) * 0.95 + exp(-front / 320.0) * 0.22) * strobe;
      float e = clamp(rim * 1.2 + veins * veinZone * 0.95 + strike, 0.0, 1.6);
      vec3 boltC = mix(vec3(0.35, 0.62, 1.0), vec3(0.93, 0.97, 1.0), clamp(e - 0.5, 0.0, 1.0));
      float outA = max(g.a, min(rim, 1.0) * body * 0.9);
      vec3 rgb = g.rgb * g.a + boltC * min(e, 1.0) * body;
      mixed = vec4(min(rgb, vec3(outA)), outA);
    }
    if (uFlip.z > 0.0 && uStyle < 0.5) {
      // Glowing ring made of halftone dots, the echo ring and the centre flash, in the accent colour.
      float glowR = 0.58 * clamp(wave + echo, 0.0, 1.0);
      float glowDots = smoothstep(glowR + w, glowR - w, d);
      vec3 glowBase = uAccent;
      vec3 glowColor = mix(glowBase, vec3(1.0), 0.45 * wave + 0.6 * flash);
      float glow = wave * (0.3 + 0.7 * glowDots) + echo * glowDots * 0.8 + flash * 0.9;
      glow = clamp(glow, 0.0, 1.0);
      // Only on the figure itself: the glow is weighted by the photo's own opacity and never adds opacity,
      // so the removed background stays clear and the effect follows the silhouette (no visible box).
      mixed.rgb += glowColor * glow * mixed.a;
      mixed.rgb = min(mixed.rgb, vec3(mixed.a));
    }
    if (electric > 0.001) {
      // Electric blue glow with white-hot cores, on the figure only (weighted by its opacity).
      float e = clamp(electric, 0.0, 1.6);
      vec3 boltColor = mix(vec3(0.3, 0.62, 1.0), vec3(0.92, 0.97, 1.0), clamp(e - 0.55, 0.0, 1.0));
      mixed.rgb += boltColor * min(e, 1.0) * mixed.a;
      mixed.rgb = min(mixed.rgb, vec3(mixed.a));
    }
    if (uClear > 0.5) {
      outColor = mixed;
    } else {
      outColor = vec4(mixed.rgb + uPaper * (1.0 - mixed.a), 1.0);
    }
  } else if (uClear > 0.5) {
    vec4 printPm = vec4(clearC, clearA);
    vec4 realPm = vec4(sharp.rgb * sharp.a, sharp.a);
    outColor = mix(printPm, realPm, k);
  } else {
    vec3 real = mix(uPaper, sharp.rgb, sharp.a);
    outColor = vec4(mix(print, real, k), 1.0);
  }
}`;

const STYLES: Record<string, number> = {
  halftone: 0,
  lightning: 1,
  glitch: 2,
  armor: 3,
};
const MODES: Record<string, number> = { mono: 0, duotone: 1, color: 2 };
const SHAPES: Record<string, number> = {
  dot: 0,
  ellipse: 1,
  square: 2,
  diamond: 3,
  line: 4,
  cross: 5,
};
const MAX_BURSTS = 4;
const FLIP_SECONDS = 1.5;
const ARMOR_SECONDS = 11; // pieces one by one, then helmet, faceplate and eyes
const ARMOR_OFF_SECONDS = 8; // taking it off
const BURST_SECONDS = 1.3;
// Nanotech tap (`effect="armor"`): a wide, quick wave that builds and retracts the suit.
const NANO_BURST_SECONDS = 1.2;
const INTRO_SECONDS = 1.4;
const MASK_SCALE = 0.5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * The fragment shader for one fixed configuration. These values never change while the effect is mounted, so
 * they are compile-time constants: the driver drops every other effect's code. (As uniforms, all effects were
 * compiled together, which froze the page for 10+ seconds on Windows / Direct3D.)
 */
const viewSource = (values: Record<string, number>) =>
  VIEW.replace(/__(u\w+)__/g, (_, name: string) => values[name].toFixed(1));

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

const link = (gl: WebGL2RenderingContext, fragmentSource: string) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
};

const locate = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: string[],
) => {
  const result: Record<string, WebGLUniformLocation | null> = {};
  for (const name of names) result[name] = gl.getUniformLocation(program, name);
  return result;
};

// Armour panels (`effect="armor"`), in the order they go on: centre (share of the frame), where each leans in from,
// and radius (share of the frame height). Measured on the panel map (piecesSrc).
const PANEL_CENTER = [[0.377, 0.712], [0.369, 0.912], [0.41, 0.621], [0.43, 0.813], [0.431, 0.533], [0.473, 0.666], [0.432, 0.44], [0.548, 0.525], [0.52, 0.407], [0.141, 0.385], [0.876, 0.451], [0.254, 0.327], [0.778, 0.382], [0.361, 0.258], [0.713, 0.29], [0.379, 0.178], [0.722, 0.219], [0.488, 0.315], [0.602, 0.318], [0.55, 0.161], [0.486, 0.246], [0.623, 0.259], [0.56, 0.102]];
const PANEL_FROM = [[-0.735, 0.679], [0.879, 0.476], [-0.888, 0.46], [0.947, 0.321], [-0.998, 0.056], [0.993, 0.117], [-0.981, -0.196], [0.979, -0.203], [0.709, 0.705], [-0.88, 0.475], [0.882, 0.471], [-0.874, -0.487], [0.861, -0.508], [-0.818, -0.575], [0.772, -0.635], [-0.832, -0.555], [0.783, -0.621], [-0.971, 0.238], [0.968, 0.252], [0.001, -1], [-0.99, -0.142], [0.991, -0.132], [-0.645, -0.764]];
const PANEL_RADIUS = [0.038, 0.034, 0.041, 0.064, 0.042, 0.053, 0.055, 0.068, 0.06, 0.036, 0.034, 0.044, 0.046, 0.047, 0.04, 0.029, 0.03, 0.048, 0.042, 0.062, 0.046, 0.048, 0.047];
/** Body panels 0..21, then the helmet (the faceplate moves by itself). */
const HELMET_PANEL = 22;
const MAX_FLYING = 14;
const FLY_END = 0.58;
const CLAMP_START = 0.46;
const CLAMP_END = 0.9;
const pieceInfo = new Float32Array((HELMET_PANEL + 1) * 4);
PANEL_CENTER.forEach(([x, y], i) => {
  pieceInfo.set([x, y, PANEL_RADIUS[i], 0], i * 4);
});
const flyA = new Float32Array(MAX_FLYING * 4);
const flyB = new Float32Array(MAX_FLYING * 4);
const flyC = new Float32Array(MAX_FLYING * 4);
const flyD = new Float32Array(MAX_FLYING * 4);

/** When panel i sets off, on the 0..1 clock of the suit-up (same as pieceK in the shader). */
const panelStart = (i: number) =>
  i >= HELMET_PANEL ? 0.64 : 0.005 + i * (0.613 / (HELMET_PANEL - 1));

/** Fills the fly* arrays for the moment t (0..1) of the suit-up; returns how many panels are in the air. */
const layoutFlying = (t: number, frame: number[]) => {
  const [fx, fy, fw, F] = frame;
  let count = 0;
  for (let i = 0; i <= HELMET_PANEL && count < MAX_FLYING; i++) {
    // Same clock as pieceK in the shader.
    const lk = (t - panelStart(i)) / 0.236;
    if (lk <= 0 || lk >= CLAMP_END + 0.12) continue;
    // All around the body (golden angle), leaning towards the panel's own side.
    const ring = i * 2.39996 + 0.6;
    let dx = Math.cos(ring) + PANEL_FROM[i][0] * 0.45;
    let dy = Math.sin(ring) + PANEL_FROM[i][1] * 0.45;
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
    const bend = (i * 0.618) % 1 > 0.5 ? 1 : -1;
    const at = (clock: number) => {
      const away = (1 - clamp(clock / FLY_END, 0, 1)) ** 3;
      const out = away * 1.15 * F;
      const swerve = away * (1 - away) * 0.7 * F * bend;
      return [away, dx * out - dy * swerve, dy * out + dx * swerve];
    };
    const [away, ox, oy] = at(lk);
    const [, px, py] = at(lk - 0.022);
    const x = clamp((lk - CLAMP_START) / (CLAMP_END - CLAMP_START), 0, 1);
    const shut = x * x * x * (x * (x * 6 - 15) + 10);
    // Docking like a precise machine, in straight moves: level it sideways, then up or down, until it hangs
    // exactly in front of its place; then straight in.
    const ease = (from: number, span: number) => {
      const k = clamp((lk - from) / span, 0, 1);
      return k * k * k * (k * (k * 6 - 15) + 10);
    };
    const standoff = 0.11 * F;
    const sideFirst = i % 2 === 0;
    const sideways = standoff * (1 - ease(sideFirst ? 0.4 : 0.56, 0.2));
    const upright = standoff * (1 - ease(sideFirst ? 0.56 : 0.4, 0.2));
    // Two of three come out of the distance; the others sweep in past the viewer.
    const near = 1 + 0.16 * (1 - ease(0.72, 0.17));
    const farScale = i % 3 === 1 ? 1.75 : 0.2;
    // Two firm pushes into the lock, the second one lighter.
    const push = (from: number, span: number) =>
      Math.sin(clamp((lk - from) / span, 0, 1) * Math.PI);
    const pressed = 0.05 * push(0.87, 0.07) + 0.025 * push(0.95, 0.05);
    const scale =
      near +
      (farScale - near) * (1 - (1 - away) ** 1.6) -
      pressed;
    const radius = PANEL_RADIUS[i] * F;
    const body = radius * scale * 1.95 + 6 + Math.hypot(px - ox, py - oy);
    const size = clamp(radius * 0.3, 0.012 * F, 0.024 * F) * (scale + (1 - scale) * 0.35);
    const jet = lk < 0.82 ? size * 14.5 + radius * scale * 1.3 : 0;
    flyA.set([i, lk, away, shut], count * 4);
    flyB.set(
      [
        fx + PANEL_CENTER[i][0] * fw + ox + dx * sideways,
        fy + PANEL_CENTER[i][1] * F + oy + dy * upright,
        scale,
        Math.max(body, jet, radius * 2.65),
      ],
      count * 4,
    );
    flyC.set([dx, dy, bend, 0], count * 4);
    flyD.set([px - ox, py - oy, 0, 0], count * 4);
    count++;
  }
  return count;
};

const wanderAt = (t: number, w: number, h: number): [number, number] => [
  w * (0.5 + 0.32 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),
  h * (0.5 + 0.27 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57)),
];

/**
 * Local addition: background colour from the top edge only. Used for the reveal photo when its full border
 * is not plain (e.g. a cape reaching the side), as long as the top row is still one flat colour.
 */
const measureTopEdge = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
) => {
  const size = 32;
  context.canvas.width = size;
  context.canvas.height = size;
  context.clearRect(0, 0, size, size);
  context.drawImage(image, 0, 0, size, size);
  const data = context.getImageData(0, 0, size, 2).data;
  const sum = [0, 0, 0];
  const squares = [0, 0, 0];
  const count = data.length / 4;
  let clear = 0;
  for (let i = 0; i < data.length; i += 4) {
    // An already-transparent image has no background colour to key (and its "black" would eat dark clothes).
    if (data[i + 3] < 250) clear++;
    for (let k = 0; k < 3; k++) {
      const v = data[i + k] / 255;
      sum[k] += v;
      squares[k] += v * v;
    }
  }
  const matte = sum.map((s) => s / count);
  const spread =
    matte.reduce(
      (total, mean, k) =>
        total + Math.sqrt(Math.max(0, squares[k] / count - mean * mean)),
      0,
    ) / 3;
  return { matte, plain: clear < count * 0.5 && spread < 0.06 };
};

const measureEdge = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
) => {
  const size = 32;
  context.canvas.width = size;
  context.canvas.height = size;
  context.clearRect(0, 0, size, size);
  context.drawImage(image, 0, 0, size, size);
  const data = context.getImageData(0, 0, size, size).data;
  const sum: number[] = [0, 0, 0];
  const squares: number[] = [0, 0, 0];
  let count = 0;
  let clear = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue;
      const i = (y * size + x) * 4;
      if (data[i + 3] < 250) clear++;
      for (let c = 0; c < 3; c++) {
        const v = data[i + c] / 255;
        sum[c] += v;
        squares[c] += v * v;
      }
      count++;
    }
  }
  const matte = [sum[0] / count, sum[1] / count, sum[2] / count];
  const spread =
    matte.reduce(
      (total, mean, c) =>
        total + Math.sqrt(Math.max(0, squares[c] / count - mean * mean)),
      0,
    ) / 3;
  return { matte, plain: clear < count * 0.5 && spread < 0.06 };
};

const ArmorReveal = ({
  src = DEFAULT_SRC,
  revealSrc,
  piecesSrc,
  fit = "cover",
  mode = "mono",
  shape = "dot",
  cellSize = 6,
  angle = 45,
  dotScale = 1,
  inkColor = "#120f17",
  accentColor = "#ff4f2a",
  paperColor = "#ffffff",
  transparentPaper = false,
  contrast = 1.1,
  brightness = 0,
  invert = false,
  roughness = 0,
  misregistration = 0,
  revealRadius = 160,
  softness = 0.6,
  linger = 1.2,
  reverse = false,
  wander = false,
  clickBurst = true,
  interactive = true,
  bleed = NO_BLEED,
  toggleOnTap = false,
  effect = "halftone",
  webCenter = [0.5, 0.5],
  flipped = false,
  instant = false,
  onDrawn,
  onReady,
  onProgress,
  intro = true,
  className = "",
  style,
}: HalftoneRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const targetRef = useRef<((flipped: boolean) => void) | null>(null);
  const flippedRef = useRef(flipped);
  const callbacksRef = useRef({ onReady, onProgress, onDrawn });
  // True once the effect draws the photo; until then a plain image stands in.
  const [ready, setReady] = useState(false);
  const settings: Settings = {
    fit,
    mode: MODES[mode] ?? 0,
    shape: SHAPES[shape] ?? 0,
    cellSize: clamp(cellSize, 2, 80),
    angle,
    dotScale: clamp(dotScale, 0.2, 2),
    inkColor: String(inkColor),
    accentColor: String(accentColor),
    paperColor: String(paperColor),
    clear: transparentPaper,
    contrast,
    brightness,
    invert,
    roughness: clamp(roughness, 0, 1),
    misregistration: clamp(misregistration, 0, 1),
    revealRadius: Math.max(0, revealRadius),
    softness: clamp(softness, 0, 1),
    linger: Math.max(0, linger),
    reverse,
    wander,
    clickBurst,
    interactive,
    instant,
    bleed,
    toggleOnTap,
    effect,
    webCenter,
    intro,
  };
  const settingsRef = useRef(settings);
  // Keep the latest props for the render loop (set outside render).
  useLayoutEffect(() => {
    settingsRef.current = settings;
    callbacksRef.current = { onReady, onProgress, onDrawn };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", {
      // Local change: alpha canvas (premultiplied) so `transparentPaper` can show the page behind.
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!container || !canvas || !gl) return undefined;

    const start = settingsRef.current;
    const maskProgram = link(gl, MASK);
    const viewProgram = link(
      gl,
      viewSource({
        uStyle: STYLES[start.effect] ?? 0,
        uSwap: revealSrc ? 1 : 0,
        uMode: MODES[start.mode] ?? 0,
        uClear: transparentPaper ? 1 : 0,
        uShape: SHAPES[start.shape] ?? 0,
      }),
    );
    if (!maskProgram || !viewProgram) return undefined;

    const parallel = gl.getExtension("KHR_parallel_shader_compile");
    let cancelled = false;
    let pollTimer = 0;
    let teardown: (() => void) | undefined;

    const setup = () => {
      if (
        !gl.getProgramParameter(maskProgram, gl.LINK_STATUS) ||
        !gl.getProgramParameter(viewProgram, gl.LINK_STATUS)
      ) {
        console.warn("ArmorReveal shader:", gl.getProgramInfoLog(viewProgram));
        return undefined;
      }
      const maskUniforms = locate(gl, maskProgram, [
        "uPrevious",
        "uTexture",
        "uView",
        "uFrom",
        "uTo",
        "uRadius",
        "uSoftness",
        "uStrength",
        "uFade",
      ]);
      const viewUniforms = locate(gl, viewProgram, [
        "uImage",
        "uMask",
        "uReveal",
        "uPieces",
        "uHasPieces",
        "uFlipped",
        "uTime",
        "uFlipK",
        "uPieceInfo",
        "uFlying",
        "uFlyA",
        "uFlyB",
        "uFlyC",
        "uFlyD",
        "uWebC",
        "uFlip",
        "uResolution",
        "uView",
        "uDpr",
        "uFrame",
        "uTexels",
        "uCell",
        "uAngle",
        "uScale",
        "uInk",
        "uAccent",
        "uPaper",
        "uContrast",
        "uBrightness",
        "uInvert",
        "uRough",
        "uShift",
        "uMatte",
        "uMatte2",
        "uKey2",
        "uKey",
        "uReverse",
        "uIntro",
        "uBursts",
        "uBurstWidth",
      ]);

      const vao = gl.createVertexArray();
      const buffer = gl.createBuffer();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);

      const floatMask = !!gl.getExtension("EXT_color_buffer_float");
      const imageTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array(4),
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const piecesTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, piecesTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([255, 255, 255, 255]),
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      let hasPieces = false;
      const revealTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, revealTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array(4),
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const createMask = (width: number, height: number): MaskTarget => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if (floatMask)
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA16F,
            width,
            height,
            0,
            gl.RGBA,
            gl.HALF_FLOAT,
            null,
          );
        else
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
          );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          texture,
          0,
        );
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { texture, framebuffer, width, height };
      };
      const destroyMask = (target: MaskTarget) => {
        gl.deleteFramebuffer(target.framebuffer);
        gl.deleteTexture(target.texture);
      };
      let masks = [createMask(2, 2), createMask(2, 2)];

      const probe = document
        .createElement("canvas")
        .getContext("2d", { willReadFrequently: true });
      const reduce =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;
      const colorCache = new Map<string, number[]>();
      const bursts: { x: number; y: number; start: number }[] = [];
      const burstData = new Float32Array(MAX_BURSTS * 4);
      const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };
      const brush = { x: 0, y: 0, px: 0, py: 0 };
      const state = {
        width: 1,
        height: 1,
        dpr: 1,
        image: null as HTMLImageElement | null,
        matte: [0, 0, 0] as number[],
        key: 0,
        matte2: [0, 0, 0] as number[],
        flipped: flippedRef.current,
        flip: null as { x: number; y: number; start: number } | null,
        flipRadius: 0,
        flipK: 0,
        key2: 0,
        introStart: 0,
        presence: 0,
        // The canvas reaches this far (px) beyond the box on each side.
        bleedX: 0,
        bleedY: 0,
        drift: 0,
        trailUntil: 0,
      };
      let raf = 0;
      let last = 0;
      let visible = true;
      let alive = true;

      const toRgb = (value: string): number[] => {
        const cached = colorCache.get(value);
        if (cached) return cached;
        let rgb = [0, 0, 0];
        if (probe && value) {
          probe.clearRect(0, 0, 1, 1);
          probe.fillStyle = "#000000";
          probe.fillStyle = /^[0-9a-f]{3,8}$/i.test(value)
            ? `#${value}`
            : value;
          probe.fillRect(0, 0, 1, 1);
          const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
          rgb = [r / 255, g / 255, b / 255];
        }
        colorCache.set(value, rgb);
        return rgb;
      };

      const frameRect = (s: Settings) => {
        const { image, bleedX, bleedY } = state;
        const width = state.width - bleedX * 2;
        const height = state.height - bleedY * 2;
        if (!image) return [bleedX, bleedY, width, height];
        const scale = (s.fit === "cover" ? Math.max : Math.min)(
          width / image.naturalWidth,
          height / image.naturalHeight,
        );
        const w = image.naturalWidth * scale;
        const h = image.naturalHeight * scale;
        return [bleedX + (width - w) / 2, bleedY + (height - h) / 2, w, h];
      };

      let resizePending = false;
      const applyResize = () => {
        const [wantX, wantY] = settingsRef.current.bleed;
        const bleedX = Math.round(
          Math.min(
            wantX,
            Math.max(0, (window.innerWidth - container.clientWidth) / 2),
          ),
        );
        const bleedY = bleedX ? Math.min(wantY, Math.round(bleedX * 1.5)) : 0;
        state.bleedX = bleedX;
        state.bleedY = bleedY;
        canvas.style.left = `${-bleedX}px`;
        canvas.style.top = `${-bleedY}px`;
        canvas.style.width = `calc(100% + ${bleedX * 2}px)`;
        canvas.style.height = `calc(100% + ${bleedY * 2}px)`;
        const width = Math.max(1, container.clientWidth + bleedX * 2);
        const height = Math.max(1, container.clientHeight + bleedY * 2);
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        state.width = width;
        state.height = height;
        state.dpr = dpr;
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        const mw = Math.max(2, Math.round(width * MASK_SCALE));
        const mh = Math.max(2, Math.round(height * MASK_SCALE));
        if (mw !== masks[0].width || mh !== masks[0].height) {
          const previous = masks;
          masks = [createMask(mw, mh), createMask(mw, mh)];
          gl.bindFramebuffer(gl.READ_FRAMEBUFFER, previous[0].framebuffer);
          gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, masks[0].framebuffer);
          gl.blitFramebuffer(
            0,
            0,
            previous[0].width,
            previous[0].height,
            0,
            0,
            mw,
            mh,
            gl.COLOR_BUFFER_BIT,
            gl.NEAREST,
          );
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          previous.forEach(destroyMask);
        }
        if (!pointer.placed) {
          pointer.x = width / 2;
          pointer.y = height / 2;
        }
      };

      const resize = () => {
        resizePending = true;
        wake();
      };

      const drawMask = (s: Settings, dt: number) => {
        const minimum = floatMask ? 0 : 1.5 / 255;
        gl.bindFramebuffer(gl.FRAMEBUFFER, masks[1].framebuffer);
        gl.viewport(0, 0, masks[1].width, masks[1].height);
        gl.useProgram(maskProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);
        gl.uniform1i(maskUniforms.uPrevious, 0);
        gl.uniform2f(maskUniforms.uTexture, masks[1].width, masks[1].height);
        gl.uniform2f(maskUniforms.uView, state.width, state.height);
        gl.uniform2f(maskUniforms.uFrom, brush.px, brush.py);
        gl.uniform2f(maskUniforms.uTo, brush.x, brush.y);
        gl.uniform1f(
          maskUniforms.uRadius,
          s.revealRadius * (0.45 + 0.55 * state.presence),
        );
        gl.uniform1f(maskUniforms.uSoftness, s.softness);
        gl.uniform1f(maskUniforms.uStrength, state.presence);
        gl.uniform1f(
          maskUniforms.uFade,
          Math.max(s.linger > 0 ? dt / s.linger : 1, minimum),
        );
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        masks.reverse();
      };

      const drawView = (s: Settings, now: number) => {
        const [fx, fy, fw, fh] = frameRect(s);
        const image = state.image;
        const intro = !image
          ? 0
          : !s.intro || reduce
            ? 1
            : Math.min(1, (now - state.introStart) / 1000 / INTRO_SECONDS);
        gl.viewport(0, 0, canvas.width, canvas.height);
        // Outside the box there is something to draw only during a switch.
        const trim = !state.flip && state.bleedX > 0;
        if (trim) {
          const px = canvas.width / state.width;
          gl.enable(gl.SCISSOR_TEST);
          gl.scissor(
            Math.floor(state.bleedX * px),
            Math.floor(state.bleedY * px),
            Math.ceil((state.width - state.bleedX * 2) * px) + 1,
            Math.ceil((state.height - state.bleedY * 2) * px) + 1,
          );
        }
        gl.useProgram(viewProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.uniform1i(viewUniforms.uImage, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, masks[0].texture);
        gl.uniform1i(viewUniforms.uMask, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, revealTexture);
        gl.uniform1i(viewUniforms.uReveal, 2);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, piecesTexture);
        gl.uniform1i(viewUniforms.uPieces, 3);
        gl.uniform1f(viewUniforms.uHasPieces, hasPieces ? 1 : 0);
        gl.uniform1f(viewUniforms.uFlipped, state.flipped ? 1 : 0);
        gl.uniform1f(viewUniforms.uFlipK, state.flip ? state.flipK : 0);
        if (state.flip && s.effect === "armor") {
          const flying = layoutFlying(
            state.flipped ? 1 - state.flipK : state.flipK,
            [fx, fy, fw, fh],
          );
          gl.uniform4fv(viewUniforms.uPieceInfo, pieceInfo);
          gl.uniform1i(viewUniforms.uFlying, flying);
          gl.uniform4fv(viewUniforms.uFlyA, flyA);
          gl.uniform4fv(viewUniforms.uFlyB, flyB);
          gl.uniform4fv(viewUniforms.uFlyC, flyC);
          gl.uniform4fv(viewUniforms.uFlyD, flyD);
        }
        gl.uniform2f(
          viewUniforms.uWebC,
          fx + s.webCenter[0] * fw,
          fy + s.webCenter[1] * fh,
        );
        gl.uniform1f(viewUniforms.uTime, (now / 1000) % 1000);
        gl.uniform3f(
          viewUniforms.uFlip,
          state.flip?.x ?? 0,
          state.flip?.y ?? 0,
          state.flip ? state.flipRadius : 0,
        );
        gl.uniform2f(viewUniforms.uResolution, canvas.width, canvas.height);
        gl.uniform2f(viewUniforms.uView, state.width, state.height);
        gl.uniform1f(viewUniforms.uDpr, canvas.width / state.width);
        gl.uniform4f(viewUniforms.uFrame, fx, fy, fw, fh);
        gl.uniform1f(viewUniforms.uTexels, image ? image.naturalWidth / fw : 1);
        gl.uniform1f(viewUniforms.uCell, s.cellSize);
        gl.uniform1f(viewUniforms.uAngle, (s.angle * Math.PI) / 180);
        gl.uniform1f(viewUniforms.uScale, s.dotScale);
        gl.uniform3fv(viewUniforms.uInk, toRgb(s.inkColor));
        gl.uniform3fv(viewUniforms.uAccent, toRgb(s.accentColor));
        gl.uniform3fv(viewUniforms.uPaper, toRgb(s.paperColor));
        gl.uniform1f(viewUniforms.uContrast, s.contrast);
        gl.uniform1f(viewUniforms.uBrightness, s.brightness);
        gl.uniform1f(viewUniforms.uInvert, s.invert ? 1 : 0);
        gl.uniform1f(viewUniforms.uRough, s.roughness);
        gl.uniform1f(
          viewUniforms.uShift,
          s.misregistration * s.cellSize * 0.35,
        );
        gl.uniform3fv(viewUniforms.uMatte, state.matte);
        gl.uniform3fv(viewUniforms.uMatte2, state.matte2);
        gl.uniform1f(viewUniforms.uKey2, state.key2);
        gl.uniform1f(viewUniforms.uKey, state.key);
        gl.uniform1f(viewUniforms.uReverse, s.reverse ? 1 : 0);
        gl.uniform1f(viewUniforms.uIntro, 1 - (1 - intro) * (1 - intro));
        gl.uniform4fv(viewUniforms.uBursts, burstData);
        gl.uniform1f(
          viewUniforms.uBurstWidth,
          s.effect === "armor"
            ? Math.max(160, s.revealRadius * 2.4)
            : Math.max(60, s.revealRadius * 0.9),
        );
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);
        if (trim) gl.disable(gl.SCISSOR_TEST);
        return intro;
      };

      const frame = (now: number) => {
        raf = 0;
        if (resizePending) {
          resizePending = false;
          applyResize();
        }
        if (!alive || !visible || document.hidden) return;
        const s = settingsRef.current;
        const dt = last
          ? Math.min(0.05, Math.max(0, (now - last) / 1000))
          : 1 / 60;
        last = now;

        const wandering = s.wander && s.interactive && !reduce;
        let targetX = pointer.x;
        let targetY = pointer.y;
        if (!pointer.inside && wandering) {
          state.drift = Math.min(1, state.drift + dt / 1.2);
          const [wx, wy] = wanderAt(now / 1000, state.width, state.height);
          const k = state.drift * state.drift * (3 - 2 * state.drift);
          targetX += (wx - targetX) * k;
          targetY += (wy - targetY) * k;
        } else {
          state.drift = 0;
        }
        const engaged = (pointer.inside && s.interactive) || wandering;
        if (!s.interactive) bursts.length = 0;
        state.presence +=
          ((engaged ? 1 : 0) - state.presence) *
          (1 - Math.exp(-dt / (s.effect === "armor" ? 0.06 : 0.16)));
        if (pointer.fresh) {
          brush.x = brush.px = targetX;
          brush.y = brush.py = targetY;
          pointer.fresh = false;
        } else {
          const follow = 1 - Math.exp(-dt / 0.035);
          brush.x += (targetX - brush.x) * follow;
          brush.y += (targetY - brush.y) * follow;
        }

        const burstSeconds =
          s.effect === "armor" ? NANO_BURST_SECONDS : BURST_SECONDS;
        burstData.fill(0);
        for (let i = bursts.length - 1; i >= 0; i--) {
          if ((now - bursts[i].start) / 1000 >= burstSeconds)
            bursts.splice(i, 1);
        }
        bursts.forEach((b, i) => {
          const k = Math.max(0, (now - b.start) / 1000 / burstSeconds);
          const reach =
            Math.hypot(
              Math.max(b.x, state.width - b.x) - state.bleedX,
              Math.max(b.y, state.height - b.y) - state.bleedY,
            ) + 80;
          burstData[i * 4] = b.x;
          burstData[i * 4 + 1] = b.y;
          burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);
          burstData[i * 4 + 3] = 1 - k * k * k;
        });

        if (state.flip) {
          const k = Math.min(
            1,
            (now - state.flip.start) /
              1000 /
              (s.effect !== "armor"
                ? FLIP_SECONDS
                : state.flipped
                  ? ARMOR_OFF_SECONDS
                  : ARMOR_SECONDS),
          );
          const reach =
            Math.hypot(
              Math.max(state.flip.x, state.width - state.flip.x),
              Math.max(state.flip.y, state.height - state.flip.y),
            ) +
            // + the dissolve band and the glow ring, so the swap ends with both fully past the frame.
            s.cellSize * 8 +
            190;
          // Ease in-out (cubic): a quick swell, a fast sweep, then a soft landing.
          const eased =
            k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          state.flipRadius = reach * eased;
          state.flipK = k;
          callbacksRef.current.onProgress?.(state.flipped ? 1 - k : k);
          if (k >= 1) {
            state.flipped = !state.flipped;
            state.flip = null;
            state.flipRadius = 0;
          }
        }

        if (state.presence > 0.002)
          state.trailUntil = now + s.linger * 1000 + 200;
        drawMask(s, dt);
        brush.px = brush.x;
        brush.py = brush.y;
        const intro = drawView(s, now);
        if (waiting <= 0)
          callbacksRef.current.onDrawn?.(
            state.flipped,
            engaged ||
              state.presence > 0.002 ||
              bursts.length > 0 ||
              now < state.trailUntil,
          );

        const busy =
          engaged ||
          state.presence > 0.002 ||
          bursts.length > 0 ||
          state.flip !== null ||
          now < state.trailUntil ||
          (state.image && intro < 1);
        if (busy) raf = requestAnimationFrame(frame);
        else last = 0;
      };

      const wake = () => {
        if (!raf && alive && visible && !document.hidden)
          raf = requestAnimationFrame(frame);
      };

      let waiting = 1 + (revealSrc ? 1 : 0) + (piecesSrc ? 1 : 0);
      const loaded = () => {
        if (--waiting > 0) return;
        callbacksRef.current.onProgress?.(state.flipped ? 1 : 0);
        callbacksRef.current.onReady?.();
        // the page may have asked for the other photo meanwhile
        targetRef.current?.(flippedRef.current);
      };

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = () => {
        if (!alive) return;
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR_MIPMAP_LINEAR,
        );
        const sampler = document
          .createElement("canvas")
          .getContext("2d", { willReadFrequently: true });
        if (sampler) {
          try {
            const edge = measureEdge(sampler, image);
            state.matte = edge.matte;
            state.key = edge.plain ? 1 : 0;
          } catch {
            state.key = 0;
          }
        }
        state.image = image;
        setReady(true);
        state.introStart = performance.now();
        loaded();
        wake();
      };
      image.src = src;

      const piecesImage = piecesSrc ? new Image() : null;
      if (piecesImage && piecesSrc) {
        piecesImage.crossOrigin = "anonymous";
        piecesImage.onload = () => {
          if (!alive) return;
          gl.bindTexture(gl.TEXTURE_2D, piecesTexture);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
          // The red values are panel numbers: no colour management on the way in.
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            piecesImage,
          );
          gl.pixelStorei(
            gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
            gl.BROWSER_DEFAULT_WEBGL,
          );
          hasPieces = true;
          loaded();
          wake();
        };
        piecesImage.src = piecesSrc;
      }

      const revealImage = revealSrc ? new Image() : null;
      if (revealImage && revealSrc) {
        revealImage.crossOrigin = "anonymous";
        revealImage.decoding = "async";
        revealImage.onload = () => {
          if (!alive) return;
          gl.bindTexture(gl.TEXTURE_2D, revealTexture);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            revealImage,
          );
          // Its own background colour, so a slightly different blue is still removed.
          const sampler = document
            .createElement("canvas")
            .getContext("2d", { willReadFrequently: true });
          if (sampler) {
            try {
              let edge = measureEdge(sampler, revealImage);
              if (!edge.plain) edge = measureTopEdge(sampler, revealImage);
              state.matte2 = edge.matte;
              state.key2 = edge.plain ? 1 : 0;
            } catch {
              state.key2 = 0;
            }
          }
          loaded();
          wake();
        };
        revealImage.src = revealSrc;
      }

      const locatePointer = (event: PointerEvent) => {
        if (event.target !== container && event.target !== canvas) return;
        pointer.x = event.offsetX + state.bleedX;
        pointer.y = event.offsetY + state.bleedY;
        pointer.placed = true;
      };
      const onMove = (event: PointerEvent) => {
        locatePointer(event);
        if (!pointer.inside) {
          pointer.inside = true;
          pointer.fresh = true;
        }
        wake();
      };
      const onLeave = () => {
        pointer.inside = false;
        wake();
      };
      // Spread the other photo over the frame from (x, y), then keep it (see the frame loop).
      const startFlip = (x: number, y: number) => {
        if (!revealSrc || state.flip) return;
        state.flip = { x, y, start: performance.now() };
        state.flipRadius = 0;
        if (reduce) {
          state.flipped = !state.flipped;
          state.flip = null;
        }
        last = 0;
        wake();
      };
      // Head for the asked photo; a switch already running the other way turns round where it is.
      targetRef.current = (wanted: boolean) => {
        if (waiting > 0) return;
        if (settingsRef.current.instant) {
          state.flip = null;
          state.flipped = wanted;
          wake();
          return;
        }
        if (state.flip) {
          // a running switch ends on the opposite of state.flipped
          if (wanted !== state.flipped) return;
          const k = 1 - state.flipK;
          state.flipped = !state.flipped;
          state.flipK = k;
          const seconds =
            settingsRef.current.effect !== "armor"
              ? FLIP_SECONDS
              : state.flipped
                ? ARMOR_OFF_SECONDS
                : ARMOR_SECONDS;
          state.flip.start = performance.now() - k * seconds * 1000;
          wake();
          return;
        }
        if (wanted === state.flipped) return;
        const s = settingsRef.current;
        const [fx, fy, fw, fh] = frameRect(s);
        startFlip(fx + s.webCenter[0] * fw, fy + s.webCenter[1] * fh);
        if (reduce) callbacksRef.current.onProgress?.(state.flipped ? 1 : 0);
      };

      const onDown = (event: PointerEvent) => {
        onMove(event);
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (!settingsRef.current.interactive) return;
        if (settingsRef.current.toggleOnTap && revealSrc) {
          startFlip(pointer.x, pointer.y);
          return;
        }
        if (
          !settingsRef.current.clickBurst ||
          (event.pointerType === "mouse" && event.button !== 0)
        )
          return;
        bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });
        if (bursts.length > MAX_BURSTS) bursts.shift();
      };
      const onVisibility = () => {
        last = 0;
        wake();
      };

      container.addEventListener("pointermove", onMove, { passive: true });
      container.addEventListener("pointerenter", onMove, { passive: true });
      container.addEventListener("pointerdown", onDown, { passive: true });
      container.addEventListener("pointerleave", onLeave, { passive: true });
      container.addEventListener("pointercancel", onLeave, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      const intersection = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          last = 0;
          wake();
        }
      });
      intersection.observe(container);
      resize();

      wakeRef.current = () => {
        if (!raf && alive && visible) {
          drawView(settingsRef.current, performance.now());
          wake();
        }
      };

      return () => {
        alive = false;
        cancelAnimationFrame(raf);
        wakeRef.current = null;
        targetRef.current = null;
        image.onload = null;
        if (revealImage) revealImage.onload = null;
        if (piecesImage) piecesImage.onload = null;
        resizeObserver.disconnect();
        intersection.disconnect();
        container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerenter", onMove);
        container.removeEventListener("pointerdown", onDown);
        container.removeEventListener("pointerleave", onLeave);
        container.removeEventListener("pointercancel", onLeave);
        document.removeEventListener("visibilitychange", onVisibility);
        masks.forEach(destroyMask);
        gl.deleteTexture(imageTexture);
        gl.deleteTexture(revealTexture);
        gl.deleteTexture(piecesTexture);
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
      };
    };

    // Wait for the driver without blocking the page; until then the plain photo below the canvas shows.
    const poll = () => {
      if (cancelled) return;
      const pending =
        parallel &&
        ![maskProgram, viewProgram].every((program) =>
          gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR),
        );
      if (pending) pollTimer = window.setTimeout(poll, 50);
      else teardown = setup();
    };
    pollTimer = window.setTimeout(poll, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(pollTimer);
      teardown?.();
      gl.deleteProgram(maskProgram);
      gl.deleteProgram(viewProgram);
      setReady(false);
    };
  }, [src, revealSrc, piecesSrc, transparentPaper]);

  useEffect(() => {
    wakeRef.current?.();
  });

  useEffect(() => {
    flippedRef.current = flipped;
    targetRef.current?.(flipped);
  }, [flipped]);

  return (
    <div
      ref={containerRef}
      className={[
        "relative h-full w-full",
        bleed[0] > 0 ? "" : "overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {!ready && (
        // stand-in with exactly the canvas' fit
        <img
          src={revealSrc && flipped ? revealSrc : src}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ objectFit: fit }}
        />
      )}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block h-full w-full max-w-none ${bleed[0] > 0 ? "pointer-events-none" : ""}`}
        aria-hidden="true"
      />
    </div>
  );
};

export default ArmorReveal;
