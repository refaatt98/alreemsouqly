import { useEffect, useRef, useState, type ReactNode } from "react";

/* ---------------------------------- Reveal --------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = Tag as any;
  return (
    <Component
      ref={ref as never}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className={`reveal ${shown ? "revealed" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}

/* --------------------------------- Bubbles --------------------------------- */

const BUBBLES = [
  { size: 120, left: "8%", dur: 26, delay: 0, drift: 40 },
  { size: 64, left: "22%", dur: 34, delay: 4, drift: -30 },
  { size: 180, left: "40%", dur: 44, delay: 8, drift: 24 },
  { size: 48, left: "58%", dur: 30, delay: 2, drift: -18 },
  { size: 96, left: "72%", dur: 38, delay: 11, drift: 34 },
  { size: 140, left: "86%", dur: 48, delay: 6, drift: -44 },
  { size: 56, left: "50%", dur: 28, delay: 14, drift: 18 },
];

export function Bubbles({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="glass-bubble animate-float-up absolute bottom-0 block"
          style={{
            width: b.size,
            height: b.size,
            insetInlineStart: b.left,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            ["--drift" as string]: `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------ Ambient drips ------------------------------ */

const DRIPS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 96}%`,
  size: 10 + ((i * 13) % 26),
  dur: 26 + ((i * 9) % 30),
  delay: (i * 3.7) % 24,
  drift: ((i % 5) - 2) * 22,
}));

export function AmbientDrips() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setOffset(window.scrollY * 0.06));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
      style={{ transform: `translate3d(0, ${offset}px, 0)` }}
    >
      {DRIPS.map((d, i) => (
        <span
          key={i}
          className="animate-drip absolute top-0 block bg-blush/50 blur-[6px]"
          style={{
            insetInlineStart: d.left,
            width: d.size,
            height: d.size * 1.5,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            animationDuration: `${d.dur}s`,
            animationDelay: `-${d.delay}s`,
            ["--drift" as string]: `${d.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------ Custom cursor ------------------------------ */

export function DropletCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.style.cursor = "none";
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const loop = () => {
      tx += (x - tx) * 0.14;
      ty += (y - ty) * 0.14;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (trail.current) trail.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block" aria-hidden>
      <div ref={trail} className="absolute -ml-5 -mt-5 h-10 w-10 rounded-full border border-gold/70 bg-blush/20 backdrop-blur-[2px]" />
      <div
        ref={dot}
        className="absolute -ml-[7px] -mt-[9px] h-4 w-[14px] bg-rose"
        style={{ borderRadius: "50% 50% 50% 50% / 65% 65% 35% 35%" }}
      />
    </div>
  );
}

/* ----------------------------- Melting divider ----------------------------- */

export function MeltingDivider({
  from = "var(--cream)",
  to = "var(--cream-tint)",
  flip = false,
}: {
  from?: string;
  to?: string;
  flip?: boolean;
}) {
  return (
    <div className="relative -mt-px w-full" style={{ background: from }} aria-hidden>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[70px] w-full md:h-[110px]"
        style={{ transform: flip ? "scaleY(-1)" : undefined }}
      >
        <path
          fill={to}
          d="M0,44 C120,96 210,18 320,40 C430,62 470,116 600,104 C730,92 780,30 900,34 C1020,38 1080,92 1200,92 C1320,92 1380,52 1440,30 L1440,120 L0,120 Z"
        />
        <ellipse cx="300" cy="104" rx="34" ry="18" fill={to} />
        <ellipse cx="1010" cy="110" rx="26" ry="14" fill={to} />
      </svg>
    </div>
  );
}

/* -------------------------------- Cream pour ------------------------------- */

export function CreamPour() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMin slice"
        className="animate-pour absolute inset-0 h-full w-full origin-top opacity-55"
      >
        <defs>
          <linearGradient id="creamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blush)" stopOpacity="0.95" />
            <stop offset="60%" stopColor="var(--blush)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--cream-tint)" stopOpacity="0.4" />
          </linearGradient>
          <filter id="creamBlur">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <g filter="url(#creamBlur)">
          <path
            fill="url(#creamGrad)"
            d="M330,0 C360,120 300,190 320,280 C340,370 250,420 260,510 C270,600 380,620 400,700 C420,620 540,600 545,505 C550,410 460,370 480,280 C500,190 440,120 470,0 Z"
          />
          <ellipse cx="400" cy="700" rx="300" ry="120" fill="url(#creamGrad)" />
          <ellipse cx="400" cy="740" rx="380" ry="140" fill="var(--blush)" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}
