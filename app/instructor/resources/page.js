import { ResourceActions, ResourceForm } from "@/components/resources/ResourceForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

const resourceTypeOptions = [
  ["", "All types"],
  ["document", "Document"],
  ["video", "Video"],
  ["website", "Website"],
  ["github", "GitHub"],
  ["note", "Note"],
  ["other", "Other"],
];

const statusOptions = [
  ["", "All statuses"],
  ["true", "Published"],
  ["false", "Draft"],
];

function buildResourcesPath(filters) {
  const query = new URLSearchParams();
  if (filters.course) query.set("course", filters.course);
  if (filters.resource_type) query.set("resource_type", filters.resource_type);
  if (filters.published) query.set("published", filters.published);
  return `/api/instructor/resources${query.toString() ? `?${query.toString()}` : ""}`;
}

export default async function InstructorResourcesPage({ searchParams }) {
  const params = await searchParams;
  const filters = {
    course: params?.course || "",
    resource_type: params?.resource_type || "",
    published: params?.published || "",
  };

  try {
    const [{ authorized }, courses, enrollments, resources] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/courses", "resources-page"),
      fetchInternalJson("/api/instructor/enrollments", "resources-page"),
      fetchInternalJson(buildResourcesPath(filters), "resources-page"),
    ]);
    if (!authorized) {
      return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <AcademyCard>
            <SectionHeading title="Add Resource" description="Share a link or plain note with a course group or selected learner." />
            <ResourceForm courses={courses} enrollments={enrollments} />
          </AcademyCard>

          <section>
            <SectionHeading title="Learning Resources" />
            <form className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
              <select name="course" defaultValue={filters.course} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">All courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <select name="resource_type" defaultValue={filters.resource_type} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {resourceTypeOptions.map(([value, label]) => (
                  <option key={label} value={value}>{label}</option>
                ))}
              </select>
              <select name="published" defaultValue={filters.published} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {statusOptions.map(([value, label]) => (
                  <option key={label} value={value}>{label}</option>
                ))}
              </select>
              <button className="rounded-lg bg-dark px-4 py-2 text-sm font-bold text-white">Apply Filters</button>
            </form>

            {resources.length === 0 ? (
              <EmptyState>No learning resources match these filters.</EmptyState>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Published</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.map((resource) => (
                      <tr key={resource.id}>
                        <td className="min-w-60 px-4 py-3">
                          <p className="font-bold text-dark">{resource.title}</p>
                          {resource.description ? <p className="mt-1 line-clamp-2 text-slate-600">{resource.description}</p> : null}
                        </td>
                        <td className="min-w-48 px-4 py-3 text-slate-700">{resource.course_title}</td>
                        <td className="px-4 py-3 text-slate-700">{humanize(resource.resource_type)}</td>
                        <td className="min-w-40 px-4 py-3 text-slate-700">{resource.target_label}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${resource.is_published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {resource.is_published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(resource.published_at)}</td>
                        <td className="min-w-72 px-4 py-3">
                          <ResourceActions resource={resource} courses={courses} enrollments={enrollments} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load learning resources."} /></section>;
  }
}
