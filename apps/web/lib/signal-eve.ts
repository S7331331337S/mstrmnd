/**
 * Eve helpers for the signal-report agent (separate process/port from onboarding).
 */

const SIGNAL_EVE_BASE =
  process.env.NEXT_PUBLIC_SIGNAL_EVE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:3002";

export type EveSessionStart = {
  sessionId: string;
  continuationToken?: string;
};

export async function startSignalEveSession(
  message: string,
  accessToken: string,
): Promise<EveSessionStart> {
  const response = await fetch(`${SIGNAL_EVE_BASE}/eve/v1/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `signal-report eve session start failed (${response.status}): ${text}`,
    );
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

export function signalEveStreamUrl(sessionId: string): string {
  return `${SIGNAL_EVE_BASE}/eve/v1/session/${sessionId}/stream`;
}
