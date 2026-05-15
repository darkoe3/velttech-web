import { fetchInternalJson } from "@/lib/instructor-page-fetch";

export async function requireInstructor() {
  const user = await fetchInternalJson("/api/auth/me", "require-instructor");
  if (user.role !== "instructor") {
    return { user, authorized: false };
  }
  return { user, authorized: true };
}

export async function instructorApiFetch(endpoint) {
  return djangoApiFetch(`instructor/${endpoint}`);
}
