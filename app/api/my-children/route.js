import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";
const DJANGO_MY_CHILDREN_URL = `${DJANGO_API_URL}/api/my-children/`;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}

function proxyResponse(body, djangoRes) {
  return new Response(body, {
    status: djangoRes.status,
    headers: {
      "Content-Type": djangoRes.headers.get("content-type") || "application/json",
    },
  });
}

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthenticated." }, { status: 401 });
  }

  const djangoRes = await fetch(DJANGO_MY_CHILDREN_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const body = await djangoRes.text();
  return proxyResponse(body, djangoRes);
}

export async function POST(request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthenticated." }, { status: 401 });
  }

  const payload = await request.json();
  const djangoRes = await fetch(DJANGO_MY_CHILDREN_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await djangoRes.text();
  return proxyResponse(body, djangoRes);
}
