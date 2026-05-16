import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookies";
import { API_URL } from "@/lib/api";

const protectedPaths = [
  "/dashboard",
  "/my-courses",
  "/notifications",
  "/payments",
];

function isProtectedPath(pathname) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function getTokenPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  const payload = getTokenPayload(token);
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 > Date.now() + 30_000;
}

function clearAuthCookies(response) {
  response.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

function redirectToLogin(request) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return clearAuthCookies(NextResponse.redirect(loginUrl));
}

async function refreshAccessToken(request) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return null;
  }

  const res = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  if ((pathname === "/login" || pathname === "/signup") && accessToken && isTokenValid(accessToken)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (accessToken && isTokenValid(accessToken)) {
    return NextResponse.next();
  }

  const refreshed = await refreshAccessToken(request);

  if (!refreshed?.access) {
    return redirectToLogin(request);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-access-token", refreshed.access);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set(ACCESS_COOKIE, refreshed.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  if (refreshed.refresh) {
    response.cookies.set(REFRESH_COOKIE, refreshed.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  return response;
}

export const config = {
  matcher: ["/login", "/signup", "/dashboard/:path*", "/my-courses/:path*", "/notifications/:path*", "/payments/:path*"],
};
