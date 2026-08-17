"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
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

function draftFromResult(result) {
  return {
    practical_score: result.practical_score ?? "",
    final_project_score: result.final_project_score ?? "",
    objective_quiz_score: result.objective_quiz_score ?? "",
    final_project_feedback: result.final_project_feedback || "",
  };
}

function parseScore(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}

function validateScore(value, maxScore, labelText) {
  const parsed = parseScore(value);
  if (parsed === null) return "";
  if (parsed < 0) return `${labelText} cannot be negative.`;
  if (parsed > Number(maxScore)) return `${labelText} cannot exceed ${formatValue(maxScore)}.`;
  return "";
}

function statusClass(status) {
  if (status === "approved" || status === "certificate_issued") return "bg-emerald-50 text-emerald-700";
  if (status === "ready_for_review") return "bg-blue-50 text-blue-700";
  if (status === "below_pass_mark") return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function ScoreInput({ value, max, disabled, onChange, ariaLabel }) {
  return (
    <div className="flex items-center gap-2">
      <input
        aria-label={ariaLabel}
        type="number"
        min="0"
        max={max}
        step="0.01"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-20 rounded-lg border border-slate-300 px-2 text-sm disabled:bg-slate-100"
      />
      <span className="text-xs font-semibold text-slate-500">/ {formatValue(max)}</span>
    </div>
  );
}

function CertificateState({ result, eligibility, canReissue, onReissue, pending }) {
  const status = result.certificate_status || eligibility?.certificate_status || "";
  const certificateId = result.certificate_id || eligibility?.certificate_id;
  const certificateNumber = result.certificate_number || eligibility?.certificate_number;

  if (status === "revoked") {
    return (
      <div className="space-y-2">
        <p className="font-semibold text-rose-700">Revoked - Reissue</p>
        {canReissue && certificateId ? (
          <button type="button" onClick={onReissue} disabled={pending} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-60">
            Reissue
          </button>
        ) : null}
      </div>
    );
  }

  if (certificateNumber) {
    return (
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold text-dark">{certificateNumber}</p>
        {certificateId ? (
          <Link href={`/api/certificates/${certificateId}/download`} className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-dark">
            Download
          </Link>
        ) : null}
      </div>
    );
  }

  if (eligibility?.eligible) return <p className="font-semibold text-emerald-700">Eligible</p>;
  const reason = eligibility?.reasons?.[0] || "Checking eligibility";
  return <p className="text-xs font-semibold text-slate-600">{reason}</p>;
}

export default function CombinedResults({ courses = [], results = [], submissions = [], userRole = "instructor" }) {
  const router = useRouter();
  const [resultOverrides, setResultOverrides] = useState({});
  const [drafts, setDrafts] = useState({});
  const [eligibility, setEligibility] = useState({});
  const [messages, setMessages] = useState({});
  const [pending, setPending] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedFeedback, setExpandedFeedback] = useState({});

  const localResults = useMemo(
    () => results.map((result) => resultOverrides[result.id] || result),
    [results, resultOverrides],
  );

  const assignedCourses = useMemo(() => {
    const courseMap = new Map();
    courses.forEach((course) => {
      courseMap.set(String(course.id), course.title);
    });
    localResults.forEach((result) => {
      if (!courseMap.has(String(result.course_id))) {
        courseMap.set(String(result.course_id), result.course_title);
      }
    });
    return [...courseMap.entries()].map(([id, title]) => ({ id, title }));
  }, [courses, localResults]);

  const courseResults = useMemo(
    () => localResults.filter((result) => selectedCourse && String(result.course_id) === String(selectedCourse)),
    [localResults, selectedCourse],
  );

  const selectedCourseSummary = useMemo(() => {
    if (!selectedCourse) return null;
    const course = assignedCourses.find((item) => String(item.id) === String(selectedCourse));
    const passMark = courseResults.find((result) => result.pass_mark !== null && result.pass_mark !== undefined)?.pass_mark;
    return {
      title: course?.title || courseResults[0]?.course_title || "Selected course",
      learnerCount: courseResults.length,
      passMark,
    };
  }, [assignedCourses, courseResults, selectedCourse]);

  const visibleResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courseResults.filter((result) => {
      const matchesSearch = !query || result.student_name.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || result.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courseResults, search, statusFilter]);

  const visibleKey = visibleResults.map((result) => result.id).join(",");

  useEffect(() => {
    let mounted = true;
    if (!visibleResults.length) return undefined;
    Promise.all(
      visibleResults.map((result) =>
        requestJson(`/api/instructor/assessment-results/${result.id}/certificate-eligibility`)
          .then((data) => [result.id, data])
          .catch((err) => [result.id, { eligible: false, reasons: [err.message] }]),
      ),
    ).then((items) => {
      if (mounted) setEligibility((current) => ({ ...current, ...Object.fromEntries(items) }));
    });
    return () => {
      mounted = false;
    };
  }, [visibleKey, visibleResults]);

  function updateDraft(resultId, field, value) {
    setDrafts((current) => ({
      ...current,
      [resultId]: {
        ...(current[resultId] || {}),
        [field]: value,
      },
    }));
  }

  function replaceResult(updatedResult) {
    setResultOverrides((current) => ({ ...current, [updatedResult.id]: updatedResult }));
    setDrafts((current) => ({ ...current, [updatedResult.id]: draftFromResult(updatedResult) }));
  }

  function setRowMessage(resultId, message, tone = "slate") {
    setMessages((current) => ({ ...current, [resultId]: { message, tone } }));
  }

  async function saveScores(result) {
    const draft = drafts[result.id] || draftFromResult(result);
    const errors = [
      validateScore(draft.practical_score, result.practical_max_score, "Practical score"),
      validateScore(draft.final_project_score, result.final_project_max_score, "Final Project score"),
      validateScore(draft.objective_quiz_score, result.objective_quiz_max_score, "Objective Quiz score"),
    ].filter(Boolean);
    if (errors.length) {
      setRowMessage(result.id, errors.join(" "), "rose");
      return;
    }
    setPending(`save-${result.id}`);
    setMessages({});
    try {
      const updated = await requestJson(`/api/instructor/assessment-results/${result.id}`, "PATCH", {
        practical_score: parseScore(draft.practical_score),
        final_project_score: parseScore(draft.final_project_score),
        objective_quiz_score: parseScore(draft.objective_quiz_score),
        final_project_feedback: draft.final_project_feedback || "",
      });
      replaceResult(updated);
      setRowMessage(result.id, "Scores saved.", "emerald");
    } catch (err) {
      setRowMessage(result.id, err.message, "rose");
    } finally {
      setPending(null);
    }
  }

  async function importQuizScore(result, submissionId) {
    if (!submissionId) {
      setRowMessage(result.id, "Select a graded online quiz first.", "rose");
      return;
    }
    const payload = { submission_id: Number(submissionId) };
    if (result.objective_quiz_score !== null && result.objective_quiz_score !== undefined) {
      const replace = window.confirm(
        `An objective score of ${formatValue(result.objective_quiz_score)} / ${formatValue(result.objective_quiz_max_score)} has already been entered. Replace it with the imported quiz score?`,
      );
      if (!replace) return;
      payload.replace_existing = true;
    }
    setPending(`import-${result.id}`);
    setMessages({});
    try {
      const updated = await requestJson(`/api/instructor/assessment-results/${result.id}/import-quiz-score`, "POST", payload);
      replaceResult(updated);
      setRowMessage(result.id, "Objective quiz score imported.", "emerald");
    } catch (err) {
      setRowMessage(result.id, err.message, "rose");
    } finally {
      setPending(null);
    }
  }

  async function approve(result) {
    if (!window.confirm("Approve this learner's final result?")) return;
    setPending(`approve-${result.id}`);
    setMessages({});
    try {
      const updated = await requestJson(`/api/instructor/assessment-results/${result.id}/approve`, "POST");
      replaceResult(updated);
      setRowMessage(result.id, "Result approved.", "emerald");
    } catch (err) {
      setRowMessage(result.id, err.message, "rose");
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
      setRowMessage(result.id, `Certificate issued: ${certificate.certificate_number}`, "emerald");
      router.refresh();
    } catch (err) {
      setRowMessage(result.id, err.message, "rose");
    } finally {
      setPending(null);
    }
  }

  async function reissue(result) {
    const certificateId = result.certificate_id || eligibility[result.id]?.certificate_id;
    if (!certificateId) return;
    setPending(`reissue-${result.id}`);
    setMessages({});
    try {
      const certificate = await requestJson(`/api/certificates/${certificateId}/reissue`, "POST");
      setRowMessage(result.id, `Certificate reissued: ${certificate.certificate_number}`, "emerald");
      router.refresh();
    } catch (err) {
      setRowMessage(result.id, err.message, "rose");
    } finally {
      setPending(null);
    }
  }

  function quizChoices(result) {
    return submissions.filter(
      (submission) =>
        submission.status === "graded" &&
        submission.assignment_submission_type === "quiz" &&
        Number(submission.student) === Number(result.student_id) &&
        Number(submission.assignment_course) === Number(result.course_id) &&
        submission.score !== null,
    );
  }

  function canEdit(result) {
    return result.status !== "certificate_issued" && !result.is_approved;
  }

  function canApprove(result) {
    return result.is_complete && result.meets_pass_mark && !result.is_approved && result.status !== "certificate_issued";
  }

  function RowMessage({ resultId }) {
    const item = messages[resultId];
    if (!item?.message) return null;
    const color = item.tone === "rose" ? "text-rose-700" : item.tone === "emerald" ? "text-emerald-700" : "text-slate-600";
    return <p className={`mt-2 text-xs font-semibold ${color}`}>{item.message}</p>;
  }

  function ResultActions({ result }) {
    const rowEligibility = eligibility[result.id];
    const certificateStatus = result.certificate_status || rowEligibility?.certificate_status;
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => saveScores(result)}
          disabled={pending === `save-${result.id}` || !canEdit(result)}
          className="rounded-lg bg-dark px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {pending === `save-${result.id}` ? "Saving..." : "Save Scores"}
        </button>
        {canApprove(result) ? (
          <button type="button" onClick={() => approve(result)} disabled={pending === `approve-${result.id}`} className="rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
            {pending === `approve-${result.id}` ? "Approving..." : "Approve Result"}
          </button>
        ) : null}
        {rowEligibility?.eligible ? (
          <button type="button" onClick={() => issue(result)} disabled={pending === `issue-${result.id}`} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
            {pending === `issue-${result.id}` ? "Issuing..." : "Issue Certificate"}
          </button>
        ) : null}
        {certificateStatus === "revoked" && userRole === "admin" ? (
          <button type="button" onClick={() => reissue(result)} disabled={pending === `reissue-${result.id}`} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">
            {pending === `reissue-${result.id}` ? "Reissuing..." : "Reissue"}
          </button>
        ) : null}
      </div>
    );
  }

  if (!localResults.length) {
    return <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">No enrolled learners are ready for assessment results yet.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-[1.2fr_1fr_0.8fr]">
        <label className="text-sm font-semibold text-slate-700">
          <span className="mb-1 block">Select Course</span>
          <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Select a course</option>
            {assignedCourses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          <span className="mb-1 block">Search Learner</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          <span className="mb-1 block">Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="all">All</option>
            <option value="incomplete">Incomplete</option>
            <option value="ready_for_review">Ready for Review</option>
            <option value="approved">Approved</option>
            <option value="certificate_issued">Certificate Issued</option>
          </select>
        </label>
      </div>

      {!selectedCourse ? (
        <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">Select a course to view and enter learner assessment scores.</p>
      ) : null}

      {selectedCourseSummary ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="font-bold text-dark">{selectedCourseSummary.title}</p>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
            {selectedCourseSummary.learnerCount} {selectedCourseSummary.learnerCount === 1 ? "learner" : "learners"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
            Pass mark: {selectedCourseSummary.passMark === undefined ? "Not set" : `${formatValue(selectedCourseSummary.passMark)}%`}
          </span>
        </div>
      ) : null}

      {selectedCourse && courseResults.length === 0 ? (
        <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">No learners are currently assigned to this course.</p>
      ) : null}

      {selectedCourse && courseResults.length > 0 && visibleResults.length === 0 ? (
        <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-600">No learners match the selected filters.</p>
      ) : null}

      {selectedCourse && visibleResults.length > 0 ? (
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white lg:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Learner</th>
              <th className="px-3 py-3">Practical</th>
              <th className="px-3 py-3">Final Project</th>
              <th className="px-3 py-3">Objective</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">%</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Certificate</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleResults.map((result) => {
              const draft = drafts[result.id] || draftFromResult(result);
              const locked = !canEdit(result);
              const choices = quizChoices(result);
              return (
                <Fragment key={result.id}>
                  <tr key={result.id}>
                    <td className="px-3 py-3">
                      <p className="font-bold text-dark">{result.student_name}</p>
                      <p className="text-xs text-slate-500">{result.course_title}</p>
                    </td>
                    <td className="px-3 py-3">
                      <ScoreInput value={draft.practical_score} max={result.practical_max_score} disabled={locked} ariaLabel={`${result.student_name} practical score`} onChange={(value) => updateDraft(result.id, "practical_score", value)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        <ScoreInput value={draft.final_project_score} max={result.final_project_max_score} disabled={locked} ariaLabel={`${result.student_name} final project score`} onChange={(value) => updateDraft(result.id, "final_project_score", value)} />
                        <button type="button" onClick={() => setExpandedFeedback((current) => ({ ...current, [result.id]: !current[result.id] }))} className="text-xs font-bold text-slate-600">
                          Feedback
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        <ScoreInput value={draft.objective_quiz_score} max={result.objective_quiz_max_score} disabled={locked} ariaLabel={`${result.student_name} objective score`} onChange={(value) => updateDraft(result.id, "objective_quiz_score", value)} />
                        {choices.length ? (
                          <select disabled={locked || pending === `import-${result.id}`} onChange={(event) => importQuizScore(result, event.target.value)} defaultValue="" className="w-40 rounded-lg border border-slate-300 px-2 py-2 text-xs disabled:bg-slate-100">
                            <option value="">Import Quiz Score</option>
                            {choices.map((submission) => (
                              <option key={submission.id} value={submission.id}>
                                {submission.assignment_title} - {formatValue(submission.score)} / {formatValue(submission.max_score || submission.assignment_marks)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-xs font-semibold text-slate-500">No graded quiz</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-dark">{formatValue(result.overall_score)} / {formatValue(result.total_max_score)}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-dark">{formatValue(result.percentage)}%</p>
                      <p className="text-xs text-slate-500">Pass {formatValue(result.pass_mark)}%</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(result.status)}`}>{label(result.status)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <CertificateState result={result} eligibility={eligibility[result.id]} canReissue={userRole === "admin"} onReissue={() => reissue(result)} pending={pending === `reissue-${result.id}`} />
                    </td>
                    <td className="px-3 py-3">
                      <ResultActions result={result} />
                      <RowMessage resultId={result.id} />
                      {locked ? <p className="mt-2 text-xs font-semibold text-slate-500">Locked after approval or certificate issuance.</p> : null}
                    </td>
                  </tr>
                  {expandedFeedback[result.id] ? (
                    <tr key={`${result.id}-feedback`}>
                      <td className="bg-slate-50 px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Feedback</td>
                      <td colSpan={8} className="bg-slate-50 px-3 py-3">
                        <textarea
                          value={draft.final_project_feedback}
                          disabled={locked}
                          onChange={(event) => updateDraft(result.id, "final_project_feedback", event.target.value)}
                          placeholder="Final project feedback"
                          className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      ) : null}

      {selectedCourse && visibleResults.length > 0 ? (
      <div className="space-y-4 lg:hidden">
        {visibleResults.map((result) => {
          const draft = drafts[result.id] || draftFromResult(result);
          const locked = !canEdit(result);
          const choices = quizChoices(result);
          return (
            <article key={result.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-dark">{result.student_name}</h3>
                  <p className="text-sm text-slate-600">{result.course_title}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(result.status)}`}>{label(result.status)}</span>
              </div>
              <div className="mt-4 grid gap-3">
                <label className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                  Practical
                  <ScoreInput value={draft.practical_score} max={result.practical_max_score} disabled={locked} ariaLabel={`${result.student_name} practical score`} onChange={(value) => updateDraft(result.id, "practical_score", value)} />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                  Final Project
                  <ScoreInput value={draft.final_project_score} max={result.final_project_max_score} disabled={locked} ariaLabel={`${result.student_name} final project score`} onChange={(value) => updateDraft(result.id, "final_project_score", value)} />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                  Objective
                  <ScoreInput value={draft.objective_quiz_score} max={result.objective_quiz_max_score} disabled={locked} ariaLabel={`${result.student_name} objective score`} onChange={(value) => updateDraft(result.id, "objective_quiz_score", value)} />
                </label>
                {choices.length ? (
                  <select disabled={locked || pending === `import-${result.id}`} onChange={(event) => importQuizScore(result, event.target.value)} defaultValue="" className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100">
                    <option value="">Import Quiz Score</option>
                    {choices.map((submission) => (
                      <option key={submission.id} value={submission.id}>
                        {submission.assignment_title} - {formatValue(submission.score)} / {formatValue(submission.max_score || submission.assignment_marks)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-semibold text-slate-500">No graded online quiz</p>
                )}
                <textarea
                  value={draft.final_project_feedback}
                  disabled={locked}
                  onChange={(event) => updateDraft(result.id, "final_project_feedback", event.target.value)}
                  placeholder="Final project feedback"
                  className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="font-semibold text-slate-500">Total</dt>
                  <dd className="font-bold text-dark">{formatValue(result.overall_score)} / {formatValue(result.total_max_score)}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="font-semibold text-slate-500">Percentage</dt>
                  <dd className="font-bold text-dark">{formatValue(result.percentage)}%</dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="font-semibold text-slate-500">Pass Mark</dt>
                  <dd className="font-bold text-dark">{formatValue(result.pass_mark)}%</dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="font-semibold text-slate-500">Certificate</dt>
                  <dd><CertificateState result={result} eligibility={eligibility[result.id]} canReissue={userRole === "admin"} onReissue={() => reissue(result)} pending={pending === `reissue-${result.id}`} /></dd>
                </div>
              </dl>
              <div className="mt-4">
                <ResultActions result={result} />
                <RowMessage resultId={result.id} />
                {locked ? <p className="mt-2 text-xs font-semibold text-slate-500">Locked after approval or certificate issuance.</p> : null}
              </div>
            </article>
          );
        })}
      </div>
      ) : null}
    </div>
  );
}
