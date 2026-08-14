'use client';

import { useState, useEffect, useCallback } from 'react';
import { certificateApi } from '@/lib/certificate-api';
import { AlertCircle, Loader } from 'lucide-react';
import IssueCertificateForm from './IssueCertificateForm';

export default function EligibleStudentsList({ courseId, onCertificateIssued }) {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const applyEligibleStudentsResponse = useCallback((data) => {
    if (Array.isArray(data)) {
      setStudents(data);
      setSummary(null);
      return;
    }
    setStudents(data?.eligible_students || []);
    setSummary(data?.summary || null);
  }, []);

  useEffect(() => {
    const fetchEligibleStudents = async () => {
      try {
        setLoading(true);
        const data = await certificateApi.getEligibleStudents(courseId);
        applyEligibleStudentsResponse(data);
      } catch (err) {
        setError('Failed to load eligible students');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchEligibleStudents();
    }
  }, [courseId, applyEligibleStudentsResponse]);

  const handleRefresh = () => {
    setSelectedStudent(null);
    const fetchEligibleStudents = async () => {
      try {
        const data = await certificateApi.getEligibleStudents(courseId);
        applyEligibleStudentsResponse(data);
      } catch (err) {
        console.error('Failed to refresh');
      }
    };
    fetchEligibleStudents();
    if (onCertificateIssued) {
      onCertificateIssued();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {students.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded text-blue-700">
          <p className="text-center">
            No learners are currently eligible for certificates. A learner must have a completed enrollment, settled payments, a complete passing assessment result, and instructor/admin approval.
          </p>
          {summary?.blockers?.length ? (
            <div className="mt-4 rounded border border-blue-100 bg-white/70 p-3 text-sm text-blue-900">
              <p className="font-semibold">Current blockers</p>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {summary.blockers.map((blocker) => (
                  <li key={blocker.code} className="flex justify-between gap-3">
                    <span>{blocker.label}</span>
                    <span className="font-semibold">{blocker.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-bold mb-4">
            Eligible Students ({students.length})
          </h3>
          <div className="grid gap-4">
            {students.map((student) => (
              <div
                key={student.enrollment_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-gray-600">
                        Status: <span className="font-semibold">{student.status}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition whitespace-nowrap"
                  >
                    Issue Certificate
                  </button>
                </div>

                {selectedStudent?.enrollment_id === student.enrollment_id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <IssueCertificateForm
                      enrollmentId={student.enrollment_id}
                      courseId={courseId}
                      studentName={student.name}
                      onSuccess={handleRefresh}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
