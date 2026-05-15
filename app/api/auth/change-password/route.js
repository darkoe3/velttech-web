import { proxyDjangoRequest } from "@/lib/django-proxy";
export async function POST(request){return proxyDjangoRequest("/api/auth/change-password/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(await request.json())});}
