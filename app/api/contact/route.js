import { NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_RECIPIENT = "info@velttech.org";
const CONTACT_SENDER = "Velttech <noreply@velttech.org>";
const GENERIC_CONTACT_RESPONSE = "Thank you for contacting us.";
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW_SECONDS = RATE_LIMIT_WINDOW_MS / 1000;
const rateLimitStore = globalThis.__velttechContactRateLimitStore ?? new Map();

globalThis.__velttechContactRateLimitStore = rateLimitStore;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function genericSuccess() {
  return NextResponse.json({
    success: true,
    message: GENERIC_CONTACT_RESPONSE,
  });
}

function normalizeValue(value = "") {
  return String(value).trim();
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const cloudflareIp = request.headers.get("cf-connecting-ip");
  const realIp = request.headers.get("x-real-ip");

  return (
    cloudflareIp ||
    realIp ||
    forwardedFor?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function pruneRateLimitStore(now = Date.now()) {
  for (const [key, attempts] of rateLimitStore.entries()) {
    const freshAttempts = attempts.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (freshAttempts.length) {
      rateLimitStore.set(key, freshAttempts);
    } else {
      rateLimitStore.delete(key);
    }
  }
}

function isLocalRateLimited(key, now = Date.now()) {
  if (!key) {
    return false;
  }

  pruneRateLimitStore(now);

  const attempts = rateLimitStore.get(key) || [];

  if (attempts.length >= RATE_LIMIT_MAX) {
    return true;
  }

  attempts.push(now);
  rateLimitStore.set(key, attempts);

  return false;
}

async function checkUpstashRateLimit(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || !key) {
    return null;
  }

  const redisKey = `contact-rate-limit:${key}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const incrementResponse = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(["INCR", redisKey]),
    cache: "no-store",
  });
  const incrementResult = await incrementResponse.json().catch(() => ({}));
  const count = Number(incrementResult.result);

  if (!Number.isFinite(count)) {
    return null;
  }

  if (count === 1) {
    await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(["EXPIRE", redisKey, RATE_LIMIT_WINDOW_SECONDS]),
      cache: "no-store",
    }).catch(() => null);
  }

  return count > RATE_LIMIT_MAX;
}

async function isRateLimited(key) {
  const persistentResult = await checkUpstashRateLimit(key).catch((error) => {
    console.warn("Persistent contact rate limit unavailable", { key, error });
    return null;
  });

  if (persistentResult !== null) {
    return persistentResult;
  }

  return isLocalRateLimited(key);
}

function meaningfulLength(value = "") {
  return normalizeValue(value).replace(/[^A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF]+/g, "").length;
}

function hasRepeatedGibberishPattern(value = "") {
  const compact = normalizeValue(value).replace(/\s+/g, "");

  if (/(.)\1{5,}/i.test(compact)) {
    return true;
  }

  return /(.{2,5})\1{3,}/i.test(compact);
}

function looksLikeRandomToken(value = "") {
  const compact = normalizeValue(value).replace(/[^A-Za-z0-9]/g, "");

  if (compact.length < 12) {
    return false;
  }

  const letters = compact.replace(/[^A-Za-z]/g, "");
  const vowels = (letters.match(/[aeiou]/gi) || []).length;
  const consonants = (letters.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
  const caseSwitches = (compact.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []).length;
  const hasLower = /[a-z]/.test(compact);
  const hasUpper = /[A-Z]/.test(compact);

  return (
    letters.length >= 12 &&
    hasLower &&
    hasUpper &&
    caseSwitches >= 5 &&
    (vowels === 0 || consonants / Math.max(vowels, 1) >= 4)
  );
}

function isValidName(value = "") {
  const name = normalizeValue(value);

  if (name.length < 2 || name.length > 120) {
    return false;
  }

  if (looksLikeRandomToken(name) || hasRepeatedGibberishPattern(name)) {
    return false;
  }

  return /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u.test(name);
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeValue(value));
}

function isValidPhone(value = "") {
  const phone = normalizeValue(value);
  const digits = phone.replace(/\D/g, "");

  if (!/^\+?[0-9\s().-]{7,20}$/.test(phone)) {
    return false;
  }

  if (digits.length < 7 || digits.length > 15) {
    return false;
  }

  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  return digits !== "12345" && digits !== "1234567890";
}

function isValidMessage(value = "") {
  const message = normalizeValue(value);

  if (message.length < 20 || meaningfulLength(message) < 10) {
    return false;
  }

  if (looksLikeRandomToken(message) || hasRepeatedGibberishPattern(message)) {
    return false;
  }

  const words = message.match(/[\p{L}\p{M}0-9']{2,}/gu) || [];
  const longWords = words.filter((word) => word.length >= 3);

  return words.length >= 3 || longWords.join("").length >= 18;
}

function logSuspiciousSubmission(reason, details = {}) {
  console.warn("Suspicious contact submission blocked", {
    reason,
    ip: details.ip,
    email: details.email,
    service: details.service,
  });
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  if (!secret) {
    return true;
  }

  if (!token) {
    return false;
  }

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    }),
  })
    .then((response) => response.json())
    .catch(() => ({}));

  return Boolean(result.success);
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = normalizeValue(payload.name);
    const email = normalizeValue(payload.email).toLowerCase();
    const phone = normalizeValue(payload.phone);
    const service = normalizeValue(payload.service);
    const message = normalizeValue(payload.message);
    const website = normalizeValue(payload.website);
    const turnstileToken = normalizeValue(payload.turnstileToken || payload["cf-turnstile-response"]);
    const ip = getClientIp(request);
    const logDetails = { ip, email, service };

    if (website) {
      logSuspiciousSubmission("honeypot triggered", logDetails);
      return genericSuccess();
    }

    if (
      (await isRateLimited(`ip:${ip}`)) ||
      (email && (await isRateLimited(`email:${email}`)))
    ) {
      logSuspiciousSubmission("rate limit exceeded", logDetails);
      return genericSuccess();
    }

    if (!name || !email || !phone || !service || !message) {
      return NextResponse.json(
        { error: "Please complete all fields before sending your message." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      logSuspiciousSubmission("invalid email", logDetails);
      return genericSuccess();
    }

    if (!isValidName(name)) {
      logSuspiciousSubmission("invalid name", logDetails);
      return genericSuccess();
    }

    if (!isValidPhone(phone)) {
      logSuspiciousSubmission("invalid phone", logDetails);
      return genericSuccess();
    }

    if (!isValidMessage(message)) {
      logSuspiciousSubmission("invalid message", logDetails);
      return genericSuccess();
    }

    if (!(await verifyTurnstile(turnstileToken, ip))) {
      logSuspiciousSubmission("turnstile verification failed", logDetails);
      return genericSuccess();
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");

      return NextResponse.json(
        { error: "Server email configuration is missing." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: CONTACT_SENDER,
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: "New Contact Form Submission from Velttech Website",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Service Interest:</strong> ${escapeHtml(service)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Contact form error:", error);

      return NextResponse.json(
        { error: "We could not send your message right now. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { error: "We could not send your message right now. Please try again." },
      { status: 500 }
    );
  }
}
