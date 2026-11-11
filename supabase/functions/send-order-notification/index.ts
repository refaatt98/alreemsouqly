// Sends a Web Push notification to every saved admin device when a new order arrives.
// Called by the `orders_notify_new_order` database trigger with { order_id }.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");

  // Public VAPID key lookup, so the browser always subscribes with the key this
  // function actually signs with (no key mismatch after a remix / key change).
  const url = new URL(req.url);
  if (req.method === "GET" || url.searchParams.get("mode") === "key") {
    if (!publicKey) return json({ error: "VAPID keys are not configured" }, 500);
    return json({ publicKey });
  }

  let body: { order_id?: string; record?: { id?: string }; test?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // allow empty body for manual test pings
  }

  const hookSecret = Deno.env.get("ORDER_HOOK_SECRET");
  if (!body.test && hookSecret && req.headers.get("x-order-hook-secret") !== hookSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (!publicKey || !privateKey) return json({ error: "VAPID keys are not configured" }, 500);

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com",
    publicKey,
    privateKey,
  );

  const orderId = body.order_id ?? body.record?.id ?? null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let title = body.test ? "تجربة الإشعارات ✅" : "طلب جديد";
  let message = body.test
    ? "الإشعارات تعمل على هذا الجهاز"
    : "لديك طلب جديد في لوحة التحكم";

  if (orderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, total, customers(name)")
      .eq("id", orderId)
      .maybeSingle();

    if (order) {
      const customerName = (order.customers as { name?: string } | null)?.name?.trim() || "عميل جديد";
      const total = Number(order.total ?? 0).toFixed(2).replace(/\.00$/, "");
      title = `طلب جديد — ${customerName}`;
      message = `طلب جديد من ${customerName} - الإجمالي: ${total} ₪`;
    }
  }

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, keys");
  if (error) return json({ error: error.message }, 500);

  const payload = JSON.stringify({
    title,
    body: message,
    icon: "/icon-192.png",
    badge: "/badge-96.png",
    url: orderId ? `/admin/orders?order=${orderId}` : "/admin/orders",
    tag: body.test ? `test-${Date.now()}` : (orderId ?? "new-order"),
  });

  let sent = 0;
  const stale: string[] = [];
  const failures: string[] = [];

  // Every saved device gets the notification.
  await Promise.all(
    (subs ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
          payload,
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // 404/410 = device gone, 403 = subscribed with a different VAPID key.
        if (status === 404 || status === 410 || status === 403 || status === 400) stale.push(sub.id);
        else failures.push(`${status ?? "?"}`);
        console.error("push failed", sub.endpoint, status, String(e));
      }
    }),
  );

  if (stale.length) await supabase.from("push_subscriptions").delete().in("id", stale);

  return json({ ok: true, sent, removed: stale.length, total: subs?.length ?? 0, failures });
});
