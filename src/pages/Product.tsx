import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CartProvider, useCart } from "@/lib/cart";
import { LangProvider, useLang, productName } from "@/lib/i18n";
import { Seo } from "@/components/Seo";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Header, Footer } from "@/components/site/sections";
import { AmbientDrips, MeltingDivider, Reveal } from "@/components/site/atmosphere";
import { Cta } from "@/components/site/ui";
import { ProductCard } from "@/components/site/ProductCard";
import { formatPrice, productsQuery, type Product } from "@/lib/shop";

export default function ProductRoute() {
  return (
    <LangProvider>
      <CartProvider>
        <Seo
          title="منتج | الريم"
          description="تفاصيل المنتج والسعر — الريم للعناية الطبيعية الفاخرة."
          ogTitle="منتج | الريم"
          ogDescription="تفاصيل المنتج والسعر — الريم للعناية الطبيعية الفاخرة."
          ogType="product"
        />
        <AmbientDrips />
        <Header />
        <ProductPage />
        <MeltingDivider from="var(--cream)" to="var(--rose-deep)" />
        <Footer />
        <CartDrawer />
      </CartProvider>
    </LangProvider>
  );
}

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const product = products.find((p) => p.id === id);

  if (isLoading) {
    return <main className="min-h-[70vh] pt-40 text-center text-muted-foreground">{t("product.loading")}</main>;
  }

  if (!product) {
    return (
      <main className="min-h-[70vh] px-6 pt-40 text-center">
        <h1 className="font-display text-2xl text-espresso">{t("product.missing")}</h1>
        <Link to="/" className="mt-8 inline-block">
          <Cta>{t("product.back")}</Cta>
        </Link>
      </main>
    );
  }

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <main className="pt-28">
      <Detail product={product} />
      {related.length ? (
        <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
          <h2 className="font-display text-2xl text-espresso">{t("product.related")}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Detail({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const { t, lang } = useLang();
  const [active, setActive] = useState(0);
  const images = product.image_urls?.length ? product.image_urls : ["/products/cream.jpg"];
  const soldOut = product.stock_quantity <= 0;
  const title = productName(product, lang);

  return (
    <section className="mx-auto grid max-w-7xl gap-14 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24">
      <Reveal>
        <div>
          <img
            src={images[active]}
            alt={title}
            width={1024}
            height={1024}
            className="w-full rounded-[2.5rem] object-cover shadow-[var(--shadow-soft)]"
          />
          {images.length > 1 ? (
            <div className="mt-5 flex gap-4">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-2xl border transition-all duration-500 ${
                    i === active ? "border-rose" : "border-gold/60"
                  }`}
                >
                  <img src={src} alt="" width={120} height={120} loading="lazy" className="h-20 w-20 object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="flex h-full flex-col justify-center">
          <h1 className="font-display mt-5 text-3xl leading-[1.7] text-espresso md:text-5xl">
            {title}
          </h1>
          <div className="mt-6 flex items-baseline gap-4">
            <span className="font-display text-2xl text-rose-deep">{formatPrice(Number(product.price))}</span>
            {product.compare_at_price ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(Number(product.compare_at_price))}
              </span>
            ) : null}
          </div>
          <p className="mt-7 text-sm leading-9 text-muted-foreground md:text-base">{product.description}</p>

          <p className="mt-7 text-sm text-muted-foreground">
            {soldOut
              ? t("product.soldout")
              : `${t("product.available")} · ${product.stock_quantity} ${t("product.pieces")}`}
          </p>

          <div className="mt-9">
            <Cta
              onClick={() => {
                if (soldOut) return;
                add(product);
                setOpen(true);
              }}
            >
              {soldOut ? t("product.outOfStock") : t("product.addToCart")}
            </Cta>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
