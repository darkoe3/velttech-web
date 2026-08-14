import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { API_URL } from "@/lib/api";

export class DjangoApiError extends Error {
  constructor(endpoint, status, detail, body) {
    super(detail || `Failed to fetch ${endpoint}`);
    this.name = "DjangoApiError";
    this.endpoint = endpoint;
    this.status = status;
    this.detail = detail;
    this.body = body;
  }
}

export async function djangoApiFetch(endpoint) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const accessToken =
    headerStore.get("x-access-token") || cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const res = await fetch(`${API_URL}/api/${endpoint}/`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    redirect("/login");
  }

  const bodyText = await res.text();
  let body = bodyText;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }

  if (!res.ok) {
    const detail =
      typeof body === "string"
        ? body
        : body?.detail || body?.error || `Request failed with status ${res.status}`;
    console.error("[django-api] request failed", {
      endpoint,
      status: res.status,
      detail,
      body,
    });
    throw new DjangoApiError(endpoint, res.status, detail, body);
  }

  return body ?? [];
}

export async function getCurrentUser() {
  return djangoApiFetch("auth/me");
}
