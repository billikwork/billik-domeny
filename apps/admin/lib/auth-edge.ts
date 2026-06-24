const SESSION_PAYLOAD = "billik-admin-v1";

async function hmacHex(secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SESSION_PAYLOAD));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionTokenEdge() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return hmacHex(secret);
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const expected = await createSessionTokenEdge();
  if (!expected) return false;
  return token === expected;
}