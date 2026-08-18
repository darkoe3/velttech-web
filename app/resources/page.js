import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { djangoApiFetch, getCurrentUser } from "@/lib/django-api";

function resourceAction(resource) {
  if (resource.resource_type === "note") {
    return null;
  }
  const label = resource.resource_type === "video" ? "Watch Resource" : "Open Resource";
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 items-center rounded-lg bg-dark px-4 py-2 text-sm font-bold text-white"
    >
      {label}
    </a>
  );
}

export default async function ResourcesPage() {
  try {
    const [user, resources] = await Promise.all([
      getCurrentUser(),
      djangoApiFetch("my-resources"),
    ]);

    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <SectionHeading
          title="Learning Resources"
          description={user.role === "parent" ? "Resources shared for your linked children." : "Resources shared for your enrolled courses."}
        />
        {resources.length === 0 ? (
          <EmptyState>No learning resources have been published yet.</EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {resources.map((resource) => (
              <AcademyCard key={resource.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-dark">{resource.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{resource.course_title}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                    {humanize(resource.resource_type)}
                  </span>
                </div>
                {user.role === "parent" && resource.target_student_name ? (
                  <p className="mt-3 text-sm font-semibold text-slate-500">Learner: {resource.target_student_name}</p>
                ) : null}
                {resource.description ? (
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{resource.description}</p>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-500">Published: {formatDate(resource.published_at)}</p>
                  {resourceAction(resource)}
                </div>
              </AcademyCard>
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="We could not load learning resources." /></section>;
  }
}
