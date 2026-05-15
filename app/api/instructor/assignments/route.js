import { proxyDjangoRequest } from "@/lib/django-proxy";
export async function GET(){return proxyDjangoRequest("/api/instructor/assignments/");}
export async function POST(request){return proxyDjangoRequest("/api/instructor/assignments/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(await request.json())});}
