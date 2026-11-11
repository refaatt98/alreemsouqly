import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, ChevronUp, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/i18n";
import { deliveryZonesQuery, formatPrice } from "@/lib/shop";
import { STORE_WHATSAPP, buildWhatsAppOrderMessage } from "@/lib/whatsapp";
import { Cta } from "./ui";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total, clear } = useCart();
  const { t } = useLang();
  const [checkout, setCheckout] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", phone_alt: "", city: "", address: "", zoneId: "" });

  const { data: zones = [] } = useQuery(deliveryZonesQuery);
  const zone = useMemo(() => zones.find((z) => z.id === form.zoneId) ?? null, [zones, form.zoneId]);
  const deliveryFee = zone?.fee ?? 0;
  const grandTotal = total + deliveryFee;

  const shippingAddress = [form.city.trim(), form.address.trim()].filter(Boolean).join("، ");

  const validateAddress = () => {
    setError(null);
    if (form.name.trim().length < 2 || form.phone.trim().length < 7) {
      setError(t("cart.error.form"));
      return false;
    }
    if (zones.length > 0 && !zone) {
      setError(t("cart.error.zone"));
      return false;
    }
    if (form.address.trim().length < 5) {
      setError(t("cart.error.address"));
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateAddress()) return;
    setBusy(true);
    try {
      const customerId = crypto.randomUUID();
      const { error: cErr } = await supabase.from("customers").insert({
        id: customerId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        phone_alt: form.phone_alt.trim() || null,
        address: shippingAddress,
      });
      if (cErr) throw cErr;

      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          items: items as never,
          subtotal: total,
          delivery_fee: deliveryFee,
          delivery_zone: zone?.name ?? null,
          total: grandTotal,
          shipping_address: shippingAddress,
        })
        .select("id, created_at")
        .single();
      if (oErr) throw oErr;

      const message = buildWhatsAppOrderMessage({
        orderId: order?.id ?? "",
        name: form.name.trim(),
        phone: form.phone.trim(),
        phoneAlt: form.phone_alt.trim(),
        address: shippingAddress,
        zone: zone?.name ?? "",
        items,
        subtotal: total,
        deliveryFee,
        total: grandTotal,
      });
      window.open(
        `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer",
      );

      clear();
      setForm({ name: "", phone: "", phone_alt: "", city: "", address: "", zoneId: "" });
      setAddressSaved(false);
      setDone(true);
      setCheckout(false);
    } catch {
      setError(t("cart.error.submit"));
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-cream px-4 py-3 text-base outline-none transition focus:border-rose-deep focus:ring-2 focus:ring-rose/20";

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-espresso/30 backdrop-blur-sm transition-opacity duration-700 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-card shadow-[var(--shadow-lifted)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] end-0 ${
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
        aria-label={t("cart.title")}
      >
        <header className="flex items-center justify-between border-b border-gold/40 px-7 py-6">
          <h2 className="font-display text-xl text-espresso">{t("cart.title")}</h2>
          <Cta tone="outline" onClick={() => setOpen(false)} aria-label={t("cart.close")} className="!h-10 !w-10 !p-0 [&>span>span]:hidden"><X className="h-5 w-5" /></Cta>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {done ? (
            <div className="mt-16 text-center">
              <p className="font-display text-2xl text-espresso">{t("cart.done.title")}</p>
              <p className="mt-4 text-sm leading-8 text-muted-foreground">{t("cart.done.sub")}</p>
              <button onClick={() => setDone(false)} className="mt-8 text-sm text-rose">
                {t("cart.continue")}
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="mt-16 text-center text-sm text-muted-foreground">{t("cart.empty")}</p>
          ) : !checkout ? (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name_ar}
                    loading="lazy"
                    width={200}
                    height={200}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-display text-base text-espresso">{item.name_ar}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 rounded-full border border-gold px-3 py-1">
                        <button onClick={() => setQty(item.id, item.qty - 1)} aria-label="-">
                          −
                        </button>
                        <span className="font-latin text-xs">{item.qty}</span>
                        <button onClick={() => setQty(item.id, item.qty + 1)} aria-label="+">
                          +
                        </button>
                      </div>
                      <button onClick={() => remove(item.id)} className="text-xs text-muted-foreground underline">
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {checkout && !done && items.length > 0 ? (
            <section aria-labelledby="shipping-heading">
              <div className="mb-6 flex items-center justify-between">
                <h3 id="shipping-heading" className="flex items-center gap-2 text-xl font-semibold text-espresso">
                  <MapPin className="h-6 w-6" />{t("cart.shippingTitle")}
                </h3>
                {addressSaved ? (
                  <Cta tone="outline" onClick={() => setAddressSaved(false)} aria-label={t("cart.editAddress")} className="!h-9 !w-9 !p-0 [&>span>span]:hidden"><Pencil className="h-4 w-4" /></Cta>
                ) : <ChevronUp className="h-5 w-5 text-espresso" />}
              </div>
              {addressSaved ? (
                <div className="space-y-2 border-b border-border pb-6 text-sm">
                  <p className="font-semibold">{form.name}</p>
                  <p dir="ltr" className="text-start">{form.phone}</p>
                  <p>{zone?.name}</p>
                  <p>{shippingAddress}</p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (validateAddress()) setAddressSaved(true); }}>
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-name" className="block text-sm font-medium">{t("cart.recipient")}</label>
                    <input id="shipping-name" value={form.name} maxLength={80} autoComplete="name" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-phone" className="block text-sm font-medium">{t("cart.phone")}</label>
                    <input id="shipping-phone" type="tel" value={form.phone} maxLength={20} dir="ltr" autoComplete="tel" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-zone" className="block text-sm font-medium">{t("cart.zone")}</label>
                    <select id="shipping-zone" value={form.zoneId} onChange={(e) => setForm((f) => ({ ...f, zoneId: e.target.value }))} className={inputClass}>
                      <option value="">{t("cart.zone.choose")}</option>
                      {zones.map((z) => <option key={z.id} value={z.id}>{z.name} — {formatPrice(z.fee)}</option>)}
                    </select>
                    {zones.length === 0 ? <p className="text-xs text-muted-foreground">{t("cart.zone.none")}</p> : null}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-city" className="block text-sm font-medium">{t("cart.city")}</label>
                    <input id="shipping-city" value={form.city} maxLength={80} autoComplete="address-level2" placeholder={t("cart.cityPlaceholder")} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-address" className="block text-sm font-medium">{t("cart.detailedAddress")}</label>
                    <textarea id="shipping-address" value={form.address} maxLength={240} rows={3} autoComplete="street-address" onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder={t("cart.addressPlaceholder")} className={`${inputClass} resize-none`} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-phone-alt" className="block text-sm font-medium">{t("cart.phoneAlt")}</label>
                    <input id="shipping-phone-alt" type="tel" value={form.phone_alt} maxLength={20} dir="ltr" autoComplete="tel" onChange={(e) => setForm((f) => ({ ...f, phone_alt: e.target.value }))} className={inputClass} />
                  </div>
                  {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Cta type="submit" className="!rounded-lg !bg-rose-deep !px-3 !py-3 !font-sans !text-sm !font-medium !tracking-normal !normal-case [&>span>span]:hidden">{t("cart.saveAddress")}</Cta>
                    <Cta type="button" tone="outline" onClick={() => { setCheckout(false); setError(null); }} className="!rounded-lg !border-border !bg-cream !px-3 !py-3 !font-sans !text-sm !font-medium !tracking-normal !normal-case [&>span>span]:hidden">{t("cart.cancel")}</Cta>
                  </div>
                </form>
              )}
            </section>
          ) : null}
        </div>

        {items.length > 0 && !done ? (
          <footer className="border-t border-gold/40 px-7 py-6">
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{t("cart.subtotal")}</span>
                <span className="font-latin">{formatPrice(total)}</span>
              </div>
              {checkout ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>
                    {t("cart.delivery")}
                    {zone ? ` · ${zone.name}` : ""}
                  </span>
                  <span className="font-latin">{formatPrice(deliveryFee)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">{t("cart.total")}</span>
                <span className="font-display text-xl text-espresso">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            {checkout && addressSaved ? <p className="mb-3 text-xs text-muted-foreground">{t("cart.whatsapp.note")}</p> : null}
            {checkout && addressSaved && error ? <p role="alert" className="mb-3 text-xs text-destructive">{error}</p> : null}
            <Cta className="w-full !rounded-lg !bg-rose-deep !font-sans !text-sm !font-medium !tracking-normal !normal-case disabled:opacity-40 [&>span>span]:hidden" disabled={busy || (checkout && !addressSaved)} onClick={() => (checkout ? void submit() : setCheckout(true))}>
              {checkout ? (busy ? t("cart.sending") : t("cart.confirm")) : t("cart.checkout")}
            </Cta>
          </footer>
        ) : null}
      </aside>
    </>
  );
}
