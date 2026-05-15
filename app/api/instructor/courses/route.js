import { proxyDjangoRequest } from "@/lib/django-proxy";
export async function GET() { return proxyDjangoRequest("/api/instructor/courses/"); }
