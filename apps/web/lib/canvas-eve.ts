/**
 * Eve helpers for the CANVAS agent (Content Engine creation seat).
 */

const CANVAS_EVE_BASE =
  process.env.NEXT_PUBLIC_CANVAS_EVE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:3003";

export type EveSessionStart = {
  sessionId: string;
  continuationToken?: string;
};

export async function startCanvasEveSession(
  message: string,
  accessToken: string,
): Promise<EveSessionStart> {
  const response = await fetch(`${CANVAS_EVE_BASE}/eve/v1/session`, {
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
      `canvas eve session start failed (${response.status}): ${text}`,
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

export function canvasEveStreamUrl(sessionId: string): string {
  return `${CANVAS_EVE_BASE}/eve/v1/session/${sessionId}/stream`;
}
