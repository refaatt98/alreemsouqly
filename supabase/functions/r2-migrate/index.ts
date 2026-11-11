// One-off migration: copies every product image currently stored in Supabase
// Storage (or any external URL) into Cloudflare R2 and rewrites product rows.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, publicUrl, r2Request } from "../_shared/r2.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const report: { product: string; moved: number; errors: string[] }[] = [];

  const { data: products, error } = await supabase.from("products").select("id, image_urls");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  for (const p of products ?? []) {
    const urls: string[] = p.image_urls ?? [];
    const next: string[] = [];
    const errors: string[] = [];
    let moved = 0;

    for (const url of urls) {
      if (!url || url.includes("/r2-image/")) {
        next.push(url);
        continue;
      }
      try {
        const src = url.startsWith("http") ? url : `${Deno.env.get("SUPABASE_URL")}${url}`;
        const resp = await fetch(src);
        if (!resp.ok) throw new Error(`download ${resp.status}`);
        const bytes = new Uint8Array(await resp.arrayBuffer());
        const contentType = resp.headers.get("content-type") ?? "image/jpeg";
        const ext = (contentType.split("/")[1] ?? "jpg").split(";")[0].replace(/[^a-z0-9]/gi, "");
        const key = `products/${crypto.randomUUID()}.${ext || "jpg"}`;
        const put = await r2Request("PUT", key, bytes, contentType);
        if (!put.ok) throw new Error(`R2 ${put.status}: ${await put.text()}`);
        next.push(publicUrl(key));
        moved++;
      } catch (e) {
        errors.push(`${url} -> ${e}`);
        next.push(url);
      }
    }

    if (moved > 0) {
      const { error: upErr } = await supabase.from("products").update({ image_urls: next }).eq("id", p.id);
      if (upErr) errors.push(`update: ${upErr.message}`);
    }
    report.push({ product: p.id, moved, errors });
  }

  return new Response(JSON.stringify({ report }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
