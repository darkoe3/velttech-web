'use client';

import { useState } from 'react';
import { certificateApi } from '@/lib/certificate-api';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function IssueCertificateForm({ enrollmentId, courseId, studentName, onSuccess }) {
  const [completionDate, setCompletionDate] = useState('');
  const [certificateType, setCertificateType] = useState('');
  const [finalScore, setFinalScore] = useState('');
  const [finalGrade, setFinalGrade] = useState('');
  const [attendancePercentage, setAttendancePercentage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!completionDate) {
      setError('Please select a completion date');
      return;
    }

    try {
      setLoading(true);
      await certificateApi.issueCertificate(enrollmentId, completionDate, {
        ...(certificateType ? { certificate_type: certificateType } : {}),
        ...(finalScore ? { final_score: finalScore } : {}),
        ...(finalGrade ? { final_grade: finalGrade } : {}),
        ...(attendancePercentage ? { attendance_percentage: attendancePercentage } : {}),
      });
      setSuccess(true);
      setCompletionDate('');
      setCertificateType('');
      setFinalScore('');
      setFinalGrade('');
      setAttendancePercentage('');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to issue certificate. Please ensure the student meets all requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Issue Certificate</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-start">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">Certificate issued successfully!</p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Student: {studentName}
        </label>
      </div>

      <div className="mb-4">
        <label htmlFor="completion_date" className="block text-sm font-semibold text-gray-700 mb-2">
          Completion Date *
        </label>
        <input
          type="date"
          id="completion_date"
          value={completionDate}
          onChange={(e) => setCompletionDate(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="certificate_type" className="block text-sm font-semibold text-gray-700 mb-2">
            Certificate Type
          </label>
          <select
            id="certificate_type"
            value={certificateType}
            onChange={(e) => setCertificateType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Auto select</option>
            <option value="participation">Participation</option>
            <option value="completion">Completion</option>
            <option value="excellence">Excellence</option>
          </select>
        </div>
        <div>
          <label htmlFor="final_grade" className="block text-sm font-semibold text-gray-700 mb-2">
            Final Grade
          </label>
          <input
            id="final_grade"
            value={finalGrade}
            onChange={(e) => setFinalGrade(e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="Auto"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="final_score" className="block text-sm font-semibold text-gray-700 mb-2">
            Final Score
          </label>
          <input
            type="number"
            id="final_score"
            min="0"
            max="100"
            step="0.01"
            value={finalScore}
            onChange={(e) => setFinalScore(e.target.value)}
            placeholder="Auto"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="attendance_percentage" className="block text-sm font-semibold text-gray-700 mb-2">
            Attendance Percentage
          </label>
          <input
            type="number"
            id="attendance_percentage"
            min="0"
            max="100"
            step="0.01"
            value={attendancePercentage}
            onChange={(e) => setAttendancePercentage(e.target.value)}
            placeholder="Auto"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded mb-4 text-sm text-blue-700">
        <p className="font-semibold mb-2">Requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Enrollment must be marked as completed</li>
          <li>Student must be approved</li>
          <li>All payments must be settled</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? 'Issuing Certificate...' : 'Issue Certificate'}
      </button>
    </form>
  );
}
