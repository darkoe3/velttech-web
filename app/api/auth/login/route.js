import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, authCookieOptions } from "@/lib/auth-cookies";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

export async function POST(request) {
  const credentials = await request.json();

  const djangoRes = await fetch(`${DJANGO_API_URL}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });

  const data = await djangoRes.json().catch(() => ({}));

  if (!djangoRes.ok) {
    return NextResponse.json(
      { detail: data.detail || "Invalid email or password." },
      { status: djangoRes.status },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, data.access, authCookieOptions(15 * 60));
  response.cookies.set(
    REFRESH_COOKIE,
    data.refresh,
    authCookieOptions(7 * 24 * 60 * 60),
  );

  return response;
}
