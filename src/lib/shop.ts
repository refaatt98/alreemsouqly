import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
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
  ingredients: string;
};

export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  image_url: string | null;
};

export const CATEGORIES: { value: string; label: string; label_en: string }[] = [
  { value: "all", label: "الكل", label_en: "All" },
  { value: "creams", label: "كريمات", label_en: "Creams" },
  { value: "serums", label: "سيرومات", label_en: "Serums" },
  { value: "masks", label: "ماسكات", label_en: "Masks" },
  { value: "oils", label: "زيوت", label_en: "Oils" },
  { value: "cleansers", label: "غسولات", label_en: "Cleansers" },
];

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
  staleTime: 60_000,
});

export const reviewsQuery = queryOptions({
  queryKey: ["reviews"],
  queryFn: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, rating, comment, image_url")
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return (data ?? []) as unknown as Review[];
  },
  staleTime: 60_000,
});

export const formatPrice = (value: number) =>
  `₪${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export type DeliveryZone = { id: string; name: string; fee: number; is_active: boolean };

export const deliveryZonesQuery = queryOptions({
  queryKey: ["delivery-zones"],
  queryFn: async (): Promise<DeliveryZone[]> => {
    const { data, error } = await supabase
      .from("delivery_zones")
      .select("id, name, fee, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as unknown as DeliveryZone[]).map((z) => ({ ...z, fee: Number(z.fee) }));
  },
  staleTime: 60_000,
});
