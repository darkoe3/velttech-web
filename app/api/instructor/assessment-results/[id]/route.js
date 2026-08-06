import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function PATCH(request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/instructor/assessment-results/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}
