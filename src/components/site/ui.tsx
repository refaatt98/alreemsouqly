import { useCallback, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

type Ripple = { id: number; x: number; y: number };

export function useSplash() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  const splash = useCallback((e: { clientX: number; clientY: number; currentTarget: Element }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = ++idRef.current;
    setRipples((prev) => [...prev.slice(-3), { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  }, []);

  const layer = (
    <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute h-32 w-32 rounded-full"
          style={{
            left: r.x - 64,
            top: r.y - 64,
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--blush) 85%, transparent) 0%, color-mix(in oklab, var(--blush) 30%, transparent) 55%, transparent 70%)",
            animation: "ripple-out 620ms cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        />
      ))}
    </span>
  );

  return { splash, layer };
}

type CtaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "solid" | "outline" | "light";
};

export function Cta({ children, tone = "solid", className = "", onClick, ...rest }: CtaProps) {
  const [drop, setDrop] = useState(false);
  const { splash, layer } = useSplash();

  const tones: Record<string, string> = {
    solid: "bg-rose text-primary-foreground border-transparent",
    outline: "bg-transparent text-espresso border-gold",
    light: "bg-cream text-rose-deep border-transparent",
  };

  return (
    <button
      {...rest}
      onClick={(e) => {
        splash(e);
        setDrop(true);
        window.setTimeout(() => setDrop(false), 700);
        onClick?.(e);
      }}
      className={`btn-glow font-latin relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border px-9 py-4 text-[0.7rem] font-light tracking-[0.32em] uppercase transition-all duration-500 hover:-translate-y-0.5 ${tones[tone]} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
        <span className="relative inline-block h-3 w-3">
          <span
            className="absolute inset-0 bg-current opacity-70"
            style={{
              borderRadius: "50% 50% 50% 50% / 65% 65% 35% 35%",
              animation: drop ? "droplet-drop 650ms ease-in forwards" : undefined,
              opacity: drop ? undefined : 0.45,
            }}
          />
        </span>
      </span>
      {layer}
    </button>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl text-start"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display mt-5 text-3xl leading-[1.6] tracking-[0.02em] text-espresso md:text-5xl">
        {title}
      </h2>
      <div className={`gold-rule mt-7 ${align === "center" ? "mx-auto max-w-[120px]" : "max-w-[120px]"}`} />
      {sub ? <p className="mt-6 text-sm leading-9 text-muted-foreground md:text-base">{sub}</p> : null}
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${rating} من 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={i < rating ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="1.2">
          <path d="M12 3.5l2.5 5.4 5.9.7-4.4 4 1.2 5.9L12 16.6 6.8 19.5 8 13.6 3.6 9.6l5.9-.7z" />
        </svg>
      ))}
    </span>
  );
}
