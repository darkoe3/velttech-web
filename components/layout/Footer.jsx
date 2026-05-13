import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "@/lib/data";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="Velttech home">
            <Image
              src="/images/velttech-logo.png"
              alt="Velttech"
              width={170}
              height={85}
              className="h-16 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
            Building digital confidence through coding education, workforce training,
            analytics, software delivery, and practical IT guidance.
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:items-end">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Velttech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
