async function parseJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || data?.error || "Course request failed.");
  }
  return data;
}

export const courseApi = {
  listCourses: () => fetch("/api/courses", { cache: "no-store" }).then(parseJson),
};
