import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearCookieOptions } from "@/lib/auth-cookies";
import { API_URL } from "@/lib/api";

export async function POST(request) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${API_URL}/api/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: "no-store",
    }).catch(() => null);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, "", clearCookieOptions());
  response.cookies.set(REFRESH_COOKIE, "", clearCookieOptions());

  return response;
}
