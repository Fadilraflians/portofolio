// HalftoneReveal — adapted from React Bits (reactbits.dev), JS + CSS variant, typed for TypeScript.
// Trimmed to the "photo" use case of this portfolio:
//  - `src` is shown as the real (transparent) image; halftone dots grow it in on first view.
//  - Around the cursor, halftone dots dissolve it into a *different* image, `revealSrc`.
//  - The canvas is transparent and images are uploaded premultiplied, so cut-outs float on the page.
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import './HalftoneReveal.css';

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// Reveal mask: a soft brush stroked from the previous to the current pointer position,
// on top of the previous frame's mask faded by `uFade` (the lingering trail).
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
uniform sampler2D uReveal;
uniform sampler2D uMask;
uniform vec2 uResolution;
uniform vec2 uView;
uniform float uDpr;
uniform vec4 uFrame;
uniform vec4 uRevealFrame;
uniform float uCell;
uniform float uAngle;
uniform float uIntro;
uniform vec4 uBursts[4];
uniform float uBurstWidth;
out vec4 outColor;

// radius at which round dots on a square screen fully merge (plus a little overlap)
const float FULL = 0.72 * 1.08;

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

// straight (non-premultiplied) colour + alpha of an image placed in 'frame'
vec4 layer(sampler2D image, vec4 frame, vec2 p) {
  vec2 uv = (p - frame.xy) / frame.zw;
  vec4 c = texture(image, clamp(uv, 0.0, 1.0));
  vec3 rgb = c.a > 0.0001 ? c.rgb / c.a : vec3(0.0);
  vec2 inside = step(0.0, uv) * step(uv, vec2(1.0));
  return vec4(rgb, inside.x * inside.y * c.a);
}

// anti-aliased dot of radius r for a pixel at distance d from its cell centre
float dot2(float d, float r, float w) {
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);
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

