"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function formatMessage(body) {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body);
    return parsed.detail || JSON.stringify(parsed);
  } catch {
    return body;
  }
}

export default function PendingStudentActions({ studentId }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  async function submit(action) {
    setBusy(action);
    setMessage("");
    const response = await fetch(`/api/admin/students/${studentId}/${action}`, {
      method: "POST",
      credentials: "include",
    });
    const body = await response.text();
    if (!response.ok) {
      setMessage(formatMessage(body) || `Could not ${action} student.`);
      setBusy("");
      return;
    }
    setMessage(action === "approve" ? "Student approved and parent notified." : "Student rejected.");
    setBusy("");
    setTimeout(() => router.refresh(), 900);
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => submit("approve")}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy === "approve" ? "Approving..." : "Approve"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => submit("reject")}
          className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 disabled:opacity-60"
        >
          {busy === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>
      {message ? <p className={`mt-2 text-sm ${message.includes("Could not") ? "text-rose-700" : "text-emerald-700"}`}>{message}</p> : null}
    </div>
  );
}
