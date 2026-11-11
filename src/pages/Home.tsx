import { CartProvider } from "@/lib/cart";
import { LangProvider } from "@/lib/i18n";
import { Seo } from "@/components/Seo";
import { AmbientDrips, MeltingDivider } from "@/components/site/atmosphere";
import { CartDrawer } from "@/components/site/CartDrawer";
import {
  Featured,
  Footer,
  Header,
  Hero,
  Shop,
  SocialGrid,
  Story,
  Testimonials,
  ValueProps,
} from "@/components/site/sections";

export default function Home() {
  return (
    <LangProvider>
      <CartProvider>
        <Seo
          title="الريم | عناية طبيعية فاخرة بالبشرة"
          description="الريم — عناية طبيعية فاخرة بالبشرة: كريمات وسيرومات وماسكات مصنوعة يدوياً بدفعات صغيرة من ماء الورد وزبدة الشيا."
          ogTitle="الريم | عناية طبيعية فاخرة بالبشرة"
          ogDescription="خلطات مصنوعة يدوياً بمكوّنات نقية تمنح بشرتك طقساً يومياً من العناية الهادئة."
        />
        <AmbientDrips />
        <Header />
        <main>
          <Hero />
          <Story />
          <MeltingDivider from="var(--cream)" to="var(--cream-tint)" />
          <div className="bg-cream-tint">
            <Featured />
          </div>
          <MeltingDivider from="var(--cream-tint)" to="var(--cream)" />
          <Shop />
          <MeltingDivider from="var(--cream)" to="var(--cream-tint)" />
          <ValueProps />
          <Testimonials />
          <MeltingDivider from="var(--cream-tint)" to="var(--cream)" />
          <SocialGrid />
        </main>
        <MeltingDivider from="var(--cream)" to="var(--rose-deep)" />
        <Footer />
        <CartDrawer />
      </CartProvider>
    </LangProvider>
  );
}
