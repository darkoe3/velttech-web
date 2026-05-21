"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/contact" },
];

const studentAcademyLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Change Password", href: "/change-password" },
  { label: "Assignments", href: "/assignments" },
  { label: "My Courses", href: "/my-courses" },
  { label: "Attendance", href: "/my-attendance" },
  { label: "Progress", href: "/my-progress" },
  { label: "Payments", href: "/payments" },
  { label: "Notifications", href: "/notifications" },
];

const parentAcademyLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Change Password", href: "/change-password" },
  { label: "Children", href: "/my-children" },
  { label: "Assignments", href: "/assignments" },
  { label: "Payments", href: "/payments" },
  { label: "Progress", href: "/my-progress" },
  { label: "Notifications", href: "/notifications" },
];

const adminAcademyLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Change Password", href: "/change-password" },
  { label: "My Courses", href: "/my-courses" },
  { label: "Payments", href: "/payments" },
  { label: "Notifications", href: "/notifications" },
];

const instructorAcademyLinks = [
  { label: "Instructor Dashboard", href: "/instructor/dashboard" },
  { label: "Change Password", href: "/change-password" },
  { label: "My Courses", href: "/instructor/courses" },
  { label: "My Students", href: "/instructor/students" },
  { label: "Enrollments", href: "/instructor/enrollments" },
  { label: "Attendance", href: "/instructor/attendance" },
  { label: "Lesson Notes", href: "/instructor/lesson-notes" },
  { label: "Progress Reports", href: "/instructor/progress" },
  { label: "Assignments", href: "/instructor/assignments" },
  { label: "Submissions", href: "/instructor/submissions" },
  { label: "Notifications", href: "/instructor/notifications" },
];

const loggedOutAcademyLinks = [
  { label: "Login", href: "/login" },
  { label: "Sign Up", href: "/signup" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [academyOpen, setAcademyOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const academyLinks = user
    ? user.role === "instructor"
      ? instructorAcademyLinks
      : user.role === "parent"
        ? parentAcademyLinks
        : user.role === "student"
          ? studentAcademyLinks
          : adminAcademyLinks
    : loggedOutAcademyLinks;

  const isAcademyActive = academyLinks.some((link) => pathname === link.href);
  const linkClass = (href) =>
    `text-sm font-semibold transition ${
      pathname === href ? "text-dark" : "text-slate-700 hover:text-dark"
    }`;
  const academyLinkClass = (href) =>
    `block rounded-lg px-4 py-3 text-sm font-semibold transition ${
      pathname === href
        ? "bg-primary/25 text-dark"
        : "text-slate-700 hover:bg-slate-50 hover:text-dark"
    }`;

  useEffect(() => {
    let ignore = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore) {
          setUser(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setAcademyOpen(false);
    setIsOpen(false);
    setUser(null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-light/90 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center" aria-label="Velttech home">
          <Image
            src="/images/velttech-logo.png"
            alt="Velttech"
            width={180}
            height={90}
            priority
            className="h-14 w-auto object-contain sm:h-16"
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {primaryLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}

          <div
            className="group relative"
            onMouseEnter={() => setAcademyOpen(true)}
            onMouseLeave={() => setAcademyOpen(false)}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-1 text-sm font-semibold transition ${
                isAcademyActive ? "text-dark" : "text-slate-700 hover:text-dark"
              }`}
              aria-expanded={academyOpen}
              aria-haspopup="menu"
              onClick={() => setAcademyOpen((value) => !value)}
            >
              Academy
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`transition ${
                  academyOpen ? "rotate-180" : "group-hover:rotate-180"
                }`}
              />
            </button>

            <div
              className={`absolute left-1/2 top-full mt-4 w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg transition lg:group-focus-within:visible lg:group-focus-within:opacity-100 lg:group-hover:visible lg:group-hover:opacity-100 ${
                academyOpen ? "visible opacity-100" : "invisible opacity-0"
              }`}
              role="menu"
              aria-label="Academy"
            >
              {academyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={academyLinkClass(link.href)}
                  role="menuitem"
                  onClick={() => setAcademyOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  type="button"
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-dark"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>

          {primaryLinks.slice(3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/contact"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-dark transition hover:border-dark hover:bg-white"
          >
            Talk to us
          </Link>
          <Link
            href="/#services"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-dark shadow-sm shadow-primary/30 transition hover:bg-secondary"
          >
            Explore services
          </Link>
          {user ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-dark transition hover:border-dark hover:bg-white"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg border border-slate-300 text-dark transition hover:bg-white lg:hidden"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-200 bg-light lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 sm:px-6">
              {primaryLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-3 text-base font-semibold transition ${
                    pathname === link.href
                      ? "bg-white text-dark"
                      : "text-slate-700 hover:bg-white hover:text-dark"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-dark"
                  aria-controls="mobile-academy-menu"
                  aria-expanded={academyOpen}
                  onClick={() => setAcademyOpen((value) => !value)}
                >
                  Academy
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`transition ${academyOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {academyOpen && (
                    <motion.div
                      id="mobile-academy-menu"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 grid gap-1 border-t border-slate-100 pt-2">
                        {academyLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                              pathname === link.href
                                ? "bg-primary/25 text-dark"
                                : "text-slate-700 hover:bg-slate-50 hover:text-dark"
                            }`}
                            onClick={() => {
                              setAcademyOpen(false);
                              setIsOpen(false);
                            }}
                          >
                            {link.label}
                          </Link>
                        ))}
                        {user ? (
                          <button
                            type="button"
                            className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-dark"
                            onClick={handleLogout}
                          >
                            Logout
                          </button>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {primaryLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-3 text-base font-semibold transition ${
                    pathname === link.href
                      ? "bg-white text-dark"
                      : "text-slate-700 hover:bg-white hover:text-dark"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="mt-2 rounded-lg bg-dark px-4 py-3 text-center text-sm font-bold text-white"
                onClick={() => setIsOpen(false)}
              >
                Start a conversation
              </Link>
              {user ? (
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-bold text-dark transition hover:bg-white"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
