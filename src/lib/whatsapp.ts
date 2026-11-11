// Store WhatsApp number (international format, digits only).
export const STORE_WHATSAPP = "972523225359";

const money = (v: number) => `₪${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export type WhatsAppOrder = {
  orderId: string;
  name: string;
  phone: string;
  phoneAlt?: string;
  address: string;
  zone?: string;
  items: { name_ar: string; price: number; qty: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

/** Builds a polished Arabic order summary for WhatsApp. */
export function buildWhatsAppOrderMessage(o: WhatsAppOrder): string {
  const ref = o.orderId ? o.orderId.slice(0, 8).toUpperCase() : "—";
  const date = new Date().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

  const lines = [
    "🌸 *الريم* — طلب جديد",
    "",
    `🧾 رقم الطلب: *${ref}*`,
    `🗓️ التاريخ: ${date}`,
    "",
    "*بيانات العميل*",
    `👤 الاسم: ${o.name}`,
    `📱 الجوال: ${o.phone}`,
  ];

  if (o.phoneAlt) lines.push(`📞 رقم احتياطي: ${o.phoneAlt}`);
  if (o.zone) lines.push(`📍 منطقة التوصيل: ${o.zone}`);
  lines.push(`🏠 العنوان: ${o.address}`, "", "*تفاصيل الطلب*");

  o.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name_ar} × ${it.qty} — ${money(it.price * it.qty)}`);
  });

  lines.push(
    "",
    `مجموع المنتجات: ${money(o.subtotal)}`,
    `التوصيل: ${money(o.deliveryFee)}`,
    `*الإجمالي: ${money(o.total)}*`,
    "",
    "شكراً لثقتكم بالريم 💛 سيتم التواصل معكم لتأكيد الطلب.",
  );

  return lines.join("\n");
}
