import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, authCookieOptions } from "@/lib/auth-cookies";
import { API_URL } from "@/lib/api";

export async function POST(request) {
  const payload = await request.json();

  const registerRes = await fetch(`${API_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const registerData = await registerRes.json().catch(() => ({}));
  if (!registerRes.ok) {
    return NextResponse.json(registerData, { status: registerRes.status });
  }

  const loginRes = await fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
    cache: "no-store",
  });

  const loginData = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const response = NextResponse.json({ ok: true }, { status: 201 });
  response.cookies.set(ACCESS_COOKIE, loginData.access, authCookieOptions(15 * 60));
  response.cookies.set(REFRESH_COOKIE, loginData.refresh, authCookieOptions(7 * 24 * 60 * 60));
  return response;
}
