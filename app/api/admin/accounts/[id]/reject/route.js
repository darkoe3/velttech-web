import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function POST(_request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/admin/accounts/${id}/reject/`, {
    method: "POST",
  });
}
