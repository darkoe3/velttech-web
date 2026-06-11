import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { API_URL } from "@/lib/api";

export async function GET(_request, { params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  }

  const djangoRes = await fetch(`${API_URL}/api/certificates/${id}/download/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!djangoRes.ok) {
    const data = await djangoRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: djangoRes.status });
  }

  return new NextResponse(djangoRes.body, {
    status: djangoRes.status,
    headers: {
      "Content-Type": djangoRes.headers.get("content-type") || "application/pdf",
      "Content-Disposition": djangoRes.headers.get("content-disposition") || "attachment",
    },
  });
}
