import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function POST(request) {
  const payload = await request.json();

  const registerRes = await fetch(`${API_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const registerData = await registerRes.json().catch(() => ({}));
  if (!registerRes.ok) {
    return NextResponse.json(registerData, { status: registerRes.status });
  }

  return NextResponse.json(
    {
      ok: true,
      pending_approval: true,
      detail: "Your account has been submitted successfully and is awaiting admin approval.",
    },
    { status: 201 },
  );
}
