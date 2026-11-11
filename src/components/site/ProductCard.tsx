import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { useLang, productName } from "@/lib/i18n";
import { formatPrice, type Product } from "@/lib/shop";
import { useSplash } from "./ui";

export function ProductCard({
  product,
  size = "default",
  priority = false,
}: {
  product: Product;
  size?: "default" | "hero";
  priority?: boolean;
}) {
  const { add, setOpen } = useCart();
  const { t, lang } = useLang();
  const { splash, layer } = useSplash();
  const image = product.image_urls?.[0] ?? "/products/cream.jpg";
  const hero = size === "hero";
  const title = productName(product, lang);

  return (
    <article
      className={`surface-card group relative flex overflow-hidden hover:-translate-y-1.5 hover:shadow-[var(--shadow-lifted)] ${
        hero ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      <Link
        to={`/product/${product.id}`}
        onMouseMove={splash}
        className={`relative overflow-hidden bg-cream-tint ${hero ? "md:w-1/2" : ""}`}
      >
        <img
          src={image}
          alt={title}
          width={1024}
          height={1024}
          loading={priority ? "eager" : "lazy"}
          className={`w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] ${
            hero ? "h-72 md:h-full" : "aspect-square"
          }`}
        />
        {product.compare_at_price ? (
          <span className="absolute top-4 rounded-full bg-cream/90 px-4 py-1.5 text-xs text-rose-deep start-4">
            {t("card.offer")}
          </span>
        ) : null}
        {layer}
      </Link>

      <div className={`flex flex-1 flex-col gap-3 p-6 md:p-8 ${hero ? "justify-center md:w-1/2" : ""}`}>
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-display leading-relaxed text-espresso ${hero ? "text-2xl md:text-4xl" : "text-xl"}`}>
            {title}
          </h3>
        </Link>
        <p className={`text-sm leading-8 text-muted-foreground ${hero ? "" : "line-clamp-2"}`}>
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-lg text-espresso">{formatPrice(Number(product.price))}</span>
            {product.compare_at_price ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(Number(product.compare_at_price))}
              </span>
            ) : null}
          </div>

          <button
            onClick={(e) => {
              splash(e);
              add(product);
              setOpen(true);
            }}
            className="rounded-full border border-gold px-5 py-2.5 text-sm text-espresso transition-all duration-500 hover:bg-rose hover:text-primary-foreground"
          >
            {t("card.add")}
          </button>
        </div>
      </div>
    </article>
  );
}
