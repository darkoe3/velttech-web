import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authCookieOptions,
  clearCookieOptions,
} from "@/lib/auth-cookies";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

async function fetchCurrentUser(accessToken) {
  return fetch(`${DJANGO_API_URL}/api/auth/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
}

async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${DJANGO_API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function authenticationRequiredResponse() {
  const response = NextResponse.json(
    { detail: "Authentication required" },
    { status: 401 },
  );
  response.cookies.set(ACCESS_COOKIE, "", clearCookieOptions());
  response.cookies.set(REFRESH_COOKIE, "", clearCookieOptions());
  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  console.log("[auth-me] access_token cookie exists:", Boolean(accessToken));

  if (accessToken) {
    const djangoRes = await fetchCurrentUser(accessToken);
    const responseText = await djangoRes.clone().text();

    console.log("[auth-me] /api/auth/me/ status:", djangoRes.status);
    console.log("[auth-me] /api/auth/me/ body:", responseText);

    if (djangoRes.ok) {
      const data = await djangoRes.json().catch(() => ({}));
      return NextResponse.json(data, { status: djangoRes.status });
    }

    if (djangoRes.status !== 401) {
      const data = await djangoRes.json().catch(() => ({}));
      return NextResponse.json(data, { status: djangoRes.status });
    }
  }

  if (!refreshToken) {
    return authenticationRequiredResponse();
  }

  const { response: refreshRes, data: refreshData } = await refreshAccessToken(refreshToken);

  console.log("[auth-me] /api/auth/refresh/ status:", refreshRes.status);
  console.log("[auth-me] /api/auth/refresh/ body:", JSON.stringify(refreshData));

  if (!refreshRes.ok || !refreshData.access) {
    return authenticationRequiredResponse();
  }

  const retryRes = await fetchCurrentUser(refreshData.access);
  const retryData = await retryRes.json().catch(() => ({}));

  console.log("[auth-me] retry /api/auth/me/ status:", retryRes.status);
  console.log("[auth-me] retry /api/auth/me/ body:", JSON.stringify(retryData));

  if (!retryRes.ok) {
    return authenticationRequiredResponse();
  }

  const response = NextResponse.json(retryData, { status: retryRes.status });
  response.cookies.set(ACCESS_COOKIE, refreshData.access, authCookieOptions(15 * 60));

  if (refreshData.refresh) {
    response.cookies.set(
      REFRESH_COOKIE,
      refreshData.refresh,
      authCookieOptions(7 * 24 * 60 * 60),
    );
  }

  return response;
}
