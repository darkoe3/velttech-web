import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function POST(_request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/certificates/${id}/reissue/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}
