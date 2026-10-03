#!/usr/bin/env node
// Operator CLI: `pnpm mstrmnd status` | `pnpm mstrmnd ask <agent> "message"` | `pnpm mstrmnd agents`
const AGENTS = {
  onboarding: {
    label: "Intelligence Gathering",
    env: "NEXT_PUBLIC_EVE_URL",
    fallback: "http://127.0.0.1:3001",
    does: "Onboarding chat that seeds your private profile (5 layers)",
  },
  signal: {
    label: "Signal Report",
    env: "NEXT_PUBLIC_SIGNAL_EVE_URL",
    fallback: "http://127.0.0.1:3002",
    does: "Writes weekly/monthly signal reports into signal_reports",
  },
  canvas: {
    label: "CANVAS",
    env: "NEXT_PUBLIC_CANVAS_EVE_URL",
    fallback: "http://127.0.0.1:3003",
    does: "Fans a thesis out into parallel format drafts (ce_jobs / ce_items)",
  },
};

const urlFor = (a) => (process.env[a.env] ?? a.fallback).replace(/\/$/, "");

async function ping(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return { up: true, status: res.status, ms: Date.now() - started };
  } catch (error) {
    return { up: false, error: error.cause?.code ?? error.message };
  }
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "agents") {
  for (const [key, a] of Object.entries(AGENTS)) {
    console.log(`${key.padEnd(11)} ${a.label}\n            ${a.does}\n            ${urlFor(a)}\n`);
  }
} else if (cmd === "status") {
  for (const [key, a] of Object.entries(AGENTS)) {
    const r = await ping(urlFor(a));
    console.log(
      `${r.up ? "UP  " : "DOWN"} ${key.padEnd(11)} ${urlFor(a)} ${
        r.up ? `(HTTP ${r.status}, ${r.ms}ms)` : `(${r.error})`
      }`,
    );
  }
} else if (cmd === "ask") {
  const [key, ...words] = rest;
  const agent = AGENTS[key];
  const token = process.env.MSTRMND_ACCESS_TOKEN;
  if (!agent || words.length === 0) {
    console.error('Usage: pnpm mstrmnd ask <onboarding|signal|canvas> "message"');
    process.exit(1);
  }
  if (!token) {
    console.error("Set MSTRMND_ACCESS_TOKEN to a Supabase access token (agents require Bearer auth).");
    process.exit(1);
  }
  const res = await fetch(`${urlFor(agent)}/eve/v1/session`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: words.join(" ") }),
  });
  console.log(`HTTP ${res.status}`);
  console.log(`session: ${res.headers.get("x-eve-session-id") ?? "(see body)"}`);
  console.log(await res.text());
} else {
  console.log("mstrmnd <agents | status | ask <agent> \"message\">");
}
