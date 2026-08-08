import type { ToolContext } from "eve/tools";

/**
 * Resolve the authenticated Supabase user id from eve session auth.
 * Channel auth should set principalId to auth.users.id.
 */
export function requireUserId(ctx: ToolContext): string {
  const auth = ctx.session.auth;
  const principal =
    auth.current?.principalId ??
    auth.initiator?.principalId ??
    (typeof auth.current?.attributes?.userId === "string"
      ? auth.current.attributes.userId
      : undefined) ??
    process.env.MSTRMND_DEV_USER_ID;

  if (!principal) {
    throw new Error(
      "No authenticated user on this eve session. Ensure channel auth sets principalId to the Supabase user id.",
    );
  }

  return principal;
}
