import { proxyDjangoRequest } from "@/lib/django-proxy";
export async function POST(request,{params}){
  const {id}=await params;
  return proxyDjangoRequest(`/api/my-assignments/${id}/submit/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(await request.json())});
}
