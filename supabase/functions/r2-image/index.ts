import { corsHeaders, r2Request } from "../_shared/r2.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const marker = "/r2-image/";
  const idx = url.pathname.indexOf(marker);
  const key = idx === -1 ? "" : decodeURIComponent(url.pathname.slice(idx + marker.length));

  if (!key) return new Response("missing key", { status: 400, headers: corsHeaders });

  const res = await r2Request("GET", key);
  if (!res.ok) {
    const details = await res.text();
    console.error(`R2 fetch failed [${res.status}] ${key}: ${details}`);
    return new Response("not found", { status: res.status, headers: corsHeaders });
  }

  return new Response(res.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});
