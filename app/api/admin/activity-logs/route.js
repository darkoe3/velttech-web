import { proxyDjangoRequest } from "@/lib/django-proxy";
export async function GET(request){const url=new URL(request.url);return proxyDjangoRequest(`/api/admin/activity-logs/${url.search}`);}
