"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const studentPortalLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Courses", href: "/my-courses" },
  { label: "Assessments", href: "/assignments" },
  { label: "Payments", href: "/payments" },
  { label: "Certificates", href: "/my-certificates" },
  { label: "Notifications", href: "/notifications" },
];

const parentPortalLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Children", href: "/my-children" },
  { label: "Payments", href: "/payments" },
  { label: "Assignments", href: "/assignments" },
  { label: "Certificates", href: "/my-certificates" },
  { label: "Notifications", href: "/notifications" },
];

const adminPortalLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Students", href: "/students" },
  { label: "Courses", href: "/courses" },
  { label: "Payments", href: "/payments" },
  { label: "Assessments", href: "/assignments" },
  { label: "Certificates", href: "/admin/certificates" },
  { label: "Activity Logs", href: "/admin/activity-logs" },
];

const instructorPortalLinks = [
  { label: "Dashboard", href: "/instructor/dashboard" },
  { label: "Courses", href: "/instructor/courses" },
  { label: "Assessments", href: "/instructor/assignments" },
  { label: "Submissions", href: "/instructor/submissions" },
  { label: "Students", href: "/instructor/students" },
  { label: "Certificates", href: "/instructor/certificates" },
  { label: "Notifications", href: "/instructor/notifications" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const portalLinks = user
    ? user.role === "instructor"
      ? instructorPortalLinks
      : user.role === "parent"
        ? parentPortalLinks
        : user.role === "student"
          ? studentPortalLinks
          : adminPortalLinks
    : [];
  const navLinks = user ? portalLinks : primaryLinks;

  const isActive = (href) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const desktopLinkClass = (href) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition ${
      isActive(href)
        ? "bg-primary/25 text-dark"
        : "text-slate-700 hover:bg-white hover:text-dark"
    }`;
  const mobileLinkClass = (href) =>
    `rounded-lg px-4 py-3 text-base font-bold transition ${
      isActive(href)
        ? "bg-primary/25 text-dark"
        : "text-slate-700 hover:bg-white hover:text-dark"
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

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={desktopLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
          {!user ? (
            <>
              <Link href="/login" className={desktopLinkClass("/login")}>
                Login
              </Link>
              <Link href="/signup" className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-bold text-dark shadow-sm shadow-primary/30 transition hover:bg-secondary">
                Signup
              </Link>
            </>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <button
              type="button"
              className="whitespace-nowrap rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={mobileLinkClass(link.href)}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!user ? (
                <div className="mt-2 grid gap-2 border-t border-slate-200 pt-4">
                  <Link
                    href="/login"
                    className={mobileLinkClass("/login")}
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-primary px-4 py-3 text-center text-base font-bold text-dark"
                    onClick={() => setIsOpen(false)}
                  >
                    Signup
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  className="mt-2 rounded-lg border border-rose-200 px-4 py-3 text-center text-base font-bold text-rose-700 transition hover:bg-rose-50"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
