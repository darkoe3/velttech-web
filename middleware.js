import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookies";
import { API_URL } from "@/lib/api";

const protectedPaths = [
  "/dashboard",
  "/assignments",
  "/change-password",
  "/my-attendance",
  "/my-children",
  "/my-certificates",
  "/my-courses",
  "/my-progress",
  "/notifications",
  "/payments",
  "/instructor",
  "/admin",
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

function defaultDashboardForRole(role) {
  if (role === "instructor") return "/instructor/dashboard";
  return "/dashboard";
}

function isRouteAllowedForRole(pathname, role) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return role === "admin";
  }
  if (pathname === "/instructor" || pathname.startsWith("/instructor/")) {
    return role === "instructor" || role === "admin";
  }
  if (pathname === "/my-children" || pathname.startsWith("/my-children/")) {
    return role === "parent" || role === "admin";
  }
  return true;
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
  const accessPayload = accessToken && isTokenValid(accessToken) ? getTokenPayload(accessToken) : null;

  if ((pathname === "/login" || pathname === "/signup") && accessPayload) {
    return NextResponse.redirect(new URL(defaultDashboardForRole(accessPayload.role), request.url));
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (accessPayload) {
    if (!isRouteAllowedForRole(pathname, accessPayload.role)) {
      return NextResponse.redirect(new URL(defaultDashboardForRole(accessPayload.role), request.url));
    }
    return NextResponse.next();
  }

  const refreshed = await refreshAccessToken(request);

  if (!refreshed?.access) {
    return redirectToLogin(request);
  }
  const refreshedPayload = getTokenPayload(refreshed.access);
  if (!isRouteAllowedForRole(pathname, refreshedPayload?.role)) {
    const redirect = NextResponse.redirect(
      new URL(defaultDashboardForRole(refreshedPayload?.role), request.url),
    );
    redirect.cookies.set(ACCESS_COOKIE, refreshed.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
    return redirect;
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
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/assignments/:path*",
    "/change-password/:path*",
    "/my-attendance/:path*",
    "/my-children/:path*",
    "/my-certificates/:path*",
    "/my-courses/:path*",
    "/my-progress/:path*",
    "/notifications/:path*",
    "/payments/:path*",
    "/instructor/:path*",
    "/admin/:path*",
  ],
};
