import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function GET(_request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/instructor/assessment-results/${id}/certificate-eligibility/`);
}
