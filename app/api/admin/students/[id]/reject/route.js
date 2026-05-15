import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function POST(request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/admin/students/${id}/reject/`, {
    method: "POST",
  });
}
