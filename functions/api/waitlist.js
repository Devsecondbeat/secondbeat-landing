const INSTRUMENT_INTERESTS = new Set([
  "Acoustic",
  "Electric",
  "Drums",
  "Piano",
  "Classical",
  "Not sure",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeInstrument(value) {
  if (value == null || value === "") return null;
  const trimmed = String(value).trim();
  return INSTRUMENT_INTERESTS.has(trimmed) ? trimmed : null;
}

async function verifyTurnstile(token, secret, ip) {
  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (ip) body.set("remoteip", ip);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body }
  );
  const result = await response.json();
  return result.success === true;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return json({ error: "Waitlist storage is not configured." }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const email = normalizeEmail(payload.email);
  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: "Enter a valid email address." }, 400);
  }

  if (payload.consent !== true) {
    return json({ error: "Consent is required to join the waitlist." }, 400);
  }

  const instrumentInterest = normalizeInstrument(payload.instrument_interest);
  if (
    payload.instrument_interest != null &&
    payload.instrument_interest !== "" &&
    instrumentInterest == null
  ) {
    return json({ error: "Choose a valid instrument interest option." }, 400);
  }

  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = payload.turnstile_token;
    if (!token) {
      return json({ error: "Complete the security check and try again." }, 400);
    }
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const verified = await verifyTurnstile(token, turnstileSecret, ip);
    if (!verified) {
      return json({ error: "Security check failed. Please try again." }, 403);
    }
  }

  const now = new Date().toISOString();
  const source =
    typeof payload.source === "string" && payload.source.trim()
      ? payload.source.trim().slice(0, 64)
      : "landing-cta";

  try {
    await env.DB.prepare(
      `INSERT INTO waitlist (email, instrument_interest, consent_at, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         instrument_interest = excluded.instrument_interest,
         updated_at = excluded.updated_at`
    )
      .bind(email, instrumentInterest, now, source, now, now)
      .run();
  } catch (err) {
    console.error("waitlist insert failed", err);
    return json({ error: "Could not join the waitlist. Try again later." }, 500);
  }

  return json(
    {
      ok: true,
      message: "You're on the list — we'll be in touch when Used Gear early access opens.",
    },
    201
  );
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
}
