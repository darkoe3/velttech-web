import { djangoApiFetch, getCurrentUser } from "@/lib/django-api";
import { ErrorState, SectionHeading } from "@/components/ui/academy";
import EnrollmentForm from "@/components/admin/EnrollmentForm";

export default async function NewAdminEnrollmentPage({ searchParams }) {
  try {
    const params = await searchParams;
    const [user, children, courses, dashboard] = await Promise.all([
      getCurrentUser(),
      djangoApiFetch("my-children"),
      djangoApiFetch("courses"),
      djangoApiFetch("dashboard"),
    ]);
    if (user.role !== "admin") {
      return <section className="mx-auto max-w-4xl px-5 py-10"><ErrorState message="Admin access is required." /></section>;
    }
    const approvedStudents = children.filter(
      (child) => child.approval_status === "approved",
    );

    return (
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <SectionHeading title="Assign Course and Instructor" description="Create an enrollment for an approved student." />
        <EnrollmentForm
          students={approvedStudents}
          courses={courses}
          instructors={dashboard.instructors || []}
          initialStudentId={params.student || ""}
        />
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return <section className="mx-auto max-w-4xl px-5 py-10"><ErrorState message="We could not load enrollment options." /></section>;
  }
}
