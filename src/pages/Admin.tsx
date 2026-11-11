import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, BellOff, Check, ChevronDown, Clock3, ClipboardList, MapPin, Menu, Package, PackageCheck, Printer, Sparkles, Star, Trash2, X } from "lucide-react";
import { currentPushStatus, disablePush, enablePush, sendTestPush, type PushStatus } from "@/lib/push";
import { Seo } from "@/components/Seo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import logo from "@/assets/al-reem-logo.png.asset.json";
import {
  adminData,
  deleteOrder,
  deleteProduct,
  deleteReview,
  saveProduct,
  setOrderStatus,
  uploadProductImage,
  deleteZone,
  saveZone,
  type ProductDraft,
  type AdminOrder,
} from "@/lib/admin";
import { CATEGORIES, formatPrice } from "@/lib/shop";

/** Give the installed admin app its dashboard title while this page is open. */
function useAdminInstallManifest() {
  useEffect(() => {
    const title = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
    const prevTitle = title?.getAttribute("content") ?? null;

    title?.setAttribute("content", "تحكم الريم");

    return () => {
      if (title && prevTitle) title.setAttribute("content", prevTitle);
    };
  }, []);
}


export default function AdminRoute() {
  useAdminInstallManifest();

  return (
    <>
      <Seo
        title="لوحة التحكم | الريم"
        description="لوحة تحكم خاصة لإدارة منتجات وطلبات الريم."
        ogTitle="لوحة التحكم | الريم"
        ogDescription="إدارة المنتجات والطلبات والآراء."
        twitterCard="summary"
        robots="noindex"
      />
      <AdminPage />
    </>
  );
}

type Draft = ProductDraft;

const emptyDraft: Draft = {
  name_ar: "",
  name_en: "",
  description: "",
  price: 0,
  compare_at_price: null,
  category: "creams",
  image_urls: [],
  stock_quantity: 0,
  is_featured: false,
};