void main() {
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;

  // halftone screen
  vec2 q = rotate(uAngle) * p / uCell;
  float d = length(fract(q) - 0.5);
  float w = max(fwidth(d), 0.0001) * 2.0;

  // intro: dots grow outward from the centre until they merge into the photo
  vec2 field = p / max(uView.x, uView.y) - uView / max(uView.x, uView.y) * 0.5;
  float delay = length(field) * 1.15 + hash(floor(p / uCell)) * 0.06;
  float grow = smoothstep(0.0, 1.0, clamp((uIntro * 1.7 - delay) / 0.45, 0.0, 1.0));
  vec4 base = layer(uImage, uFrame, p);
  float baseAlpha = base.a * dot2(d, FULL * grow, w);
  vec4 under = vec4(base.rgb * baseAlpha, baseAlpha);

  // reveal: dots fade in at the edge, the core melts into a seamless crossfade
  vec2 maskUv = vec2(p.x / uView.x, 1.0 - p.y / uView.y);
  float shown = max(texture(uMask, maskUv).r, burst(p));
  shown = shown * shown * (3.0 - 2.0 * shown);
  float k = dot2(d, FULL * shown, w) * smoothstep(0.0, 0.45, shown);
  k = max(k, smoothstep(0.42, 0.85, shown));
  vec4 sharp = layer(uReveal, uRevealFrame, p);
  vec4 top = vec4(sharp.rgb * sharp.a, sharp.a);

  outColor = mix(under, top, k);
}`;

const MAX_BURSTS = 4;
const BURST_SECONDS = 1.3;
const INTRO_SECONDS = 1.4;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = (gl: WebGL2RenderingContext, fragmentSource: string) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
};

const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {
  const result: Record<string, WebGLUniformLocation | null> = {};
  for (const name of names) result[name] = gl.getUniformLocation(program, name);
  return result;
};

export interface HalftoneRevealProps {
  /** Image shown first (transparent PNG/WebP works best). Must be same-origin or CORS-enabled. */
  src: string;
  /** Image revealed around the cursor. Defaults to `src`. */
  revealSrc?: string;
  /** Show the whole image, or crop it to fill the container. */
  fit?: 'contain' | 'cover';
  /** Spacing of the halftone screen, in px. */
  cellSize?: number;
  /** Rotation of the screen, in degrees. */
  angle?: number;
  /** Radius of the revealed area around the cursor, in px. */
  revealRadius?: number;
  /** Width of the band where the dots grow, 0–1. */
  softness?: number;
  /** Seconds the revealed trail takes to fade. 0 turns the trail off. */
  linger?: number;
  /** Clicking sends a ring of the reveal image rippling outward. */
  clickBurst?: boolean;
  /** Grow the dots in from the centre the first time the element is on screen. */
  intro?: boolean;
  /** Upper bound for the canvas pixel ratio (lower = cheaper). */
  maxDpr?: number;
  /** Seconds the reveal takes to catch up with the pointer (higher = smoother glide). */
  smoothing?: number;
  className?: string;
  style?: CSSProperties;
}

const HalftoneReveal = ({
  src,
  revealSrc,
  fit = 'contain',
  cellSize = 5,
  angle = 45,
  revealRadius = 120,
  softness = 0.9,
  linger = 1.8,
  clickBurst = true,
  intro = true,
  maxDpr = 2,
  smoothing = 0.06,
  className = '',
  style
}: HalftoneRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const settings = {
    fit,
    cellSize: clamp(cellSize, 2, 80),
    angle,
    revealRadius: Math.max(0, revealRadius),
    softness: clamp(softness, 0, 1),
    linger: Math.max(0, linger),
    clickBurst,
    intro,
    maxDpr: clamp(maxDpr, 0.5, 3),
    smoothing: Math.max(0.005, smoothing)
  };
  type Settings = typeof settings;
  const settingsRef = useRef<Settings>(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false
    });
    if (!container || !canvas || !gl) return undefined;

    const maskProgram = link(gl, MASK);
    const viewProgram = link(gl, VIEW);
    if (!maskProgram || !viewProgram) return undefined;
    const maskUniforms = locate(gl, maskProgram, [
      'uPrevious',
      'uTexture',
      'uView',
      'uFrom',
      'uTo',
      'uRadius',
      'uSoftness',
      'uStrength',
      'uFade'
    ]);
    const viewUniforms = locate(gl, viewProgram, [
      'uImage',
      'uReveal',
      'uMask',
      'uResolution',
      'uView',
      'uDpr',
      'uFrame',
      'uRevealFrame',
      'uCell',
      'uAngle',
      'uIntro',
      'uBursts',
      'uBurstWidth'
    ]);

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const floatMask = !!gl.getExtension('EXT_color_buffer_float');

    const createImageTexture = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return texture;
    };
    const imageTexture = createImageTexture();
    const revealTexture = createImageTexture();

    type Mask = { texture: WebGLTexture; framebuffer: WebGLFramebuffer; width: number; height: number };
    const createMask = (width: number, height: number): Mask => {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (floatMask) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const framebuffer = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { texture, framebuffer, width, height };
    };
    const destroyMask = (target: Mask) => {
      gl.deleteFramebuffer(target.framebuffer);
      gl.deleteTexture(target.texture);
    };
    let masks = [createMask(2, 2), createMask(2, 2)];

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const bursts: { x: number; y: number; start: number }[] = [];
    const burstData = new Float32Array(MAX_BURSTS * 4);
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };
    const brush = { x: 0, y: 0, px: 0, py: 0 };
    const state = {
      width: 1,
      height: 1,
      image: null as HTMLImageElement | null,
      revealImage: null as HTMLImageElement | null,
      introStart: -1,
      presence: 0,
      trailUntil: 0
    };
    let raf = 0;
    let last = 0;
    let visible = true;
    let alive = true;

    const frameRect = (s: Settings, image: HTMLImageElement | null): [number, number, number, number] => {
      const { width, height } = state;
      if (!image) return [0, 0, width, height];
      const scale = (s.fit === 'cover' ? Math.max : Math.min)(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      return [(width - w) / 2, (height - h) / 2, w, h];
    };

    let resizePending = false;
    const applyResize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, settingsRef.current.maxDpr);
      state.width = width;
      state.height = height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      // mask at full CSS resolution so the reveal edge stays smooth
      const mw = Math.max(2, Math.round(width));
      const mh = Math.max(2, Math.round(height));
      if (mw !== masks[0].width || mh !== masks[0].height) {
        const previous = masks;
        masks = [createMask(mw, mh), createMask(mw, mh)];
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, previous[0].framebuffer);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, masks[0].framebuffer);
        gl.blitFramebuffer(0, 0, previous[0].width, previous[0].height, 0, 0, mw, mh, gl.COLOR_BUFFER_BIT, gl.NEAREST);
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
      gl.uniform1f(maskUniforms.uRadius, s.revealRadius * (0.45 + 0.55 * state.presence));
      gl.uniform1f(maskUniforms.uSoftness, s.softness);
      gl.uniform1f(maskUniforms.uStrength, state.presence);
      gl.uniform1f(maskUniforms.uFade, Math.max(s.linger > 0 ? dt / s.linger : 1, minimum));
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      masks.reverse();
    };

    const drawView = (s: Settings, now: number) => {
      const [fx, fy, fw, fh] = frameRect(s, state.image);
      const [rx, ry, rw, rh] = frameRect(s, state.revealImage);
      const intro = !state.image
        ? 0
        : !s.intro || reduce
          ? 1
          : state.introStart < 0
            ? 0
            : Math.min(1, (now - state.introStart) / 1000 / INTRO_SECONDS);
      gl.viewport(0, 0, canvas.width, canvas.height);
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
      gl.uniform2f(viewUniforms.uResolution, canvas.width, canvas.height);
      gl.uniform2f(viewUniforms.uView, state.width, state.height);
      gl.uniform1f(viewUniforms.uDpr, canvas.width / state.width);
      gl.uniform4f(viewUniforms.uFrame, fx, fy, fw, fh);
      gl.uniform4f(viewUniforms.uRevealFrame, rx, ry, rw, rh);
      gl.uniform1f(viewUniforms.uCell, s.cellSize);
      gl.uniform1f(viewUniforms.uAngle, (s.angle * Math.PI) / 180);
      gl.uniform1f(viewUniforms.uIntro, 1 - (1 - intro) * (1 - intro));
      gl.uniform4fv(viewUniforms.uBursts, burstData);
      gl.uniform1f(viewUniforms.uBurstWidth, Math.max(60, s.revealRadius * 0.9));
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
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
      const dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60;
      last = now;

      state.presence += ((pointer.inside ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.16));
      if (pointer.fresh) {
        brush.x = brush.px = pointer.x;
        brush.y = brush.py = pointer.y;
        pointer.fresh = false;
      } else {
        const follow = 1 - Math.exp(-dt / s.smoothing);
        brush.x += (pointer.x - brush.x) * follow;
        brush.y += (pointer.y - brush.y) * follow;
      }

      burstData.fill(0);
      for (let i = bursts.length - 1; i >= 0; i--) {
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);
      }
      bursts.forEach((b, i) => {
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);
        const reach = Math.hypot(Math.max(b.x, state.width - b.x), Math.max(b.y, state.height - b.y)) + 80;
        burstData[i * 4] = b.x;
        burstData[i * 4 + 1] = b.y;
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2);
        burstData[i * 4 + 3] = 1 - k * k * k;
      });

      // start the intro the first time the element is actually on screen
      if (state.image && state.introStart < 0) state.introStart = now;
      if (state.presence > 0.002) state.trailUntil = now + s.linger * 1000 + 200;
      drawMask(s, dt);
      brush.px = brush.x;
      brush.py = brush.y;
      const intro = drawView(s, now);

      const busy =
        pointer.inside || state.presence > 0.002 || bursts.length > 0 || now < state.trailUntil || (state.image && intro < 1);
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const upload = (texture: WebGLTexture | null, source: HTMLImageElement) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    };

    // decode off the main thread first so the texture upload doesn't cause a hitch
    const loadImage = (url: string, done: (img: HTMLImageElement) => void) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => {
        img.decode().catch(() => undefined).then(() => {
          if (alive) done(img);
        });
      };
      img.src = url;
      return img;
    };
    const image = loadImage(src, img => {
      upload(imageTexture, img);
      state.image = img;
      wake();
    });
    const revealImage = loadImage(revealSrc || src, img => {
      upload(revealTexture, img);
      state.revealImage = img;
      wake();
    });

    const locatePointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
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
    const onDown = (event: PointerEvent) => {
      onMove(event);
      if (!settingsRef.current.clickBurst || (event.pointerType === 'mouse' && event.button !== 0)) return;
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });
      if (bursts.length > MAX_BURSTS) bursts.shift();
    };
    const onVisibility = () => {
      last = 0;
      wake();
    };

    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerenter', onMove, { passive: true });
    container.addEventListener('pointerdown', onDown, { passive: true });
    container.addEventListener('pointerleave', onLeave, { passive: true });
    container.addEventListener('pointercancel', onLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
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
      image.onload = null;
      revealImage.onload = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerenter', onMove);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointerleave', onLeave);
      container.removeEventListener('pointercancel', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      masks.forEach(destroyMask);
      gl.deleteTexture(imageTexture);
      gl.deleteTexture(revealTexture);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(maskProgram);
      gl.deleteProgram(viewProgram);
    };
  }, [src, revealSrc]);

  // re-draw when props change while idle
  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div ref={containerRef} className={`halftone-reveal${className ? ` ${className}` : ''}`} style={style}>
      <canvas ref={canvasRef} className="halftone-reveal-canvas" aria-hidden="true" />
    </div>
  );
};

export default HalftoneReveal;
