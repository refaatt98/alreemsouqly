import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const dict = {
  ar: {
    "nav.story": "قصتنا",
    "nav.shop": "المتجر",
    "nav.reviews": "الآراء",
    "nav.cart": "السلة",
    "lang.switch": "English",

    "hero.eyebrow": "عناية طبيعية بالبشرة",
    "hero.title": "نقاء الطبيعة، لمسة الفخامة",
    "hero.sub":
      "خلطات مصنوعة يدوياً بدفعات صغيرة، من مكوّنات نقية تمنح بشرتك طقساً يومياً من العناية الهادئة.",
    "hero.cta": "اكتشفي المجموعة",

    "story.eyebrow": "قصتنا",
    "story.title": "بدأت الحكاية في مطبخ صغير",
    "story.sub":
      "من وصفة عائلية بماء الورد وزبدة الشيا، وُلدت الريم. نحضّر كل دفعة بأيدينا، بكميات محدودة، لنضمن أن كل عبوة تصل إليك بنفس النقاء الذي بدأنا به. لا مواد قاسية، لا وعود مبالغة — فقط مكوّنات تعرفها بشرتك.",
    "story.sign": "— فريق الريم",
    "story.alt": "تحضير الخلطات يدوياً",

    "featured.eyebrow": "عرض مميّز",
    "featured.title": "الأكثر حباً لدى عميلاتنا",

    "shop.eyebrow": "المجموعة",
    "shop.title": "المجموعة الكاملة",
    "sort.featured": "الترتيب: المميّز",
    "sort.low": "السعر: الأقل أولاً",
    "sort.high": "السعر: الأعلى أولاً",

    "why.eyebrow": "لماذا نحن",
    "why.title": "لماذا الريم",
    "value.1.title": "طبيعية ١٠٠٪",
    "value.1.body": "مكوّنات نباتية نقية بلا بارابين أو عطور صناعية.",
    "value.2.title": "خالية من القسوة",
    "value.2.body": "لا نختبر على الحيوانات، أبداً.",
    "value.3.title": "دفعات صغيرة",
    "value.3.body": "نحضّرها يدوياً لضمان الطزاجة والجودة.",
    "value.4.title": "مختبرة جلدياً",
    "value.4.body": "آمنة على البشرة الحساسة، بشهادة أطباء الجلدية.",

    "reviews.eyebrow": "آراء عميلاتنا",
    "social.title": "من مجتمعنا",
    "social.alt": "لحظات من مجتمع الريم",

    "footer.title": "انضمي إلى دائرتنا الخاصة",
    "footer.sub": "وصفات العناية، إطلاقات محدودة، وعروض للمشتركات فقط.",
    "footer.email": "بريدك الإلكتروني",
    "footer.subscribe": "اشتراك",
    "footer.sent": "تم",
    "footer.rights": "© جميع الحقوق محفوظة — الريم",

    "card.add": "أضيفي",
    "card.offer": "عرض",

    "cart.title": "سلتك",
    "cart.close": "إغلاق",
    "cart.empty": "سلتك فارغة حالياً",
    "cart.total": "الإجمالي",
    "cart.checkout": "إتمام الشراء",
    "cart.confirm": "تأكيد الطلب",
    "cart.sending": "جاري الإرسال",
    "cart.done.title": "تم استلام طلبك بنجاح",
    "cart.done.sub": "سنتواصل معك قريباً لتأكيد التفاصيل. شكراً لثقتك بالريم.",
    "cart.continue": "متابعة التسوق",
    "cart.name": "الاسم الكامل",
    "cart.phone": "رقم الجوال",
    "cart.address": "عنوان التوصيل",
    "cart.remove": "حذف",
    "cart.error.form": "يرجى إدخال الاسم ورقم الجوال بشكل صحيح",
    "cart.error.submit": "تعذّر إتمام الطلب، حاولي مرة أخرى",
    "cart.phoneAlt": "رقم احتياطي (اختياري)",
    "cart.zone": "منطقة التوصيل",
    "cart.zone.choose": "اختاري المنطقة",
    "cart.zone.none": "لا توجد مناطق توصيل متاحة حالياً",
    "cart.subtotal": "مجموع المنتجات",
    "cart.delivery": "التوصيل",
    "cart.details": "بيانات التوصيل",
    "cart.shippingTitle": "عنوان الشحن",
    "cart.recipient": "اسم المستلم",
    "cart.city": "المدينة",
    "cart.cityPlaceholder": "أدخل اسم المدينة",
    "cart.detailedAddress": "العنوان التفصيلي",
    "cart.addressPlaceholder": "الشارع، المبنى، الشقة، الطابق، إلخ.",
    "cart.saveAddress": "حفظ العنوان",
    "cart.editAddress": "تعديل العنوان",
    "cart.cancel": "إلغاء",
    "cart.error.zone": "يرجى اختيار منطقة التوصيل",
    "cart.error.address": "يرجى إدخال العنوان بالتفصيل",
    "cart.whatsapp.note": "سيتم فتح واتساب لإرسال تفاصيل طلبك.",

    "product.loading": "جارٍ التحميل…",
    "product.missing": "لم نعثر على هذا المنتج",
    "product.back": "العودة للمتجر",
    "product.related": "قد يعجبكِ أيضاً",
    "product.soldout": "غير متوفر حالياً",
    "product.available": "متوفر",
    "product.pieces": "قطعة",
    "product.addToCart": "أضيفي إلى السلة",
    "product.outOfStock": "نفد المخزون",
  },
  en: {
    "nav.story": "Story",
    "nav.shop": "Shop",
    "nav.reviews": "Reviews",
    "nav.cart": "Cart",
    "lang.switch": "العربية",

    "hero.eyebrow": "natural skincare",
    "hero.title": "Nature's purity, a touch of luxury",
    "hero.sub":
      "Handmade in small batches with pure ingredients that turn your skincare into a calm daily ritual.",
    "hero.cta": "Discover the collection",

    "story.eyebrow": "our story",
    "story.title": "It all began in a small kitchen",
    "story.sub":
      "Al Reem was born from a family recipe of rose water and shea butter. Every batch is made by hand, in limited quantities, so each jar reaches you with the same purity we started with. No harsh actives, no exaggerated promises — only ingredients your skin knows.",
    "story.sign": "— The Al Reem team",
    "story.alt": "Preparing the blends by hand",

    "featured.eyebrow": "hot sale",
    "featured.title": "Most loved by our customers",

    "shop.eyebrow": "the collection",
    "shop.title": "The full collection",
    "sort.featured": "Sort: Featured",
    "sort.low": "Price: Low to high",
    "sort.high": "Price: High to low",

    "why.eyebrow": "why al reem",
    "why.title": "Why Al Reem",
    "value.1.title": "100% natural",
    "value.1.body": "Pure plant ingredients, no parabens or synthetic fragrance.",
    "value.2.title": "Cruelty free",
    "value.2.body": "Never tested on animals.",
    "value.3.title": "Small batches",
    "value.3.body": "Handmade to guarantee freshness and quality.",
    "value.4.title": "Dermatologist tested",
    "value.4.body": "Safe for sensitive skin, dermatologist approved.",

    "reviews.eyebrow": "loved by you",
    "social.title": "From our community",
    "social.alt": "Moments from the Al Reem community",

    "footer.title": "Join our inner circle",
    "footer.sub": "Skincare rituals, limited launches, and subscriber-only offers.",
    "footer.email": "Your email address",
    "footer.subscribe": "Subscribe",
    "footer.sent": "Done",
    "footer.rights": "© Al Reem Skincare",

    "card.add": "Add",
    "card.offer": "offer",

    "cart.title": "Your cart",
    "cart.close": "Close",
    "cart.empty": "Your cart is empty",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "cart.confirm": "Confirm order",
    "cart.sending": "Sending",
    "cart.done.title": "Your order has been received",
    "cart.done.sub": "We'll contact you shortly to confirm the details. Thank you for trusting us.",
    "cart.continue": "Continue shopping",
    "cart.name": "Full name",
    "cart.phone": "Phone number",
    "cart.address": "Delivery address",
    "cart.remove": "Remove",
    "cart.error.form": "Please enter a valid name and phone number",
    "cart.error.submit": "We couldn't place the order, please try again",
    "cart.phoneAlt": "Backup phone (optional)",
    "cart.zone": "Delivery area",
    "cart.zone.choose": "Choose your area",
    "cart.zone.none": "No delivery areas available right now",
    "cart.subtotal": "Products subtotal",
    "cart.delivery": "Delivery",
    "cart.details": "Delivery details",
    "cart.shippingTitle": "Shipping address",
    "cart.recipient": "Recipient name",
    "cart.city": "City",
    "cart.cityPlaceholder": "Enter city name",
    "cart.detailedAddress": "Detailed address",
    "cart.addressPlaceholder": "Street, building, apartment, floor, etc.",
    "cart.saveAddress": "Save address",
    "cart.editAddress": "Edit address",
    "cart.cancel": "Cancel",
    "cart.error.zone": "Please choose your delivery area",
    "cart.error.address": "Please enter your full address",
    "cart.whatsapp.note": "WhatsApp will open to send your order details.",

    "product.loading": "Loading…",
    "product.missing": "We couldn't find this product",
    "product.back": "Back to shop",
    "product.related": "You may also like",
    "product.soldout": "Currently unavailable",
    "product.available": "In stock",
    "product.pieces": "pcs",
    "product.addToCart": "Add to cart",
    "product.outOfStock": "Sold out",
  },
} as const;

export type Key = keyof (typeof dict)["ar"];

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: Key) => string;
} | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem("kt-lang");
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("kt-lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback((key: Key) => dict[lang][key] ?? dict.ar[key], [lang]);

  const value = useMemo(
    () => ({ lang, setLang, toggle: () => setLangState((l) => (l === "ar" ? "en" : "ar")), t }),
    [lang, setLang, t],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

export function productName(
  product: { name_ar: string; name_en: string },
  lang: Lang,
) {
  if (lang === "en") return product.name_en?.trim() || product.name_ar;
  return product.name_ar;
}
