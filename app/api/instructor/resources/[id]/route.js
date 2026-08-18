import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function GET(_request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/instructor/resources/${id}/`);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/instructor/resources/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/instructor/resources/${id}/`, {
    method: "DELETE",
  });
}
