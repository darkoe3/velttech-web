import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

export async function djangoApiFetch(endpoint) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const accessToken =
    headerStore.get("x-access-token") || cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const res = await fetch(`${DJANGO_API_URL}/api/${endpoint}/`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    redirect("/login");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return res.json();
}

export async function getCurrentUser() {
  return djangoApiFetch("auth/me");
}
