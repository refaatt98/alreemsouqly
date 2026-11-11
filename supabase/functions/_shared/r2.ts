// Minimal AWS SigV4 client for Cloudflare R2 (S3 API).
const enc = new TextEncoder();

const ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID")!;
const ACCESS_KEY = Deno.env.get("R2_ACCESS_KEY_ID")!;
const SECRET_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
export const BUCKET = Deno.env.get("R2_BUCKET") ?? "toot";
const ENDPOINT = (Deno.env.get("R2_ENDPOINT") ?? `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`).replace(/\/$/, "");
const REGION = "auto";
const SERVICE = "s3";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === "string" ? enc.encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(key: Uint8Array | string, msg: string): Promise<Uint8Array> {
  const k = typeof key === "string" ? enc.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey("raw", k, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(msg)));
}

function encodeKey(key: string): string {
  return key.split("/").map((seg) => encodeURIComponent(seg)).join("/");
}

/** Signs and sends an S3 request to R2. */
export async function r2Request(
  method: "GET" | "PUT" | "DELETE" | "HEAD",
  key: string,
  body?: Uint8Array,
  contentType?: string,
): Promise<Response> {
  const url = new URL(`${ENDPOINT}/${BUCKET}/${encodeKey(key)}`);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(body ?? new Uint8Array());

  const headers: Record<string, string> = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (contentType) headers["content-type"] = contentType;

  const signedHeaders = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaders.map((h) => `${h}:${headers[h].trim()}\n`).join("");
  const signedHeaderList = signedHeaders.join(";");
  const canonicalRequest = [method, url.pathname, "", canonicalHeaders, signedHeaderList, payloadHash].join("\n");

  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");

  let signingKey = await hmac(`AWS4${SECRET_KEY}`, dateStamp);
  signingKey = await hmac(signingKey, REGION);
  signingKey = await hmac(signingKey, SERVICE);
  signingKey = await hmac(signingKey, "aws4_request");
  const sigBytes = await hmac(signingKey, stringToSign);
  const signature = [...sigBytes].map((b) => b.toString(16).padStart(2, "0")).join("");

  headers["authorization"] =
    `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${scope}, SignedHeaders=${signedHeaderList}, Signature=${signature}`;

  return await fetch(url.toString(), { method, headers, body });
}

export function publicUrl(key: string): string {
  const base = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  return `${base}/functions/v1/r2-image/${encodeKey(key)}`;
}
