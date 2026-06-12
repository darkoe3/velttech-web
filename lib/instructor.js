import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { djangoApiFetch } from "@/lib/django-api";

export async function requireInstructor() {
  const user = await fetchInternalJson("/api/auth/me", "require-instructor");
  if (!["instructor", "admin"].includes(user.role)) {
    return { user, authorized: false };
  }
  return { user, authorized: true };
}

export async function instructorApiFetch(endpoint) {
  return djangoApiFetch(`instructor/${endpoint}`);
}

export const instructorApi = {
  getCourses: () => fetch("/api/instructor/courses", { cache: "no-store" }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.detail || "Instructor courses request failed.");
    }
    return data;
  }),
};
