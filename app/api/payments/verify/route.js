import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || "";
  return proxyDjangoRequest(`/api/payments/verify/?reference=${encodeURIComponent(reference)}`);
}
