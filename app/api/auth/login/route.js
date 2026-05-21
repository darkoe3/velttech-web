import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, authCookieOptions } from "@/lib/auth-cookies";
import { API_URL } from "@/lib/api";

function tokenPayload(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

export async function POST(request) {
  const credentials = await request.json();

  const djangoRes = await fetch(`${API_URL}/api/auth/login/`, {
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

  const payload = tokenPayload(data.access);
  const response = NextResponse.json({
    ok: true,
    user: {
      role: payload.role,
      account_type: payload.account_type,
    },
  });
  response.cookies.set(ACCESS_COOKIE, data.access, authCookieOptions(15 * 60));
  response.cookies.set(
    REFRESH_COOKIE,
    data.refresh,
    authCookieOptions(7 * 24 * 60 * 60),
  );

  return response;
}
