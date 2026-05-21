import { proxyDjangoRequest } from "@/lib/proxyDjango";

export async function POST(_request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/admin/accounts/${id}/approve/`, {
    method: "POST",
  });
}
