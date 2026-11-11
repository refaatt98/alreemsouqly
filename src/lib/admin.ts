// Admin dashboard data access — BETA mode.
// Everything runs directly against Supabase with the public (anon) key:
// no server functions, no environment variables, no password gate.
import { supabase } from "@/integrations/supabase/client";


export type AdminOrder = {
  id: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  delivery_zone: string | null;
  status: string;
  shipping_address: string | null;
  created_at: string;
  items: { id: string; name_ar: string; price: number; qty: number }[];
  customers: {
    name: string;
    phone: string;
    phone_alt: string | null;
    email: string | null;
    address: string | null;
  } | null;
};

export type DeliveryZoneRow = { id: string; name: string; fee: number; is_active: boolean };

type Product = {
  id: string;
  name_ar: string;
  name_en: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  image_urls: string[];
  stock_quantity: number;
  is_featured: boolean;
};

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  image_url: string | null;
};

export type ProductDraft = {
  id?: string;
  name_ar: string;
  name_en: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  image_urls: string[];
  stock_quantity: number;
  is_featured: boolean;
};

export async function adminData(): Promise<{
  products: Product[];
  orders: AdminOrder[];
  reviews: Review[];
  zones: DeliveryZoneRow[];
}> {
  const [products, orders, reviews, zones] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("*, customers(name, phone, phone_alt, email, address)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("delivery_zones").select("id, name, fee, is_active").order("name", { ascending: true }),
  ]);

  if (products.error) throw new Error(products.error.message);
  if (orders.error) throw new Error(orders.error.message);
  if (reviews.error) throw new Error(reviews.error.message);
  if (zones.error) throw new Error(zones.error.message);

  return {
    products: (products.data ?? []) as unknown as Product[],
    orders: (orders.data ?? []) as unknown as AdminOrder[],
    reviews: (reviews.data ?? []) as unknown as Review[],
    zones: ((zones.data ?? []) as unknown as DeliveryZoneRow[]).map((z) => ({ ...z, fee: Number(z.fee) })),
  };
}

export async function saveProduct(draft: ProductDraft) {
  const row = {
    name_ar: draft.name_ar.trim(),
    name_en: draft.name_en.trim(),
    description: draft.description,
    price: draft.price,
    compare_at_price: draft.compare_at_price,
    category: draft.category,
    image_urls: draft.image_urls,
    stock_quantity: draft.stock_quantity,
    is_featured: draft.is_featured,
  };

  const { error } = draft.id
    ? await supabase.from("products").update(row).eq("id", draft.id)
    : await supabase.from("products").insert(row);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function setOrderStatus(id: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

/** Uploads an image file to Cloudflare R2 and returns its permanent URL. */
export async function uploadProductImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);

  const { data, error } = await supabase.functions.invoke("r2-upload", { body: form });
  if (error) {
    const details = "context" in error && error.context ? await (error.context as Response).text() : error.message;
    throw new Error(details || "تعذّر رفع الصورة");
  }
  if (!data?.url) throw new Error("تعذّر رفع الصورة");

  return { url: data.url as string };
}


export async function saveZone(zone: { id?: string; name: string; fee: number; is_active: boolean }) {
  const row = { name: zone.name.trim(), fee: zone.fee, is_active: zone.is_active };
  const { error } = zone.id
    ? await supabase.from("delivery_zones").update(row).eq("id", zone.id)
    : await supabase.from("delivery_zones").insert(row);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function deleteZone(id: string) {
  const { error } = await supabase.from("delivery_zones").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}
