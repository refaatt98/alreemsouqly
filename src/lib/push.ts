// Web Push subscription helpers for the admin dashboard.
import { supabase } from "@/integrations/supabase/client";

// Fallback public VAPID key — safe to ship to the browser (private key lives in Supabase secrets).
export const VAPID_PUBLIC_KEY =
  "BE1IE2n3KJHR-kYBA6JMRqxBLwAN_adAU6GCmxsLewowVYjsHTBz_NsBAY6sYayZUAt5yVfF5DmHWCccl1fkRc4";

// Always subscribe with the key the server actually signs with.
async function serverPublicKey(): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("send-order-notification", {
      method: "GET",
    });
    const key = (data as { publicKey?: string } | null)?.publicKey;
    if (!error && key) return key;
  } catch {
    // fall through to the bundled key
  }
  return VAPID_PUBLIC_KEY;
}

export type PushStatus = "unsupported" | "blocked" | "enabled" | "disabled";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function registerWorker() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function currentPushStatus(): Promise<PushStatus> {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission !== "granted") return "disabled";

  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const sub = await reg?.pushManager.getSubscription();
  return sub ? "enabled" : "disabled";
}

export async function enablePush(): Promise<PushStatus> {
  if (!pushSupported()) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission === "denied") return "blocked";
  if (permission !== "granted") return "disabled";

  const reg = await registerWorker();
  await navigator.serviceWorker.ready;

  const key = await serverPublicKey();
  const existing = await reg.pushManager.getSubscription();
  // Drop a subscription made with an older key, otherwise sending fails silently.
  if (existing) {
    const current = existing.options?.applicationServerKey;
    const same =
      current &&
      btoa(String.fromCharCode(...new Uint8Array(current)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "") === key;
    if (!same) {
      await supabase.from("push_subscriptions").delete().eq("endpoint", existing.endpoint);
      await existing.unsubscribe();
    }
  }

  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    }));

  const raw = sub.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint: sub.endpoint,
      keys: raw.keys ?? {},
      user_agent: navigator.userAgent,
    },
    { onConflict: "endpoint" },
  );
  if (error) throw new Error(error.message);

  return "enabled";
}

export async function disablePush(): Promise<PushStatus> {
  if (!pushSupported()) return "unsupported";

  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  }
  return Notification.permission === "denied" ? "blocked" : "disabled";
}

// Sends a test notification to every device that enabled notifications.
export async function sendTestPush(): Promise<{ sent: number; total: number }> {
  const { data, error } = await supabase.functions.invoke("send-order-notification", {
    body: { test: true },
  });
  if (error) throw new Error(error.message);
  const res = data as { sent?: number; total?: number };
  return { sent: res?.sent ?? 0, total: res?.total ?? 0 };
}
