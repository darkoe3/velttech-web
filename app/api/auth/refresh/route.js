import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authCookieOptions,
  clearCookieOptions,
} from "@/lib/auth-cookies";
import { API_URL } from "@/lib/api";

export async function POST(request) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ detail: "Refresh token missing." }, { status: 401 });
  }

  const djangoRes = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  const data = await djangoRes.json().catch(() => ({}));

  if (!djangoRes.ok) {
    const response = NextResponse.json(
      { detail: data.detail || "Session expired." },
      { status: djangoRes.status },
    );
    response.cookies.set(ACCESS_COOKIE, "", clearCookieOptions());
    response.cookies.set(REFRESH_COOKIE, "", clearCookieOptions());
    return response;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, data.access, authCookieOptions(15 * 60));

  if (data.refresh) {
    response.cookies.set(
      REFRESH_COOKIE,
      data.refresh,
      authCookieOptions(7 * 24 * 60 * 60),
    );
  }

  return response;
}
