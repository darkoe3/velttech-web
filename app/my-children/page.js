import Link from "next/link";
import { djangoApiFetch, getCurrentUser } from "@/lib/django-api";
import {
  AcademyCard,
  EmptyState,
  ErrorState,
  RoleBadge,
  SectionHeading,
} from "@/components/ui/academy";

export default async function MyChildrenPage() {
  let user;
  let children;

  try {
    [user, children] = await Promise.all([getCurrentUser(), djangoApiFetch("my-children")]);
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <ErrorState message="We could not load your children right now. Please try again shortly." />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <RoleBadge role={user.role} />
          <h1 className="mt-4 text-3xl font-bold text-dark">My Children</h1>
        </div>
        {user.role === "parent" ? (
          <Link
            href="/my-children/new"
            className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            Add Child
          </Link>
        ) : null}
      </div>

      <div className="mt-8">
        <SectionHeading
          title="Children"
          description="Child profiles linked to your parent account."
        />
        {children.length === 0 ? (
          <EmptyState>No children added yet.</EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {children.map((child) => (
              <AcademyCard key={child.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-dark">{child.full_name}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                    {child.approval_status}
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-sm font-semibold text-slate-500">Assigned courses</p>
                  {child.courses.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-600">
                      Awaiting admin course assignment.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {child.courses.map((course) => (
                        <span
                          key={course.id}
                          className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                        >
                          {course.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </AcademyCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
