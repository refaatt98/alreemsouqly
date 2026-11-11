# Al Reem Luxe

Build a premium, ultra-high-end e-commerce website for "الريم" (Al Reem) — a luxury natural skincare brand. This should feel like a $10M beauty brand's website, not a template. Reference-level quality: think Glossier, Rhode Skin, or Augustinus Bader's site — minimal, editorial, sensory, and confident.

BRAND IDENTITY

Logo: user-supplied pink deer artwork with Arabic lettering "الريم"

Brand feeling: soft luxury, feminine, artisanal, dreamy but premium (not childish/cutesy)

COLOR SYSTEM (use CSS variables, not hardcoded hex)

Primary: Blush Pink #F5C6D6

Secondary/Deep accent: Rose Mauve #D98BA6

Background: Warm Cream #FFFBF7

Text: Deep Espresso Brown #3A2A2A (not pure black — softer, warmer contrast)

Accent metallic: Champagne Gold #E8D4B8 for dividers, borders, icons

Use a very restrained palette — max 4-5 colors total, no rainbow gradients

TYPOGRAPHY

Arabic headings: elegant curved display font (Aref Ruqaa, Lalezar, or similar available Arabic display font) — large, generous letter spacing

Arabic body: clean readable font (Cairo or Tajawal)

English accents (SKINCARE, product names in Latin): thin tracked-out uppercase sans-serif

Generous line-height and whitespace — luxury brands breathe, they don't cram

SIGNATURE ANIMATIONS (the centerpiece — invest the most detail here)

Hero cream-pour intro: on page load, a ribbon of pink cream/serum flows down from the top of the viewport like a liquid reveal, settling into a pooled shape behind the hero headline (use SVG path morphing or a layered CSS mask animation — should feel viscous and slow, ease-in-out over ~1.5-2s)

Ambient drip particles: subtle, slow-falling droplet shapes drift in the background throughout the page (low opacity, blurred, parallax on scroll) — never distracting, purely atmospheric

Product card hover: hovering a product image triggers a soft "cream splash" ripple emanating from the cursor point (radial gradient expanding + fading, blush pink, ~400ms)

Section transitions on scroll: each section fades/blurs in with a slight scale-up (0.96 → 1) as it enters viewport — use Intersection Observer, stagger children by 80-100ms

Melting divider between sections: instead of hard section breaks, use an SVG wave/blob shape that looks like cream settling, in the transition color between two sections

Floating bubbles layer: 5-8 translucent circular bubbles floating slowly upward in hero and footer, varying sizes and speeds, subtle gold/pink glass effect (backdrop-blur + low opacity gradient border)

CTA buttons: soft pulse glow on hover + a tiny animated droplet icon that "falls" into the button on click before the ripple/success state

Custom cursor (desktop only): replace default cursor with a small pink droplet or sparkle that trails slightly — optional but high-impact for that "editorial luxury" feel

PAGE STRUCTURE

Hero Section

Full viewport height, cream-pour animation as background element

Logo mark + tagline (something evocative like "نقاء الطبيعة، لمسة الفخامة")

Single elegant CTA: "اكتشفي المجموعة"

Subtle scroll-down indicator (animated, not static arrow)

Brand Story

Split layout: editorial photography/illustration on one side, warm founder-voice copy on the other

Small gold-line divider, generous padding

Featured Products (Bestsellers)

Horizontal scroll-snap carousel OR asymmetric grid (not a boring 3-column grid) — mix large hero product card with smaller supporting cards

Each card: product image, name, short benefit line, price, quick-add button with the splash hover effect

Full Shop / Product Grid

Filter/sort bar (by category: كريمات، سيرومات، ماسكات، إلخ) with pill-style filters

Clean grid with generous gutters, cards with soft rounded corners (16-24px radius) and subtle drop shadow that intensifies on hover (elevation change)

Why Al Reem (Value Props)

4 icon-led value props (100% Natural, Cruelty-Free, Handcrafted in small batches, Dermatologist-tested) — custom line-icons in brand pink, not generic stock icons

Ingredients Spotlight

A visually rich section highlighting 2-3 hero natural ingredients (e.g., rosewater, shea butter, vitamin E) with soft illustrated or photographic circular frames

Testimonials

Editorial-style quote carousel, star ratings in gold, customer photos in soft circular frames with pink ring border

Instagram/Social Proof Grid

Grid of lifestyle imagery with hover zoom

Newsletter/Footer

Deep rose background, gold accent divider, elegant sign-up form, social icons redesigned as tiny bow/sparkle shapes matching brand logo

TECHNICAL REQUIREMENTS

Fully responsive, mobile-first (assume 70%+ traffic from mobile)

Full RTL support throughout — this is critical, test all flex/grid directions

Connect to my linked Supabase project:

products table: id, name_ar, name_en, description, price, compare_at_price, category, image_urls (array), stock_quantity, is_featured, ingredients, created_at

orders table: id, customer_id, items (jsonb), total, status, shipping_address, created_at

customers table: id, name, phone, email, address, created_at

reviews table: id, product_id, customer_name, rating, comment, image_url, created_at

Product data should load dynamically from Supabase, not hardcoded

Cart functionality with persistent state (Supabase or local state synced on checkout)

Smooth 60fps animations — prefer CSS transforms/opacity over layout-triggering properties for performance

Lazy-load images below the fold

TONE REMINDER
Every micro-interaction should feel intentional and expensive. No default shadcn card styling left untouched — everything should feel custom-skinned to this cream/bow/pink identity. If in doubt, make it softer, slower, and more minimal rather than busier.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f33e2d59-b007-4e5c-93db-ab73f3b5efb5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Netlify deployment

This is a Vite + React single-page app. Import the repository into Netlify;
`netlify.toml` sets `npm run build` and publishes `dist`. Node 22 is selected.
Direct links and refreshes on `/product/:id`, `/admin`, and `/admin/orders`
are handled by the SPA fallback. Lovable CDN image paths are proxied before
the fallback, so logo requests return images rather than HTML.

The browser currently uses the existing hosted data service and its public
key from `src/integrations/supabase/client.ts`. No private keys belong in the
frontend or Netlify build environment. Netlify hosts the frontend only; it
does not deploy the functions under `supabase/functions/`.

Orders and products require the existing hosted tables and permissions.
Image uploads additionally require the hosted `r2-upload` function and its
storage configuration. Push alerts require the hosted
`send-order-notification` function, VAPID keys and order trigger configuration.
These services must remain available independently of Netlify.

**Security warning:** The inherited admin page has no sign-in gate and uses
the public client directly. Review hosted access policies and protect admin
operations before treating this store as production-ready.

After deployment, test product data, a product deep-link refresh, logo
requests, a real order, image upload and push alerts on the actual Netlify
domain. A successful frontend deployment alone does not verify those services.
