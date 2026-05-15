import { NextResponse } from "next/server";
const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";
export async function POST(request){const djangoRes=await fetch(`${DJANGO_API_URL}/api/auth/password-reset/request/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(await request.json()),cache:"no-store"});return NextResponse.json(await djangoRes.json().catch(()=>({})),{status:djangoRes.status});}
