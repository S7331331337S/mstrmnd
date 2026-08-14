import { createClient } from "@supabase/supabase-js";
import {
  type AuthFn,
  localDev,
  UnauthenticatedError,
  withAuthChallenges,
} from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

/**
 * Authenticate callers with a Supabase access token (Bearer).
 * Sets principalId to auth.users.id so tools can write the correct profile.
 */
function supabaseBearerAuth(): AuthFn<Request> {
  return withAuthChallenges(async (request) => {
    const header = request.headers.get("authorization");
    if (!header?.toLowerCase().startsWith("bearer ")) {
      return null;
    }

    const token = header.slice("bearer ".length).trim();
    if (!token) return null;

    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new UnauthenticatedError({
        code: "authentication_required",
        message: "Supabase auth is not configured on the eve agent.",
      });
    }

    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthenticatedError({
        code: "authentication_required",
        message: "Invalid or expired Supabase session.",
      });
    }

    return {
      authenticator: "supabase",
      principalId: data.user.id,
      principalType: "user" as const,
      attributes: {
        ...(data.user.email ? { email: data.user.email } : {}),
        userId: data.user.id,
      },
    };
  }, [{ scheme: "Bearer" }]);
}

export default eveChannel({
  auth: [supabaseBearerAuth(), localDev()],
});
