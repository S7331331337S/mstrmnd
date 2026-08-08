/**
 * Eve agent HTTP helpers for the onboarding chat UI.
 * The intelligence-gathering agent runs separately (`pnpm --filter @mstrmnd/intelligence-gathering dev`).
 */

const EVE_BASE =
  process.env.NEXT_PUBLIC_EVE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3001";

export type EveSessionStart = {
  sessionId: string;
  continuationToken?: string;
};

export async function startEveSession(
  message: string,
  accessToken: string,
): Promise<EveSessionStart> {
  const response = await fetch(`${EVE_BASE}/eve/v1/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`eve session start failed (${response.status}): ${text}`);
  }

  const sessionId = response.headers.get("x-eve-session-id");
  const body = (await response.json()) as {
    sessionId?: string;
    continuationToken?: string;
  };

  return {
    sessionId: sessionId ?? body.sessionId ?? "",
    continuationToken: body.continuationToken,
  };
}

export async function continueEveSession(
  sessionId: string,
  message: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(`${EVE_BASE}/eve/v1/session/${sessionId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`eve session continue failed (${response.status}): ${text}`);
  }
}

export function eveStreamUrl(sessionId: string): string {
  return `${EVE_BASE}/eve/v1/session/${sessionId}/stream`;
}
