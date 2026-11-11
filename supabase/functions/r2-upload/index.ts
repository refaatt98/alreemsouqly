import { corsHeaders, publicUrl, r2Request } from "../_shared/r2.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "missing file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `products/${crypto.randomUUID()}.${ext || "jpg"}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const res = await r2Request("PUT", key, bytes, file.type || "image/jpeg");
    if (!res.ok) {
      const details = await res.text();
      console.error(`R2 upload failed [${res.status}]: ${details}`);
      return new Response(JSON.stringify({ error: "R2 upload failed", status: res.status, details }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: publicUrl(key), key }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("r2-upload error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
