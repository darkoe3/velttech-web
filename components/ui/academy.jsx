import Link from "next/link";

export function AcademyCard({ children, className = "" }) {
  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </article>
  );
}

export function SummaryCard({ label, value, detail, icon: Icon }) {
  return (
    <AcademyCard>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        {Icon ? (
          <span className="rounded-lg bg-primary/20 p-2 text-dark">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-3xl font-bold text-dark">{value}</p>
      {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
    </AcademyCard>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
      {children}
    </div>
  );
}

export function SectionHeading({ title, description, actionHref, actionLabel }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-dark">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="text-sm font-bold text-secondary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function RoleBadge({ role }) {
  const label = role ? role[0].toUpperCase() + role.slice(1) : "User";

  return (
    <span className="inline-flex rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-dark">
      {label}
    </span>
  );
}

export function ErrorState({ title = "We could not load this page", message }) {
  return (
    <AcademyCard className="border-rose-200 bg-rose-50">
      <h2 className="text-lg font-bold text-rose-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-rose-700">
        {message || "Please refresh the page or try again in a moment."}
      </p>
    </AcademyCard>
  );
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(Number(value || 0));
}

export function formatDate(value, options = {}) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    ...options,
  }).format(new Date(value));
}

export function humanize(value) {
  return value
    ? value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase())
    : "Not provided";
}
