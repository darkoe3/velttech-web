import { proxyDjangoRequest } from "@/lib/django-proxy";
export async function GET(){return proxyDjangoRequest("/api/instructor/lesson-notes/");}
export async function POST(request){return proxyDjangoRequest("/api/instructor/lesson-notes/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(await request.json())});}
