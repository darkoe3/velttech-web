import { headers } from "next/headers";

export async function fetchInternalJson(path, label = "instructor-page") {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "http";
  const cookie = headerStore.get("cookie") || "";

  const response = await fetch(`${protocol}://${host}${path}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : {},
  });
  const bodyText = await response.text();

  let body = bodyText;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }

  if (!response.ok) {
    console.error(`[${label}] ${path} failed with status ${response.status}.`);
    const detail =
      typeof body === "string"
        ? body
        : body?.detail || `Request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  return body ?? [];
}
