'use client';

import { useState, useEffect } from 'react';
import { certificateApi } from '@/lib/certificate-api';
import { AlertCircle, Loader } from 'lucide-react';
import CertificatesList from '@/components/certificates/CertificatesList';
import EligibleStudentsList from '@/components/certificates/EligibleStudentsList';

export default function InstructorCertificatesPage() {
  const [activeTab, setActiveTab] = useState('issued');
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch certificates
        let certsData = [];
        try {
          certsData = await certificateApi.listCertificates({ status: 'issued' });
        } catch (err) {
          console.error('Failed to load certificates:', err);
          setError('Failed to load certificates');
        }
        
        // Fetch instructor courses
        let coursesData = [];
        try {
          const response = await fetch('/api/instructor/courses', { cache: 'no-store' });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.detail || 'Failed to load instructor courses');
          }
          coursesData = data;
        } catch (err) {
          console.error('Failed to load instructor courses:', err);
          setError(prev => prev ? prev : 'Failed to load instructor courses');
        }
        
        setCertificates(certsData);
        setCourses(coursesData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      const data = await certificateApi.listCertificates({ status: 'issued' });
      setCertificates(data);
    } catch (err) {
      console.error('Failed to refresh');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Certificate Management
          </h1>
          <p className="text-gray-600">
            Manage and issue certificates to your learners
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('issued')}
                className={`px-6 py-4 font-semibold border-b-2 transition ${
                  activeTab === 'issued'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Issued Certificates
              </button>
              <button
                onClick={() => setActiveTab('issue')}
                className={`px-6 py-4 font-semibold border-b-2 transition ${
                  activeTab === 'issue'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Issue New Certificate
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'issued' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Issued Certificates</h2>
                <CertificatesList
                  certificates={certificates}
                  onRefresh={handleRefresh}
                  canRevoke={false}
                />
              </div>
            )}

            {activeTab === 'issue' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Issue New Certificate</h2>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Your Course
                  </label>
                  <select
                    value={selectedCourseId || ''}
                    onChange={(e) => setSelectedCourseId(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select a course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCourseId && (
                  <EligibleStudentsList
                    courseId={selectedCourseId}
                    onCertificateIssued={handleRefresh}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
