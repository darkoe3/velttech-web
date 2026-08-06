import { proxyDjangoRequest } from "@/lib/django-proxy";

export async function POST(request, { params }) {
  const { id } = await params;
  return proxyDjangoRequest(`/api/instructor/assessment-results/${id}/import-quiz-score/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
}
