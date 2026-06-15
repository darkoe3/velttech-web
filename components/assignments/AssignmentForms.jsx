"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const emptyQuestion = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  marks: 1,
};

function ErrorMessage({ error }) {
  return error ? (
    <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {error}
    </p>
  ) : null;
}

async function requestJson(path, method, payload) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail =
      typeof body === "string"
        ? body
        : body?.detail || Object.values(body || {}).flat().join(" ") || "Request failed.";
    throw new Error(detail);
  }
  return body;
}

function assessmentTypeLabel(value) {
  return value === "practical" ? "Practical assessment" : "Quiz assessment";
}

function resultLabel(result, fallbackMarks) {
  const score = result.grade ?? result.score ?? "Not set";
  const marks = result.max_score || fallbackMarks || 100;
  const percentage = result.percentage ?? null;
  const letterGrade = result.letter_grade || "";
  const summary = `${score} / ${marks}`;
  if (percentage === null && !letterGrade) return summary;
  return `${summary} (${letterGrade || "-"} - ${percentage ?? 0}%)`;
}

function studentStatus(assignment, submission, started = false) {
  if (submission?.status === "graded") return "Graded";
  if (submission?.status === "submitted") return "Submitted";
  if (submission?.status === "returned") return "Returned";
  if (started) return "In Progress";
  return "Not Started";
}

function normalizeQuestions(questions = []) {
  return questions.length ? questions.map((question) => ({ ...emptyQuestion, ...question })) : [{ ...emptyQuestion }];
}

