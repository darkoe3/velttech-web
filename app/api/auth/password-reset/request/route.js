import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
export async function POST(request){const djangoRes=await fetch(`${API_URL}/api/auth/password-reset/request/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(await request.json()),cache:"no-store"});return NextResponse.json(await djangoRes.json().catch(()=>({})),{status:djangoRes.status});}
