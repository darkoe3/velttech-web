import { proxyDjangoRequest } from "@/lib/django-proxy";
export async function GET(request) {
  const url = new URL(request.url);
  return proxyDjangoRequest(`/api/instructor/assignments/${url.search}`);
}

export async function POST(request) {
  return proxyDjangoRequest("/api/instructor/assignments/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}
