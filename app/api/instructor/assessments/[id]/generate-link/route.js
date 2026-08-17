import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function POST(_request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/instructor/assessments/${id}/generate-link/`, {
    method: "POST",
  });
}
