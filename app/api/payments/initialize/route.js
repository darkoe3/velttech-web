import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function POST(request) {
  const payload = await request.json();
  return proxyDjangoRequest("/api/payments/initialize/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
