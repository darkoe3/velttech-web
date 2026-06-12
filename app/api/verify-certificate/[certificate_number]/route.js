import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function GET(_request, { params }) {
  const { certificate_number: certificateNumber } = await params;
  const response = await fetch(
    `${API_URL}/api/certificates/verify/${encodeURIComponent(certificateNumber)}/`,
    { cache: "no-store" },
  );
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
