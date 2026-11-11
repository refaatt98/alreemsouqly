import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/al-reem-logo.png.asset.json";
import { CATEGORIES, productsQuery, reviewsQuery } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/i18n";
import { Bubbles, CreamPour, Reveal } from "./atmosphere";
import { Cta, SectionHeading, Stars } from "./ui";
import { ProductCard } from "./ProductCard";

/* --------------------------------- Header --------------------------------- */

export function Header() {
  const { count, setOpen } = useCart();
  const { t, toggle } = useLang();
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-gold/30 bg-cream/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-10">
        <a href="#hero" className="flex min-w-0 items-center gap-3">
          <img src={logo.url} alt="الريم" width={120} height={120} className="h-11 w-11 shrink-0 object-contain" />
          <span className="font-display truncate text-lg text-espresso">الريم</span>
        </a>
        <nav className="hidden items-center gap-9 text-sm text-espresso lg:flex">
          <a href="#story" className="transition-colors hover:text-rose">{t("nav.story")}</a>
          <a href="#shop" className="transition-colors hover:text-rose">{t("nav.shop")}</a>
          <a href="#reviews" className="transition-colors hover:text-rose">{t("nav.reviews")}</a>
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-full border border-gold px-4 py-2.5 text-xs text-espresso transition-all duration-500 hover:bg-blush/40"
          >
            {t("lang.switch")}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="rounded-full border border-gold px-5 py-2.5 text-sm text-espresso transition-all duration-500 hover:bg-blush/40"
          >
            {t("nav.cart")} ({count})
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

export function Hero() {
  const { t } = useLang();
  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-24">
      <CreamPour />
      <Bubbles />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <Reveal delay={200}>
          <img src={logo.url} alt="شعار الريم" width={420} height={420} className="mx-auto h-40 w-auto object-contain md:h-52" />
        </Reveal>
        <Reveal delay={400}>
          <p className="eyebrow mt-6">{t("hero.eyebrow")}</p>
        </Reveal>
        <Reveal delay={560}>
          <h1 className="font-display mt-6 text-4xl leading-[1.7] text-espresso md:text-6xl">
            {t("hero.title")}
          </h1>
        </Reveal>
        <Reveal delay={700}>
          <p className="mx-auto mt-7 max-w-lg text-sm leading-9 text-muted-foreground md:text-base">
            {t("hero.sub")}
          </p>
        </Reveal>
        <Reveal delay={860}>
          <div className="mt-11 flex justify-center">
            <a href="#featured">
              <Cta>{t("hero.cta")}</Cta>
            </a>
          </div>
        </Reveal>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2" aria-hidden>
        <div className="relative h-14 w-6 rounded-full border border-gold/70">
          <span
            className="animate-scroll-drop absolute left-1/2 top-3 h-2.5 w-2 -translate-x-1/2 bg-rose"
            style={{ borderRadius: "50% 50% 50% 50% / 65% 65% 35% 35%" }}
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Our story -------------------------------- */

export function Story() {
  const { t } = useLang();
  return (
    <section id="story" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-36">
      <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
        <Reveal>
          <div className="relative">
            <img
              src="/editorial/story.jpg"
              alt={t("story.alt")}
              width={1024}
              height={1280}
              loading="lazy"
              className="w-full rounded-[2.5rem] object-cover shadow-[var(--shadow-soft)]"
            />
            <div className="glass-bubble absolute -bottom-8 h-28 w-28 end-[-1rem]" aria-hidden />
          </div>
        </Reveal>
        <Reveal delay={140}>
          <SectionHeading
            align="start"
            eyebrow={t("story.eyebrow")}
            title={t("story.title")}
            sub={t("story.sub")}
          />
          <p className="font-display mt-9 text-base text-rose-deep">{t("story.sign")}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Featured shelf ------------------------------ */

export function Featured() {
  const { data: products = [] } = useQuery(productsQuery);
  const { t } = useLang();
  const featured = products.filter((p) => p.is_featured);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % featured.length), 5000);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  const hero = featured[index % Math.max(featured.length, 1)];

  return (
    <section id="featured" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <SectionHeading eyebrow={t("featured.eyebrow")} title={t("featured.title")} />
      </Reveal>

      {hero ? (
        <Reveal delay={80}>
          <div key={hero.id} className="mt-16 transition-opacity duration-700">
            <ProductCard product={hero} size="hero" priority />
          </div>
        </Reveal>
      ) : null}

      {featured.length > 1 ? (
        <div className="mt-8 flex justify-center gap-3">
          {featured.map((p, i) => (
            <button
              key={p.id}
              aria-label={p.name_ar}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-rose" : "w-2 bg-gold"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* ----------------------------------- Shop ---------------------------------- */

export function Shop() {
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { t, lang } = useLang();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  const visible = useMemo(() => {
    const list = products.filter((p) => category === "all" || p.category === category);
    if (sort === "low") return [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") return [...list].sort((a, b) => Number(b.price) - Number(a.price));
    return list;
  }, [products, category, sort]);

  return (
    <section id="shop" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <SectionHeading eyebrow={t("shop.eyebrow")} title={t("shop.title")} />
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full border px-6 py-2.5 text-sm transition-all duration-500 ${
                category === c.value
                  ? "border-transparent bg-rose text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "border-gold text-espresso hover:bg-blush/30"
              }`}
            >
              {lang === "en" ? c.label_en : c.label}
            </button>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-gold bg-transparent px-5 py-2.5 text-sm text-espresso outline-none"
          >
            <option value="featured">{t("sort.featured")}</option>
            <option value="low">{t("sort.low")}</option>
            <option value="high">{t("sort.high")}</option>
          </select>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="surface-card h-96 animate-pulse bg-cream-tint" />
            ))
          : visible.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
      </div>
    </section>
  );
}

/* -------------------------------- Value props ------------------------------- */

const VALUE_PATHS = [
  "M12 21c5-3 8-6.6 8-11a8 8 0 0 0-16 0c0 4.4 3 8 8 11Zm0-11v8",
  "M6 9c0-2 1-4 2-4s2 2 2 4M14 9c0-2 1-4 2-4s2 2 2 4M4 15a8 8 0 0 0 16 0c0-3-3-4-8-4s-8 1-8 4Z",
  "M7 3h10l-1 5c2 1 3 3 3 6a6 6 0 0 1-12 0c0-3 1-5 3-6Z",
  "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6Zm-2 8 2 2 4-4",
] as const;

export function ValueProps() {
  const { t } = useLang();
  return (
    <section className="bg-cream-tint py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} />
        </Reveal>
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PATHS.map((path, i) => (
            <Reveal key={path} delay={i * 90}>
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/70 bg-cream">
                  <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="var(--rose)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                </div>
                <h3 className="font-display mt-6 text-lg text-espresso">
                  {t(`value.${i + 1}.title` as "value.1.title")}
                </h3>
                <p className="mt-3 text-sm leading-8 text-muted-foreground">
                  {t(`value.${i + 1}.body` as "value.1.body")}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ------------------------------- Testimonials ------------------------------- */

export function Testimonials() {
  const { data: reviews = [] } = useQuery(reviewsQuery);
  const { t } = useLang();
  const [index, setIndex] = useState(0);
  const current = reviews[index % Math.max(reviews.length, 1)];

  if (!current) return null;

  return (
    <section id="reviews" className="bg-cream-tint py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p className="eyebrow">{t("reviews.eyebrow")}</p>
          <div className="mx-auto mt-8 grid h-20 w-20 place-items-center rounded-full bg-blush/50 ring-1 ring-rose/40">
            <span className="font-display text-2xl text-rose-deep">{current.customer_name.charAt(0)}</span>
          </div>
          <div className="mt-6 flex justify-center">
            <Stars rating={current.rating} />
          </div>
          <blockquote className="font-display mt-8 text-xl leading-[2] text-espresso md:text-3xl">
            «{current.comment}»
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">{current.customer_name}</p>
          <div className="mt-10 flex items-center justify-center gap-3">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}`}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === index ? "w-8 bg-rose" : "w-2 bg-gold"
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- Social grid ------------------------------- */

const SOCIAL = [
  "/editorial/story.jpg",
  "/products/cream.jpg",
  "/ingredients/rose.jpg",
  "/products/serum.jpg",
  "/ingredients/vitamin-e.jpg",
  "/products/mask.jpg",
  "/ingredients/shea.jpg",
  "/products/oil.jpg",
];

export function SocialGrid() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <SectionHeading eyebrow="الريم" title={t("social.title")} />
      </Reveal>
      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {SOCIAL.map((src, i) => (
          <Reveal key={src + i} delay={(i % 4) * 80}>
            <div className="group overflow-hidden rounded-3xl">
              <img
                src={src}
                alt={t("social.alt")}
                width={800}
                height={800}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- Footer --------------------------------- */

export function Footer() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-rose-deep pt-24 pb-12 text-cream">
      <Bubbles className="opacity-40" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <img src={logo.url} alt="الريم" width={200} height={200} loading="lazy" className="mx-auto h-20 w-auto object-contain opacity-90" />
        <h2 className="font-display mt-8 text-2xl leading-[1.8] md:text-4xl">{t("footer.title")}</h2>
        <p className="mt-5 text-sm leading-8 text-cream/80">{t("footer.sub")}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (/^\S+@\S+\.\S+$/.test(email)) setSent(true);
          }}
          className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("footer.email")}
            className="w-full rounded-full border border-cream/40 bg-transparent px-6 py-3.5 text-sm text-cream placeholder:text-cream/60 outline-none transition focus:border-gold"
          />
          <Cta tone="light" type="submit" className="shrink-0">
            {sent ? t("footer.sent") : t("footer.subscribe")}
          </Cta>
        </form>

        <div className="gold-rule mt-14" />

        <div className="mt-8 flex items-center justify-center gap-7" aria-label="social links">
          {["instagram", "tiktok", "whatsapp"].map((s) => (
            <a key={s} href="#" aria-label={s} className="group">
              <svg viewBox="0 0 24 24" className="h-7 w-7 transition-transform duration-500 group-hover:scale-125" fill="none" stroke="var(--gold)" strokeWidth="1.1">
                <path d="M12 12c-2-2.5-6-3.5-6-1.2C6 12.8 9.6 13 12 12Zm0 0c2-2.5 6-3.5 6-1.2 0 2-3.6 2.2-6 1.2Zm0 0c1 1.5.7 4-1 4s-2-2.5-1-4" />
                <circle cx="12" cy="11.6" r="1.1" fill="var(--gold)" stroke="none" />
              </svg>
            </a>
          ))}
        </div>

        <p className="mt-10 text-xs text-cream/60">
          {t("footer.rights")} {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