const STATUSES = [
  { value: "pending", label: "جديد" },
  { value: "confirmed", label: "تم التأكيد" },
  { value: "preparing", label: "قيد التجهيز" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

const statusDetails = {
  pending: {
    label: "جديد",
    badge: "border-rose/25 bg-blush/35 text-rose-deep",
    icon: Sparkles,
  },
  confirmed: {
    label: "تم التأكيد",
    badge: "border-status-confirmed/20 bg-status-confirmed-soft text-status-confirmed",
    icon: Check,
  },
  preparing: {
    label: "قيد التجهيز",
    badge: "border-status-preparing/20 bg-status-preparing-soft text-status-preparing",
    icon: Clock3,
  },
  delivered: {
    label: "تم التسليم",
    badge: "border-status-delivered/20 bg-status-delivered-soft text-status-delivered",
    icon: PackageCheck,
  },
  cancelled: {
    label: "ملغي",
    badge: "border-status-cancelled/20 bg-status-cancelled-soft text-status-cancelled",
    icon: X,
  },
} as const;

function normalizedStatus(status: string): keyof typeof statusDetails {
  if (status === "confirmed" || status === "preparing" || status === "delivered" || status === "cancelled") return status;
  return "pending";
}

const field =
  "w-full rounded-2xl border border-gold bg-cream px-4 py-3 text-sm text-espresso outline-none focus:border-rose";
const btn =
  "font-latin rounded-full border border-gold px-5 py-2.5 text-[0.62rem] tracking-[0.22em] uppercase text-espresso transition-all duration-500 hover:bg-blush/40";
const btnSolid =
  "font-latin rounded-full bg-rose px-6 py-3 text-[0.62rem] tracking-[0.22em] uppercase text-primary-foreground transition-all duration-500 hover:bg-rose-deep";

function AdminPage() {
  return <Dashboard />;
}

function NotificationsToggle() {
  const [status, setStatus] = useState<PushStatus>("disabled");
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    currentPushStatus().then(setStatus).catch(() => setStatus("unsupported"));
  }, []);

  const label =
    status === "enabled"
      ? "التنبيهات مفعّلة"
      : status === "blocked"
        ? "التنبيهات محجوبة"
        : status === "unsupported"
          ? "غير مدعوم على هذا الجهاز"
          : "تفعيل تنبيهات الطلبات";

  async function toggle() {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      setStatus(status === "enabled" ? await disablePush() : await enablePush());
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تفعيل التنبيهات");
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setTesting(true);
    setError(null);
    setNote(null);
    try {
      const { sent, total } = await sendTestPush();
      setNote(`تم إرسال إشعار تجريبي إلى ${sent} من ${total} جهاز`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر إرسال الإشعار التجريبي");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`${btn} inline-flex items-center gap-2 ${status === "enabled" ? "bg-blush/50" : ""}`}
          onClick={toggle}
          disabled={busy || status === "unsupported" || status === "blocked"}
        >
          {status === "enabled" ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          <span className="font-sans tracking-normal normal-case">{busy ? "..." : label}</span>
        </button>
        <button className={btn} onClick={test} disabled={testing}>
          <span className="font-sans tracking-normal normal-case">
            {testing ? "..." : "تجربة الإشعار"}
          </span>
        </button>
      </div>
      {note && <span className="text-[0.7rem] text-espresso/70">{note}</span>}
      {status === "blocked" && (
        <span className="text-[0.7rem] text-espresso/60">
          فعّل الإشعارات لهذا الموقع من إعدادات المتصفح ثم أعد المحاولة
        </span>
      )}
      {error && <span className="text-[0.7rem] text-status-cancelled">{error}</span>}
    </div>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const location = useLocation();
  const [tab, setTab] = useState<"products" | "orders" | "zones" | "reviews">(
    location.pathname.startsWith("/admin/orders") ? "orders" : "products",
  );
  const [zoneDraft, setZoneDraft] = useState<{ id?: string; name: string; fee: number; is_active: boolean }>({
    name: "",
    fee: 0,
    is_active: true,
  });
  const [navOpen, setNavOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(
    new URLSearchParams(location.search).get("order"),
  );
  const [orderFilter, setOrderFilter] = useState<"all" | keyof typeof statusDetails>("all");
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin-data"], queryFn: () => adminData() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-data"] });

  const sections = [
    { value: "products", label: "المنتجات", icon: Package },
    { value: "orders", label: "الطلبات", icon: ClipboardList },
    { value: "zones", label: "مناطق التوصيل", icon: MapPin },
    { value: "reviews", label: "الآراء", icon: Star },
  ] as const;
  const activeLabel = sections.find((s) => s.value === tab)?.label ?? "";

  return (
    <main className="min-h-screen bg-cream px-5 pb-16 pt-4 md:px-10 md:py-10">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 -mx-5 mb-6 border-b border-gold/30 bg-cream/85 px-5 py-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setNavOpen(true)}
            aria-label="فتح القائمة"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/40 bg-white/70 text-espresso shadow-sm transition active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 text-end">
            <p className="truncate font-display text-lg leading-tight text-espresso">لوحة تحكم الريم</p>
            <p className="truncate text-[0.7rem] text-espresso/60">{activeLabel}</p>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 md:hidden ${navOpen ? "" : "pointer-events-none"}`} aria-hidden={!navOpen}>
        <div
          onClick={() => setNavOpen(false)}
          className={`absolute inset-0 bg-espresso/40 backdrop-blur-sm transition-opacity duration-300 ${
            navOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 end-0 flex w-[82%] max-w-xs flex-col gap-6 bg-cream p-5 shadow-2xl transition-transform duration-300 ease-out ${
            navOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setNavOpen(false)}
              aria-label="إغلاق القائمة"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gold/40 text-espresso"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="font-display text-xl text-espresso">الريم</span>
          </div>

          <nav className="flex flex-col gap-2" aria-label="أقسام لوحة التحكم">
            {sections.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTab(value);
                  setNavOpen(false);
                }}
                aria-current={tab === value ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-start text-sm transition-all duration-300 ${
                  tab === value
                    ? "bg-rose text-primary-foreground shadow-md"
                    : "text-espresso hover:bg-blush/30"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t border-gold/30 pt-5">
            <NotificationsToggle />
            <div className="flex gap-2">
              <a href="/" className={`${btn} flex-1 text-center`}>
                الموقع
              </a>
              <button className={`${btn} flex-1`} onClick={() => refresh()}>
                تحديث
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="admin-content mx-auto max-w-6xl">
        <header className="hidden flex-wrap items-center justify-between gap-4 md:flex">
          <h1 className="font-display text-2xl text-espresso md:text-3xl">لوحة تحكم الريم</h1>
          <div className="flex flex-wrap items-start gap-3">
            <NotificationsToggle />
            <a href="/" className={btn}>
              الموقع
            </a>
            <button className={btn} onClick={() => refresh()}>
              تحديث
            </button>
          </div>
        </header>

        <div className="mt-0 flex flex-col gap-8 md:mt-8 md:flex-row md:items-start">
          <aside className="surface-card hidden shrink-0 p-3 md:sticky md:top-8 md:block md:w-60">
            <nav className="flex flex-col gap-2" aria-label="أقسام لوحة التحكم">
              {sections.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  aria-current={tab === value ? "page" : undefined}
                  className={`flex w-full items-center gap-3 whitespace-nowrap rounded-2xl px-5 py-3 text-start text-sm transition-all duration-500 ${
                    tab === value
                      ? "bg-rose text-primary-foreground"
                      : "text-espresso hover:bg-blush/30"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>


          <div className="min-w-0 flex-1">
        {isLoading ? <p className="mt-16 text-center text-muted-foreground">جارٍ التحميل…</p> : null}


        {tab === "products" ? (
          <section className="mt-10">
            <button className={btnSolid} onClick={() => setDraft({ ...emptyDraft })}>
              + منتج جديد
            </button>

            {draft ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await saveProduct(draft);
                  setDraft(null);
                  await refresh();
                }}
                className="surface-card mt-8 grid gap-5 p-8 md:grid-cols-2"
              >
                <label className="grid gap-2 text-sm text-espresso">
                  الاسم بالعربية
                  <input
                    required
                    className={field}
                    value={draft.name_ar}
                    onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })}
                  />
                </label>
                <label className="grid gap-2 text-sm text-espresso">
                  الاسم بالإنجليزية
                  <input
                    className={field}
                    dir="ltr"
                    value={draft.name_en}
                    onChange={(e) => setDraft({ ...draft, name_en: e.target.value })}
                  />
                </label>
                <label className="grid gap-2 text-sm text-espresso md:col-span-2">
                  الوصف
                  <textarea
                    rows={3}
                    className={field}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </label>
                <label className="grid gap-2 text-sm text-espresso">
                  السعر
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className={field}
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                  />
                </label>
                <label className="grid gap-2 text-sm text-espresso">
                  السعر قبل الخصم (اختياري)
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className={field}
                    value={draft.compare_at_price ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        compare_at_price: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="grid gap-2 text-sm text-espresso">
                  التصنيف
                  <select
                    className={field}
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-espresso">
                  الكمية المتوفرة
                  <input
                    type="number"
                    min="0"
                    className={field}
                    value={draft.stock_quantity}
                    onChange={(e) => setDraft({ ...draft, stock_quantity: Number(e.target.value) })}
                  />
                </label>
                <div className="grid gap-3 text-sm text-espresso md:col-span-2">
                  صور المنتج
                  <div className="flex flex-wrap items-center gap-4">
                    {draft.image_urls.map((url) => (
                      <div key={url} className="relative">
                        <img src={url} alt="" className="h-24 w-24 rounded-2xl object-cover" loading="lazy" />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              image_urls: draft.image_urls.filter((u) => u !== url),
                            })
                          }
                          className="absolute -top-2 -end-2 grid h-7 w-7 place-items-center rounded-full bg-rose text-primary-foreground"
                          aria-label="حذف الصورة"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className={`${btn} cursor-pointer`}>
                      {uploading ? "جارٍ الرفع…" : "رفع صورة من جهازك"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files ?? []);
                          e.target.value = "";
                          if (!files.length) return;
                          setUploading(true);
                          try {
                            const urls: string[] = [];
                            for (const file of files) {
                              if (file.size > 10 * 1024 * 1024) {
                                alert("حجم الصورة يجب أن يكون أقل من 10 ميغابايت");
                                continue;
                              }
                              const res = await uploadProductImage(file);
                              urls.push(res.url);
                            }
                            setDraft((d) => (d ? { ...d, image_urls: [...d.image_urls, ...urls].slice(0, 6) } : d));
                          } catch {
                            alert("تعذّر رفع الصورة، حاولي مرة أخرى");
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <label className="flex items-center gap-3 text-sm text-espresso">
                  <input
                    type="checkbox"
                    checked={draft.is_featured}
                    onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
                  />
                  منتج مميّز (يظهر في العرض المتحرك)
                </label>
                <div className="flex gap-3 md:col-span-2">
                  <button type="submit" className={btnSolid}>
                    حفظ
                  </button>
                  <button type="button" className={btn} onClick={() => setDraft(null)}>
                    إلغاء
                  </button>
                </div>
              </form>
            ) : null}

            <div className="mt-8 grid gap-4">
              {data?.products.map((p) => (
                <article key={p.id} className="surface-card flex flex-wrap items-center gap-5 p-5">
                  <img
                    src={p.image_urls?.[0] ?? "/products/cream.jpg"}
                    alt={p.name_ar}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                  <div className="min-w-40 flex-1">
                    <h3 className="font-display text-lg text-espresso">{p.name_ar}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(Number(p.price))} · مخزون {p.stock_quantity}
                      {p.is_featured ? " · مميّز" : ""}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className={btn}
                      onClick={() =>
                        setDraft({
                          id: p.id,
                          name_ar: p.name_ar,
                          name_en: p.name_en,
                          description: p.description,
                          price: Number(p.price),
                          compare_at_price: p.compare_at_price === null ? null : Number(p.compare_at_price),
                          category: p.category,
                          image_urls: p.image_urls ?? [],
                          stock_quantity: p.stock_quantity,
                          is_featured: p.is_featured,
                        })
                      }
                    >
                      تعديل
                    </button>
                    <button
                      className={btn}
                      onClick={async () => {
                        if (!confirm(`حذف ${p.name_ar}؟`)) return;
                        await deleteProduct(p.id);
                        await refresh();
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "orders" ? (
          <section className="mt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 px-1">
              <div>
                <h2 className="font-display text-2xl text-espresso">قائمة الطلبات</h2>
                <p className="mt-1 text-sm text-muted-foreground">إدارة وتتبع طلبات العملاء الحالية</p>
              </div>
              <span className="rounded-full border border-gold/50 bg-card px-4 py-1.5 text-xs text-muted-foreground shadow-[var(--shadow-soft)]">
                إجمالي الطلبات: {data?.orders.length ?? 0}
              </span>
            </div>
            <div className="mb-5 flex flex-wrap gap-2" aria-label="فلترة الطلبات">
              {([
                ["all", "الكل"],
                ["pending", "جديد"],
                ["confirmed", "تم التأكيد"],
                ["preparing", "قيد التجهيز"],
                ["delivered", "تم التسليم"],
                ["cancelled", "ملغي"],
              ] as const).map(([value, label]) => {
                const count = value === "all"
                  ? data?.orders.length ?? 0
                  : data?.orders.filter((order) => normalizedStatus(order.status) === value).length ?? 0;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOrderFilter(value)}
                    className={`rounded-xl border px-4 py-2 text-xs transition ${
                      orderFilter === value
                        ? "border-rose bg-rose text-primary-foreground"
                        : "border-gold/60 bg-card text-espresso hover:bg-blush/30"
                    }`}
                  >
                    {label} <span className="font-latin opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3">
            {data?.orders.length === 0 ? <p className="text-muted-foreground">لا توجد طلبات بعد.</p> : null}
            {data?.orders.filter((o) => orderFilter === "all" || normalizedStatus(o.status) === orderFilter).map((o) => {
              const subtotal = Number(o.subtotal ?? 0) || (o.items ?? []).reduce((s, it) => s + it.price * it.qty, 0);
              const fee = Number(o.delivery_fee ?? 0);
              const waPhone = (o.customers?.phone ?? "").replace(/\D/g, "").replace(/^0+/, "");
              const isExpanded = expandedOrder === o.id;
              const currentStatus = normalizedStatus(o.status);
              const status = statusDetails[currentStatus];
              const StatusIcon = status.icon;
              return (
                <article
                  key={o.id}
                  className="overflow-hidden rounded-2xl border border-gold/45 bg-card shadow-[var(--shadow-soft)] transition-all duration-300 hover:border-rose/40"
                >
                  <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-48 items-center gap-4">
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${status.badge}`}>
                        <StatusIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-latin text-[0.62rem] text-muted-foreground">
                          طلب #{o.id.slice(0, 8).toUpperCase()}
                        </p>
                        <h3 className="mt-0.5 font-display text-lg text-espresso">{o.customers?.name ?? "عميلة"}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:flex md:flex-1 md:items-center md:justify-center md:gap-10">
                      <div>
                        <span className="block text-[0.68rem] text-muted-foreground">التاريخ</span>
                        <span className="mt-0.5 block font-latin text-xs text-espresso" dir="ltr">
                          {new Date(o.created_at).toLocaleDateString("en-GB")} {new Date(o.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[0.68rem] text-muted-foreground">المبلغ الإجمالي</span>
                        <span className="mt-0.5 block font-display text-base text-espresso">{formatPrice(Number(o.total))}</span>
                      </div>
                      <div>
                        <span className="block text-[0.68rem] text-muted-foreground">الحالة</span>
                        <span className={`mt-1 inline-flex rounded-full border px-3 py-0.5 text-xs ${status.badge}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={`order-${o.id}`}
                        onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-espresso px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-rose-deep"
                      >
                        {isExpanded ? "إغلاق الطلب" : "تفاصيل الطلب"}
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-destructive/30 text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                            aria-label={`حذف الطلب ${o.id.slice(0, 8).toUpperCase()}`}
                            title="حذف الطلب"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl" className="max-w-md rounded-2xl border-gold/50 bg-card text-right">
                          <AlertDialogHeader className="text-right sm:text-right">
                            <AlertDialogTitle className="font-display text-xl text-espresso">حذف الطلب؟</AlertDialogTitle>
                            <AlertDialogDescription className="leading-7">
                              سيتم حذف طلب #{o.id.slice(0, 8).toUpperCase()} نهائياً، ولا يمكن التراجع عن هذه الخطوة.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2 sm:flex-row-reverse sm:space-x-0">
                            <AlertDialogCancel disabled={deletingOrderId === o.id}>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              disabled={deletingOrderId === o.id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={async () => {
                                setDeletingOrderId(o.id);
                                try {
                                  await deleteOrder(o.id);
                                  if (expandedOrder === o.id) setExpandedOrder(null);
                                  if (invoiceOrder?.id === o.id) setInvoiceOrder(null);
                                  await refresh();
                                } catch {
                                  alert("تعذّر حذف الطلب، حاول مرة أخرى");
                                } finally {
                                  setDeletingOrderId(null);
                                }
                              }}
                            >
                              {deletingOrderId === o.id ? "جارٍ الحذف…" : "نعم، احذف الطلب"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div id={`order-${o.id}`} className="border-t border-gold/40 bg-cream-tint/45 p-5 md:p-7">
                      <div className="grid gap-6 md:grid-cols-[1fr_1fr_0.8fr]">
                        <div>
                          <h4 className="font-display text-base text-espresso">بيانات العميلة</h4>
                          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                            <p dir="ltr" className="text-right">{o.customers?.phone || "لا يوجد رقم"}</p>
                            {o.customers?.phone_alt ? <p dir="ltr" className="text-right">{o.customers.phone_alt}</p> : null}
                            <p>{o.shipping_address ?? o.customers?.address ?? "لا يوجد عنوان"}</p>
                            {o.delivery_zone ? <p>منطقة التوصيل: {o.delivery_zone}</p> : null}
                          </div>
                          {waPhone ? (
                            <a
                              className={`${btn} mt-4 inline-flex`}
                              href={`https://wa.me/972${waPhone.replace(/^972/, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              واتساب العميلة
                            </a>
                          ) : null}
                          <button
                            type="button"
                            className={`${btn} mt-4 inline-flex items-center gap-2`}
                            onClick={() => setInvoiceOrder(o)}
                          >
                            <Printer className="h-4 w-4" aria-hidden="true" />
                            عرض الفاتورة
                          </button>
                        </div>

                        <div>
                          <h4 className="font-display text-base text-espresso">تفاصيل المنتجات</h4>
                          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                            {(o.items ?? []).map((it, i) => (
                              <li key={i} className="flex items-center justify-between gap-4">
                                <span>{it.name_ar} × {it.qty}</span>
                                <span className="font-latin">{formatPrice(it.price * it.qty)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <label className="grid gap-2 text-sm text-espresso">
                            تحديث حالة الطلب
                            <select
                              className={field}
                              value={currentStatus}
                              onChange={async (e) => {
                                await setOrderStatus(o.id, e.target.value);
                                await refresh();
                              }}
                            >
                              {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          </label>
                          <div className="mt-5 grid gap-1 border-t border-gold/40 pt-4 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>مجموع المنتجات</span>
                              <span className="font-latin">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>التوصيل</span>
                              <span className="font-latin">{formatPrice(fee)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 text-espresso">
                              <span>الإجمالي</span>
                              <span className="font-display text-lg">{formatPrice(Number(o.total))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
            </div>
          </section>
        ) : null}

        {tab === "zones" ? (
          <section className="mt-10">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!zoneDraft.name.trim()) return;
                await saveZone(zoneDraft);
                setZoneDraft({ name: "", fee: 0, is_active: true });
                await refresh();
              }}
              className="surface-card grid gap-5 p-8 md:grid-cols-[2fr_1fr_auto] md:items-end"
            >
              <label className="grid gap-2 text-sm text-espresso">
                اسم المنطقة
                <input
                  className={field}
                  value={zoneDraft.name}
                  onChange={(e) => setZoneDraft({ ...zoneDraft, name: e.target.value })}
                  placeholder="مثال: الخليل"
                />
              </label>
              <label className="grid gap-2 text-sm text-espresso">
                سعر التوصيل
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={field}
                  value={zoneDraft.fee}
                  onChange={(e) => setZoneDraft({ ...zoneDraft, fee: Number(e.target.value) })}
                />
              </label>
              <button type="submit" className={btnSolid}>
                {zoneDraft.id ? "تحديث" : "+ إضافة"}
              </button>
            </form>

            <div className="mt-8 grid gap-4">
              {data?.zones.length === 0 ? (
                <p className="text-muted-foreground">لم تُضف مناطق توصيل بعد.</p>
              ) : null}
              {data?.zones.map((z) => (
                <article key={z.id} className="surface-card flex flex-wrap items-center gap-5 p-5">
                  <div className="min-w-40 flex-1">
                    <h3 className="font-display text-lg text-espresso">{z.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      سعر التوصيل {formatPrice(Number(z.fee))} · {z.is_active ? "مفعّلة" : "موقوفة"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className={btn}
                      onClick={() => setZoneDraft({ id: z.id, name: z.name, fee: Number(z.fee), is_active: z.is_active })}
                    >
                      تعديل
                    </button>
                    <button
                      className={btn}
                      onClick={async () => {
                        await saveZone({ id: z.id, name: z.name, fee: Number(z.fee), is_active: !z.is_active });
                        await refresh();
                      }}
                    >
                      {z.is_active ? "إيقاف" : "تفعيل"}
                    </button>
                    <button
                      className={btn}
                      onClick={async () => {
                        if (!confirm(`حذف منطقة ${z.name}؟`)) return;
                        await deleteZone(z.id);
                        await refresh();
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "reviews" ? (
          <section className="mt-10 grid gap-4">
            {data?.reviews.map((r) => (
              <article key={r.id} className="surface-card flex items-start gap-5 p-6">
                <div className="flex-1">
                  <h3 className="font-display text-lg text-espresso">
                    {r.customer_name} · {r.rating}/5
                  </h3>
                  <p className="mt-2 text-sm leading-8 text-muted-foreground">{r.comment}</p>
                </div>
                <button
                  className={btn}
                  onClick={async () => {
                    await deleteReview(r.id);
                    await refresh();
                  }}
                >
                  حذف
                </button>
              </article>
            ))}
          </section>
        ) : null}
          </div>
        </div>
      </div>
      {invoiceOrder ? (
        <div className="invoice-overlay fixed inset-0 z-[70] overflow-y-auto bg-espresso/45 p-4 backdrop-blur-sm print:static print:bg-transparent print:p-0">
          <div className="print-invoice mx-auto my-6 max-w-3xl rounded-2xl bg-card p-7 shadow-[var(--shadow-lifted)] print:my-0 print:max-w-none print:rounded-none print:shadow-none md:p-12" dir="rtl">
            <div className="no-print mb-7 flex items-center justify-between gap-3">
              <button type="button" className={btn} onClick={() => setInvoiceOrder(null)}>إغلاق</button>
              <button type="button" className={`${btnSolid} inline-flex items-center gap-2`} onClick={() => window.print()}>
                <Printer className="h-4 w-4" aria-hidden="true" /> طباعة الفاتورة
              </button>
            </div>
            <header className="flex items-center justify-between gap-6 border-b border-gold/60 pb-6">
              <div>
                <p className="text-sm text-muted-foreground">فاتورة طلب</p>
                <h2 className="mt-1 font-display text-2xl text-espresso">الريم</h2>
                <p className="mt-2 font-latin text-xs text-muted-foreground">#{invoiceOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <img src={logo.url} alt="شعار الريم" className="h-24 w-24 object-contain" />
            </header>
            <div className="grid gap-6 border-b border-gold/40 py-6 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-base text-espresso">بيانات العميلة</h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>{invoiceOrder.customers?.name ?? "عميلة"}</p>
                  <p dir="ltr" className="text-right">{invoiceOrder.customers?.phone}</p>
                  {invoiceOrder.customers?.phone_alt ? <p dir="ltr" className="text-right">{invoiceOrder.customers.phone_alt}</p> : null}
                  <p>{invoiceOrder.shipping_address ?? invoiceOrder.customers?.address}</p>
                </div>
              </div>
              <div>
                <h3 className="font-display text-base text-espresso">بيانات الطلب</h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>رقم الطلب: <span className="font-latin">#{invoiceOrder.id.slice(0, 8).toUpperCase()}</span></p>
                  <p>التاريخ: <span className="font-latin" dir="ltr">{new Date(invoiceOrder.created_at).toLocaleDateString("en-GB")} {new Date(invoiceOrder.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span></p>
                  <p>منطقة التوصيل: {invoiceOrder.delivery_zone ?? "—"}</p>
                  <p>الحالة: {statusDetails[normalizedStatus(invoiceOrder.status)].label}</p>
                </div>
              </div>
            </div>
            <table className="my-6 w-full border-collapse text-sm">
              <thead><tr className="border-b border-gold/60 text-right text-muted-foreground"><th className="py-3 font-normal">المنتج</th><th className="py-3 text-center font-normal">الكمية</th><th className="py-3 text-left font-normal">السعر</th></tr></thead>
              <tbody>{(invoiceOrder.items ?? []).map((item, index) => (
                <tr key={index} className="border-b border-gold/25"><td className="py-3 text-espresso">{item.name_ar}</td><td className="py-3 text-center font-latin">{item.qty}</td><td className="py-3 text-left font-latin">{formatPrice(item.price * item.qty)}</td></tr>
              ))}</tbody>
            </table>
            <div className="mr-auto grid max-w-xs gap-2 text-sm">
              <div className="flex justify-between gap-10 text-muted-foreground"><span>مجموع المنتجات</span><span className="font-latin">{formatPrice(Number(invoiceOrder.subtotal))}</span></div>
              <div className="flex justify-between gap-10 text-muted-foreground"><span>التوصيل</span><span className="font-latin">{formatPrice(Number(invoiceOrder.delivery_fee))}</span></div>
              <div className="mt-2 flex justify-between gap-10 border-t border-gold/60 pt-3 font-display text-lg text-espresso"><span>الإجمالي</span><span>{formatPrice(Number(invoiceOrder.total))}</span></div>
            </div>
            <footer className="mt-10 flex flex-col items-center gap-2 border-t border-gold/40 pt-5 text-center text-xs text-muted-foreground">
              <img src={logo.url} alt="شعار الريم" className="h-12 w-12 object-contain" />
              <span className="font-display text-sm text-espresso">الريم</span>
              <span>شكراً لاختيارك الريم</span>
            </footer>
          </div>
        </div>
      ) : null}
    </main>
  );
}
