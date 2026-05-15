import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authCookieOptions,
  clearCookieOptions,
} from "@/lib/auth-cookies";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

export async function proxyDjangoRequest(path, options = {}) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

    console.log(`[django-proxy] ${path} access_token cookie exists:`, Boolean(accessToken));

    async function forward(token) {
      return fetch(`${DJANGO_API_URL}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
        cache: "no-store",
      });
    }

    async function refreshAccessToken() {
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${DJANGO_API_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      return response.ok && data.access ? data : null;
    }

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    let djangoRes = accessToken ? await forward(accessToken) : null;
    let refreshed = null;

    if (!djangoRes || djangoRes.status === 401) {
      refreshed = await refreshAccessToken();
      if (!refreshed?.access) {
        const response = NextResponse.json(
          { detail: "Authentication required" },
          { status: 401 },
        );
        response.cookies.set(ACCESS_COOKIE, "", clearCookieOptions());
        response.cookies.set(REFRESH_COOKIE, "", clearCookieOptions());
        return response;
      }
      djangoRes = await forward(refreshed.access);
    }

    const body = await djangoRes.text();

    console.log(`[django-proxy] ${path} status:`, djangoRes.status);
    console.log(`[django-proxy] ${path} body:`, body);

    const response = new NextResponse(body, {
      status: djangoRes.status,
      headers: {
        "Content-Type": djangoRes.headers.get("content-type") || "application/json",
      },
    });

    if (refreshed?.access) {
      response.cookies.set(ACCESS_COOKIE, refreshed.access, authCookieOptions(15 * 60));
    }

    if (refreshed?.refresh) {
      response.cookies.set(
        REFRESH_COOKIE,
        refreshed.refresh,
        authCookieOptions(7 * 24 * 60 * 60),
      );
    }

    return response;
  } catch (error) {
    console.error(`[django-proxy] ${path} failed:`, error);
    return NextResponse.json(
      { detail: "Unable to reach the backend service." },
      { status: 502 },
    );
  }
}