function QuestionEditor({ questions, setQuestions }) {
  function updateQuestion(index, field, value) {
    setQuestions((items) =>
      items.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: field === "marks" ? Number(value) : value } : question,
      ),
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-bold text-dark">Question {index + 1}</h4>
            {questions.length > 1 ? (
              <button
                type="button"
                onClick={() => setQuestions((items) => items.filter((_, questionIndex) => questionIndex !== index))}
                className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700"
              >
                Delete
              </button>
            ) : null}
          </div>
          <textarea
            required
            value={question.question_text}
            onChange={(event) => updateQuestion(index, "question_text", event.target.value)}
            placeholder="Question text"
            className="mt-3 min-h-20 w-full rounded-lg border border-slate-300 px-4 py-3"
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {["a", "b", "c", "d"].map((option) => (
              <input
                key={option}
                required
                value={question[`option_${option}`]}
                onChange={(event) => updateQuestion(index, `option_${option}`, event.target.value)}
                placeholder={`Option ${option.toUpperCase()}`}
                className="rounded-lg border border-slate-300 px-4 py-3"
              />
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              required
              value={question.correct_answer}
              onChange={(event) => updateQuestion(index, "correct_answer", event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="A">Correct answer: A</option>
              <option value="B">Correct answer: B</option>
              <option value="C">Correct answer: C</option>
              <option value="D">Correct answer: D</option>
            </select>
            <input
              required
              type="number"
              min="1"
              max="100"
              value={question.marks}
              onChange={(event) => updateQuestion(index, "marks", event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setQuestions((items) => [...items, { ...emptyQuestion }])}
        className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-dark"
      >
        Add Question
      </button>
    </div>
  );
}

export function AssignmentForm({ courses, enrollments = [], instructors = [], allowInstructorSelect = false }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assessmentType, setAssessmentType] = useState("quiz");
  const [questions, setQuestions] = useState([{ ...emptyQuestion }]);

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const targetStudent = form.get("target_student");
    const marks = form.get("marks");
    setPending(true);
    setError("");
    try {
      const payload = {
        course: Number(form.get("course")),
        title: form.get("title"),
        description: form.get("description"),
        due_date: form.get("due_date"),
        submission_type: assessmentType,
        target_student: targetStudent ? Number(targetStudent) : null,
        marks: marks ? Number(marks) : null,
        is_active: true,
        questions: assessmentType === "quiz" ? questions : [],
      };
      if (allowInstructorSelect && form.get("instructor")) {
        payload.instructor = Number(form.get("instructor"));
      }
      await requestJson("/api/instructor/assignments", "POST", payload);
      formElement.reset();
      setSelectedCourse("");
      setAssessmentType("quiz");
      setQuestions([{ ...emptyQuestion }]);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage error={error} />
      {allowInstructorSelect ? (
        <select name="instructor" required className="w-full rounded-lg border border-slate-300 px-4 py-3">
          <option value="">Select instructor</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {[instructor.first_name, instructor.last_name].filter(Boolean).join(" ") || instructor.email}
            </option>
          ))}
        </select>
      ) : null}
      <select name="course" required value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3">
        <option value="">Select course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>
      <select name="target_student" className="w-full rounded-lg border border-slate-300 px-4 py-3">
        <option value="">Group assessment</option>
        {enrollments
          .filter((item) => !selectedCourse || String(item.course) === selectedCourse)
          .map((item) => (
            <option key={`${item.id}-${item.student}`} value={item.student}>
              {item.student_name || item.student_detail?.full_name || "Student"} - {item.course_title || item.course_detail?.title || "Course"}
            </option>
          ))}
      </select>
      <input name="title" required placeholder="Assessment title" className="w-full rounded-lg border border-slate-300 px-4 py-3" />
      <textarea name="description" required placeholder="Instructions" className="min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3" />
      <div className="grid gap-4 sm:grid-cols-3">
        <input name="due_date" type="date" required className="rounded-lg border border-slate-300 px-4 py-3" />
        <select value={assessmentType} onChange={(event) => setAssessmentType(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-3">
          <option value="quiz">Quiz assessment</option>
          <option value="practical">Practical assessment</option>
        </select>
        <input name="marks" type="number" min="1" max="100" placeholder="Max score" className="rounded-lg border border-slate-300 px-4 py-3" />
      </div>
      {assessmentType === "quiz" ? <QuestionEditor questions={questions} setQuestions={setQuestions} /> : null}
      <button disabled={pending} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Publishing..." : "Create Assessment"}
      </button>
    </form>
  );
}

export function InstructorAssignmentActions({ assignment, courses, enrollments = [], allowInstructorSelect = false, instructors = [] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(String(assignment.course || ""));
  const [assessmentType, setAssessmentType] = useState(assignment.submission_type || "quiz");
  const [questions, setQuestions] = useState(normalizeQuestions(assignment.questions));

  async function handleUpdate(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const targetStudent = form.get("target_student");
    const marks = form.get("marks");
    setPending(true);
    setError("");
    try {
      await requestJson(`/api/instructor/assignments/${assignment.id}`, "PATCH", {
        course: Number(form.get("course")),
        title: form.get("title"),
        description: form.get("description"),
        due_date: form.get("due_date"),
        submission_type: assessmentType,
        target_student: targetStudent ? Number(targetStudent) : null,
        marks: marks ? Number(marks) : null,
        questions: assessmentType === "quiz" ? questions : [],
        is_active: true,
        ...(allowInstructorSelect && form.get("instructor") ? { instructor: Number(form.get("instructor")) } : {}),
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this assessment? Existing results will also be removed if the backend cascades them.")) return;
    setPending(true);
    setError("");
    try {
      await requestJson(`/api/instructor/assignments/${assignment.id}`, "DELETE");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5">
      <ErrorMessage error={error} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/instructor/submissions?assignment=${assignment.id}`} className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-dark">
          View
        </Link>
        <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-10 items-center rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white">
          Edit
        </button>
        <button type="button" onClick={handleDelete} disabled={pending} className="inline-flex min-h-10 items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          Delete
        </button>
      </div>
      {editing ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-8">
          <form onSubmit={handleUpdate} className="w-full max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-dark">Edit Assessment</h3>
                <p className="mt-1 text-sm text-slate-600">Update quiz questions or practical grading settings.</p>
              </div>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-dark">Cancel</button>
            </div>
            <ErrorMessage error={error} />
            {allowInstructorSelect ? (
              <select name="instructor" defaultValue={assignment.instructor || ""} required className="w-full rounded-lg border border-slate-300 px-4 py-3">
                <option value="">Select instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>{[instructor.first_name, instructor.last_name].filter(Boolean).join(" ") || instructor.email}</option>
                ))}
              </select>
            ) : null}
            <select name="course" required value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3">
              <option value="">Select course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
            <select name="target_student" defaultValue={assignment.target_student || ""} className="w-full rounded-lg border border-slate-300 px-4 py-3">
              <option value="">Group assessment</option>
              {enrollments.filter((item) => !selectedCourse || String(item.course) === selectedCourse).map((item) => (
                <option key={`${item.id}-${item.student}`} value={item.student}>{item.student_name || item.student_detail?.full_name || "Student"} - {item.course_title || item.course_detail?.title || "Course"}</option>
              ))}
            </select>
            <input name="title" required defaultValue={assignment.title} placeholder="Assessment title" className="w-full rounded-lg border border-slate-300 px-4 py-3" />
            <textarea name="description" required defaultValue={assignment.description} placeholder="Instructions" className="min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3" />
            <div className="grid gap-4 sm:grid-cols-3">
              <input name="due_date" type="date" required defaultValue={assignment.due_date} className="rounded-lg border border-slate-300 px-4 py-3" />
              <select value={assessmentType} onChange={(event) => setAssessmentType(event.target.value)} className="rounded-lg border border-slate-300 px-4 py-3">
                <option value="quiz">Quiz assessment</option>
                <option value="practical">Practical assessment</option>
              </select>
              <input name="marks" type="number" min="1" max="100" defaultValue={assignment.marks ?? ""} placeholder="Max score" className="rounded-lg border border-slate-300 px-4 py-3" />
            </div>
            {assessmentType === "quiz" ? <QuestionEditor questions={questions} setQuestions={setQuestions} /> : null}
            <div className="flex flex-wrap gap-3">
              <button disabled={pending} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{pending ? "Saving..." : "Save Changes"}</button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-dark">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function SubmissionForm({ assignment, existingSubmission }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [started, setStarted] = useState(Boolean(existingSubmission?.quiz_answers && Object.keys(existingSubmission.quiz_answers).length));
  const [answers, setAnswers] = useState(existingSubmission?.quiz_answers || {});
  const isPractical = assignment.submission_type === "practical";
  const locked = existingSubmission?.status === "graded";
  const questions = assignment.questions || [];
  const status = studentStatus(assignment, existingSubmission, started);

  async function handleSubmit(event) {
    event.preventDefault();
    if (questions.length === 0) {
      setError("This quiz has no questions yet. Please contact your instructor.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await requestJson(`/api/my-assignments/${assignment.id}/submit`, "POST", { answers });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (isPractical) {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Assessment Status</p>
            <p className="mt-1 font-bold text-dark">{status}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
            Practical assessment
          </span>
        </div>
        <p className="mt-4 font-semibold text-dark">This practical assessment will be graded directly by your instructor.</p>
        <p className="mt-2">No answer box or file upload is required in the portal.</p>
        {existingSubmission?.status === "graded" ? (
          <div className="mt-4 rounded-lg bg-white p-4">
            <p className="font-semibold">Score: {resultLabel(existingSubmission, assignment.marks)}</p>
            <p className="mt-2 text-slate-500">Graded date: {existingSubmission.graded_at ? new Date(existingSubmission.graded_at).toLocaleDateString("en-GH", { dateStyle: "medium" }) : "Not set"}</p>
            <p className="mt-2">{existingSubmission.feedback || "No feedback yet."}</p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <ErrorMessage error={error} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Assessment Status</p>
          <p className="mt-1 font-bold text-dark">{status}</p>
        </div>
        {!locked && !started ? (
          <button type="button" onClick={() => setStarted(true)} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white">
            {questions.length ? "Start Assessment" : "View Assessment"}
          </button>
        ) : null}
      </div>

      {questions.length === 0 ? (
        <p className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-amber-700">
          This quiz has no questions yet. Please contact your instructor.
        </p>
      ) : null}

      {started || locked ? (
        <>
          {questions.map((question, index) => (
            <fieldset key={question.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <legend className="font-bold text-dark">Question {index + 1}</legend>
              <p className="mt-2 text-sm text-slate-700">{question.question_text}</p>
              <div className="mt-3 grid gap-2">
                {[
                  ["A", question.option_a],
                  ["B", question.option_b],
                  ["C", question.option_c],
                  ["D", question.option_d],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={value}
                      checked={answers[String(question.id)] === value}
                      disabled={locked}
                      required
                      onChange={() => setAnswers((current) => ({ ...current, [String(question.id)]: value }))}
                    />
                    <span>{value}. {label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {!locked ? (
            <div className="flex flex-wrap gap-3">
              <button disabled={pending || questions.length === 0} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                {pending ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700">
          Select Start Assessment to answer the quiz questions.
        </p>
      )}

      {!locked && started && questions.length ? (
        <div className="flex flex-wrap justify-between gap-3 text-sm text-slate-600">
          <span>{Object.keys(answers).length} of {questions.length} answered</span>
          <button type="button" onClick={() => setStarted(false)} className="font-bold text-slate-700">
            Hide Questions
          </button>
        </div>
      ) : null}

      {existingSubmission?.status === "graded" ? (
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Score: {resultLabel(existingSubmission, assignment.marks)}</p>
          <p className="mt-2 text-emerald-700">Graded date: {existingSubmission.graded_at ? new Date(existingSubmission.graded_at).toLocaleDateString("en-GH", { dateStyle: "medium" }) : "Not set"}</p>
          <p className="mt-2">{existingSubmission.feedback || "Quiz submitted."}</p>
        </div>
      ) : null}
      {existingSubmission?.status === "returned" ? (
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Returned for revision</p>
          <p className="mt-2">{existingSubmission.feedback || "Please review and resubmit."}</p>
        </div>
      ) : null}
      {existingSubmission?.status === "submitted" ? (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Submitted. Awaiting grading.
        </p>
      ) : null}
    </form>
  );
}

export function PracticalGradeForm({ assignment, enrollments = [] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pendingStudent, setPendingStudent] = useState(null);
  const students = enrollments.filter(
    (item) => String(item.course) === String(assignment.course) && (!assignment.target_student || Number(item.student) === Number(assignment.target_student)),
  );

  async function handleSubmit(event, studentId) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPendingStudent(studentId);
    setError("");
    try {
      await requestJson(`/api/instructor/assignments/${assignment.id}/grade-practical`, "POST", {
        student_id: studentId,
        score: Number(form.get("score")),
        feedback: form.get("feedback"),
      });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingStudent(null);
    }
  }

  if (assignment.submission_type !== "practical") return null;

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-bold text-dark">Grade Practical Assessment</h3>
      <p className="mt-1 text-sm text-slate-600">Enter marks and feedback for enrolled students.</p>
      <ErrorMessage error={error} />
      <div className="mt-4 space-y-3">
        {students.map((item) => (
          <form key={item.student} onSubmit={(event) => handleSubmit(event, item.student)} className="rounded-lg bg-white p-4">
            <p className="font-semibold text-dark">{item.student_name || item.student_detail?.full_name || "Student"}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[0.35fr_1fr_auto]">
              <input name="score" type="number" min="0" max={assignment.marks || 100} required placeholder={`0-${assignment.marks || 100}`} className="rounded-lg border border-slate-300 px-4 py-3" />
              <input name="feedback" placeholder="Feedback" className="rounded-lg border border-slate-300 px-4 py-3" />
              <button disabled={pendingStudent === item.student} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                {pendingStudent === item.student ? "Saving..." : "Save Grade"}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

export function GradeForm({ submission }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const maxScore = submission.max_score || submission.assignment_marks || 100;

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await requestJson(`/api/instructor/submissions/${submission.id}/grade`, "PATCH", {
        grade: Number(form.get("grade")),
        max_score: Number(form.get("max_score")),
        feedback: form.get("feedback"),
        status: form.get("status"),
      });
      setSuccess("Grade saved successfully.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <ErrorMessage error={error} />
      {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
      <input name="grade" type="number" min="0" max={maxScore} required defaultValue={submission.grade ?? submission.score ?? ""} placeholder="Grade" className="w-full rounded-lg border border-slate-300 px-4 py-3" />
      <input name="max_score" type="hidden" value={maxScore} />
      <textarea name="feedback" required defaultValue={submission.feedback || ""} placeholder="Feedback" className="min-h-24 w-full rounded-lg border border-slate-300 px-4 py-3" />
      <select name="status" defaultValue={submission.status === "returned" ? "returned" : "graded"} className="w-full rounded-lg border border-slate-300 px-4 py-3">
        <option value="graded">Graded</option>
        <option value="returned">Returned</option>
      </select>
      <button disabled={pending} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Saving..." : "Save Grade"}
      </button>
    </form>
  );
}
