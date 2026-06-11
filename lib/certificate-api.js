async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.ok && contentType.includes("application/pdf")) {
    return response.blob();
  }

  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text();

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.error ||
      data?.non_field_errors?.join(" ") ||
      "Certificate request failed.";
    throw new Error(message);
  }

  return data;
}

function query(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `?${queryString}` : "";
}

export const certificateApi = {
  listCertificates: (params = {}) =>
    fetch(`/api/certificates${query(params)}`, { cache: "no-store" }).then(parseResponse),

  getCertificate: (id) =>
    fetch(`/api/certificates/${id}`, { cache: "no-store" }).then(parseResponse),

  issueCertificate: (enrollmentId, completionDate) =>
    fetch("/api/certificates/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enrollment_id: enrollmentId,
        completion_date: completionDate,
      }),
    }).then(parseResponse),

  downloadCertificate: (id) =>
    fetch(`/api/certificates/${id}/download`, { cache: "no-store" }).then(parseResponse),

  revokeCertificate: (id, reason = "") =>
    fetch(`/api/certificates/${id}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }).then(parseResponse),

  verifyCertificate: (code) =>
    fetch(`/api/certificates/verify/${encodeURIComponent(code)}`, {
      cache: "no-store",
    }).then(parseResponse),

  getEligibleStudents: (courseId) =>
    fetch(`/api/certificates/eligible?course_id=${encodeURIComponent(courseId)}`, {
      cache: "no-store",
    }).then(parseResponse),
};
