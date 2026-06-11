import { proxyDjangoRequest } from "@/lib/django-proxy";
export async function POST(request,{params}){
  const {id}=await params;
  const contentType=request.headers.get("content-type")||"";
  if(contentType.includes("multipart/form-data")){
    return proxyDjangoRequest(`/api/my-assignments/${id}/submit/`,{method:"POST",body:await request.formData()});
  }
  return proxyDjangoRequest(`/api/my-assignments/${id}/submit/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(await request.json())});
}
