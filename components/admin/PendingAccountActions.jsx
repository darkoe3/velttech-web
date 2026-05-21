"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function formatMessage(body) {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body);
    return parsed.message || parsed.detail || JSON.stringify(parsed);
  } catch {
    return body;
  }
}

export default function PendingAccountActions({ accountId }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function submit(action) {
    setBusy(action);
    setMessage("");
    const response = await fetch(`/api/admin/accounts/${accountId}/${action}`, {
      method: "POST",
      credentials: "include",
    });
    const body = await response.text();
    if (!response.ok) {
      setMessage(formatMessage(body) || `Could not ${action} account.`);
      setBusy("");
      return;
    }
    setMessage(formatMessage(body));
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
      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
