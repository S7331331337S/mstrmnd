import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/shopify" || path.startsWith("/shopify/") || path.startsWith("/api/shopify/")) {
    // HTML contains no merchant data; each API request independently verifies Shopify's JWT.
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", "frame-ancestors https://admin.shopify.com https://*.myshopify.com");
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  if (process.env.NEXT_PUBLIC_UI_PREVIEW === "1") {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
