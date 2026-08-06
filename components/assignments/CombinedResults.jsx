"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "Not set";
  return Number(value).toFixed(2).replace(/\.00$/, "");
}

function label(value) {
  return value ? value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase()) : "Not set";
}

function errorText(body) {
  if (!body) return "Request failed.";
  if (typeof body === "string") return body;
  if (body.detail) return Array.isArray(body.detail) ? body.detail.join(" ") : body.detail;
  if (body.reasons) return body.reasons.join(" ");
  return Object.values(body).flat().join(" ") || "Request failed.";
}

async function requestJson(path, method = "GET", payload) {
  const response = await fetch(path, {
    method,
    headers: payload === undefined ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    body: payload === undefined ? undefined : JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(errorText(body));
  return body;
}

function ScoreForm({ result, type }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const locked = result.status === "certificate_issued" || result.is_approved;
  const isPractical = type === "practical";
  const scoreName = isPractical ? "practical_score" : "final_project_score";
  const maxScore = isPractical ? result.practical_max_score : result.final_project_max_score;

  async function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const score = Number(form.get(scoreName));
    if (score < 0) {
      setError("Score cannot be negative.");
      return;
    }
    if (score > Number(maxScore)) {
      setError("Score cannot exceed maximum.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const payload = { [scoreName]: score };
      if (!isPractical) payload.final_project_feedback = form.get("final_project_feedback") || "";
      await requestJson(`/api/instructor/assessment-results/${result.id}`, "PATCH", payload);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="font-bold text-dark">{result.student_name}</p>
        <p className="text-sm text-slate-600">{result.course_title}</p>
      </div>
      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-[0.5fr_0.5fr_auto]">
        <input
          name={scoreName}
          type="number"
          min="0"
          max={maxScore}
          step="0.01"
          disabled={locked}
          defaultValue={result[scoreName] ?? ""}
          placeholder={`0-${formatValue(maxScore)}`}
          className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
        />
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          Max {formatValue(maxScore)}
        </div>
        <button disabled={pending || locked} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {!isPractical ? (
        <textarea
          name="final_project_feedback"
          disabled={locked}
          defaultValue={result.final_project_feedback || ""}
          placeholder="Concise feedback"
          className="min-h-20 w-full rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
        />
      ) : null}
      {locked ? <p className="text-xs font-semibold text-slate-500">Locked after approval or certificate issuance.</p> : null}
    </form>
  );
}

function QuizImport({ result, submissions }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const choices = submissions.filter(
    (submission) =>
      submission.status === "graded" &&
      submission.assignment_submission_type === "quiz" &&
      Number(submission.student) === Number(result.student_id) &&
      Number(submission.assignment_course) === Number(result.course_id) &&
      submission.score !== null,
  );
  const locked = result.status === "certificate_issued" || result.is_approved;

  async function importScore() {
    if (!submissionId) {
      setError("Select a graded objective quiz.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await requestJson(`/api/instructor/assessment-results/${result.id}/import-quiz-score`, "POST", {
        submission_id: Number(submissionId),
      });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="font-bold text-dark">{result.student_name}</p>
      <p className="text-sm text-slate-600">{result.course_title}</p>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        Current objective score: {formatValue(result.objective_quiz_score)} / {formatValue(result.objective_quiz_max_score)}
      </p>
      {error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {choices.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
          <select
            value={submissionId}
            onChange={(event) => setSubmissionId(event.target.value)}
            disabled={locked}
            className="rounded-lg border border-slate-300 px-4 py-3 disabled:bg-slate-100"
          >
            <option value="">Select graded objective quiz</option>
            {choices.map((submission) => (
              <option key={submission.id} value={submission.id}>
                {submission.assignment_title} - {formatValue(submission.score)} / {formatValue(submission.max_score || submission.assignment_marks)}
              </option>
            ))}
          </select>
          <button type="button" onClick={importScore} disabled={pending || locked} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            {pending ? "Importing..." : "Import Quiz Score"}
          </button>
        </div>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          No graded objective quiz is available for this learner.
        </p>
      )}
    </div>
  );
}

export default function CombinedResults({ results = [], submissions = [] }) {
  const router = useRouter();
  const [eligibility, setEligibility] = useState({});
  const [messages, setMessages] = useState({});
  const [pending, setPending] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all(
      results.map((result) =>
        requestJson(`/api/instructor/assessment-results/${result.id}/certificate-eligibility`)
          .then((data) => [result.id, data])
          .catch((err) => [result.id, { eligible: false, reasons: [err.message] }]),
      ),
    ).then((items) => {
      if (mounted) setEligibility(Object.fromEntries(items));
    });
    return () => {
      mounted = false;
    };
  }, [results]);

  const incompleteObjectiveResults = useMemo(
    () => results.filter((result) => result.objective_quiz_score === null || result.objective_quiz_score === undefined),
    [results],
  );

  async function approve(result) {
    if (!window.confirm("Approve this learner's final result?\nAfter approval, score changes may require administrative review.")) return;
    setPending(`approve-${result.id}`);
    setMessages({});
    try {
      await requestJson(`/api/instructor/assessment-results/${result.id}/approve`, "POST");
      router.refresh();
    } catch (err) {
      setMessages({ [result.id]: err.message });
    } finally {
      setPending(null);
    }
  }

  async function issue(result) {
    setPending(`issue-${result.id}`);
    setMessages({});
    try {
      const certificate = await requestJson("/api/certificates/issue", "POST", {
        enrollment_id: result.enrollment_id,
        assessment_result_id: result.id,
        completion_date: new Date().toISOString().slice(0, 10),
      });
      setMessages({ [result.id]: `Certificate issued: ${certificate.certificate_number}` });
      router.refresh();
    } catch (err) {
      setMessages({ [result.id]: err.message });
    } finally {
      setPending(null);
    }
  }

  if (!results.length) {
    return <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">No enrolled learners are ready for combined results yet.</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-dark">Objective Quizzes</h2>
        <div className="mt-4 grid gap-4">
          {(incompleteObjectiveResults.length ? incompleteObjectiveResults : results).map((result) => (
            <QuizImport key={result.id} result={result} submissions={submissions} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-dark">Practical Scores</h2>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {results.map((result) => <ScoreForm key={result.id} result={result} type="practical" />)}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-dark">Final Project Scores</h2>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {results.map((result) => <ScoreForm key={result.id} result={result} type="final_project" />)}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-dark">Combined Results</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Practical</th>
                <th className="px-4 py-3">Final Project</th>
                <th className="px-4 py-3">Objective Quiz</th>
                <th className="px-4 py-3">Overall</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((result) => {
                const rowEligibility = eligibility[result.id];
                const canApprove = result.is_complete && result.meets_pass_mark && !result.is_approved && result.status !== "certificate_issued";
                const canIssue = rowEligibility?.eligible === true;
                return (
                  <tr key={result.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-dark">{result.student_name}</td>
                    <td className="px-4 py-3 text-slate-600">{result.course_title}</td>
                    <td className="px-4 py-3">{formatValue(result.practical_score)} / {formatValue(result.practical_max_score)}</td>
                    <td className="px-4 py-3">{formatValue(result.final_project_score)} / {formatValue(result.final_project_max_score)}</td>
                    <td className="px-4 py-3">{formatValue(result.objective_quiz_score)} / {formatValue(result.objective_quiz_max_score)}</td>
                    <td className="px-4 py-3">{formatValue(result.overall_score)}</td>
                    <td className="px-4 py-3">{formatValue(result.percentage)}%</td>
                    <td className="px-4 py-3">{label(result.status)}</td>
                    <td className="px-4 py-3">
                      {result.certificate_number ? (
                        <span>{result.certificate_number}</span>
                      ) : rowEligibility?.eligible ? (
                        "Eligible"
                      ) : (
                        <div>
                          <p>Not eligible</p>
                          {(rowEligibility?.reasons || []).map((reason) => (
                            <p key={reason} className="text-xs text-slate-500">- {reason}</p>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="min-w-48 px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {canApprove ? (
                          <button onClick={() => approve(result)} disabled={pending === `approve-${result.id}`} className="rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                            Approve Result
                          </button>
                        ) : null}
                        {canIssue ? (
                          <button onClick={() => issue(result)} disabled={pending === `issue-${result.id}`} className="rounded-lg bg-dark px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                            Issue Certificate
                          </button>
                        ) : null}
                      </div>
                      {messages[result.id] ? <p className="mt-2 text-xs font-semibold text-slate-600">{messages[result.id]}</p> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
