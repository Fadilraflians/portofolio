// Not used by the page yet (a later release of the transformation).
// The suit-up stage: ArmorReveal plays the transformation (and the nanotech reveal under the cursor) on the
// GPU; JetOverlay draws the thrusters of the finished limbs.
import { useEffect, useMemo, useRef, useState } from 'react';
import ArmorReveal from './ArmorReveal';
import { JetOverlay, type Jet } from './JetOverlay';

// Both images share this coordinate space (see public/*-hero.webp).
const W = 944;
const H = 1340;
// Room around the figure for incoming panels (CSS px, sideways and up / down).
const BLEED: [number, number] = [260, 220];

// Thrusters, placed in image pixels. `panel` is that limb's number in public/ironman-panels.png.
const jet = (x: number, y: number, dx: number, size: number, width: number): Jet =>
  ({ x: x / W, y: y / H, dx, dy: 1, size, width });
// gloves burn in front of the figure, boot soles face away
const JETS = [
  { panel: 9, behind: false, shape: [jet(134, 540, -0.05, 0.2, 0.024)] },
  { panel: 10, behind: false, shape: [jet(818, 624, 0.05, 0.2, 0.024)] },
  { panel: 0, behind: true, shape: [jet(352, 988, -0.16, 0.25, 0.03)] },
  { panel: 1, behind: true, shape: [jet(340, 1274, -0.16, 0.26, 0.032)] },
];

/** 0..1: how hard a thruster burns once its panel has locked (same panel clock as ArmorReveal). */
const jetPower = (panel: number, done: number) => {
  const clock = (done - 0.005 - panel * (0.613 / 21)) / 0.236;
  return Math.min(1, Math.max(0, (clock - 0.97) / 0.3));
};

interface SuitUpProps {
  src: string;
  armorSrc: string;
  /** true: put the armour on, false: take it off. */
  suited: boolean;
  /** Fires once, when the figure is first well inside the viewport. */
  onFirstView?: () => void;
}

const SuitUpPanels = ({ src, armorSrc, suited, onFirstView }: SuitUpProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  // one small canvas per thruster, each reading its own power every frame
  const powers = useMemo(() => JETS.map(() => ({ current: [0] })), []);
  const [ready, setReady] = useState(false);
  const firstViewRef = useRef(onFirstView);
  firstViewRef.current = onFirstView;

  // give the visitor a moment with the photo before the armour arrives
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !ready) return;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearTimeout(timer);
      if (!entry.isIntersecting) return;
      timer = window.setTimeout(() => {
        observer.disconnect();
        firstViewRef.current?.();
      }, 1200);
    }, { threshold: 0.6 });
    observer.observe(host);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [ready]);

  const burn = (done: number) => {
    JETS.forEach((j, i) => { powers[i].current = [jetPower(j.panel, done)]; });
  };

  return (
    <div ref={hostRef} className="relative isolate w-full h-full">
      {JETS.map((j, i) => (
        <JetOverlay key={j.panel} jets={j.shape} power={powers[i]} behind={j.behind} />
      ))}
      <ArmorReveal
        src={src}
        revealSrc={armorSrc}
        piecesSrc="/ironman-panels.png"
        effect="armor"
        fit="contain"
        transparentPaper
        flipped={suited}
        bleed={BLEED}
        revealRadius={80}
        intro={false}
        onReady={() => setReady(true)}
        onProgress={burn}
        style={{ touchAction: 'pan-y' }}
      />
    </div>
  );
};

export default SuitUpPanels;
