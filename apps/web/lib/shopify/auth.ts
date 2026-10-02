import { jwtVerify } from "jose";

export class ShopifyError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export async function verifyShopifyToken(token: string, clientId: string, secret: string) {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    algorithms: ["HS256"], audience: clientId,
    requiredClaims: ["exp", "nbf", "iss", "dest", "sub"],
  });
  if (typeof payload.dest !== "string" || typeof payload.iss !== "string" || !payload.sub) throw new Error("Invalid claims");
  const dest = new URL(payload.dest);
  const issuer = new URL(payload.iss);
  if (!/^https:\/\/[a-z0-9][a-z0-9-]*\.myshopify\.com\/?$/.test(payload.dest) ||
      issuer.origin !== dest.origin || issuer.pathname !== "/admin") throw new Error("Invalid shop");
  return { shop: dest.hostname, userId: payload.sub };
}
export async function authenticateShopify(request: Request) {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const secret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !secret || !process.env.SHOPIFY_FUNCTION_ID) throw new ShopifyError("Shopify pilot is not configured.", 503);
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new ShopifyError("Open this workflow from Shopify admin.", 401);
  let identity;
  try { identity = await verifyShopifyToken(token, clientId, secret); }
  catch { throw new ShopifyError("Shopify session expired. Reopen the app.", 401); }
  const allowed = (process.env.SHOPIFY_ALLOWED_SHOPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!allowed.includes(identity.shop)) throw new ShopifyError("This shop is not enabled for the pilot.", 403);
  // Online tokens preserve the current staff member's permissions. Never fall back to offline access.
  const exchanged = await fetch(`https://${identity.shop}/admin/oauth/access_token`, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: secret,
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      subject_token: token, subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
      requested_token_type: "urn:shopify:params:oauth:token-type:online-access-token" }),
  });
  if (!exchanged.ok) throw new ShopifyError("Could not authorize Shopify session.", exchanged.status === 400 ? 401 : 502);
  const access = await exchanged.json();
  if (typeof access.access_token !== "string" || String(access.associated_user?.id) !== identity.userId)
    throw new ShopifyError("Shopify authorization did not match the current user.", 401);
  return async function graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(`https://${identity.shop}/admin/api/2026-07/graphql.json`, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": access.access_token },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) throw new ShopifyError("Shopify request failed. Check the discount in admin before retrying a save.", 502);
    const body = await response.json();
    if (body.errors?.length || !body.data) throw new ShopifyError("Shopify could not complete this action. Check your staff permissions and the discount in admin.", 502);
    return body.data as T;
  };
}
