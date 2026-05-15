import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
export default function ResetPasswordPage(){return <section className="mx-auto max-w-xl px-5 py-10"><h1 className="text-3xl font-bold text-dark">Reset Password</h1><Suspense fallback={<p className="mt-6 text-sm text-slate-600">Loading reset form...</p>}><ResetPasswordForm/></Suspense></section>}
