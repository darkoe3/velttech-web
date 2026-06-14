'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { certificateApi } from '@/lib/certificate-api';
import { courseApi } from '@/lib/course-api';
import { AlertCircle, Download, Loader, Search } from 'lucide-react';
import CertificatesList from '@/components/certificates/CertificatesList';
import EligibleStudentsList from '@/components/certificates/EligibleStudentsList';

function humanize(value) {
  return value ? value.replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase()) : 'Not recorded';
}

export default function AdminCertificatesPage() {
  const [activeTab, setActiveTab] = useState('issued');
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [filters, setFilters] = useState({ search: '', course_id: '', certificate_type: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch certificates
        let certsData = [];
        try {
          certsData = await certificateApi.listCertificates();
        } catch (err) {
          console.error('Failed to load certificates:', err);
          setError('Failed to load certificates');
        }
        
        // Fetch courses
        let coursesData = [];
        try {
          coursesData = await courseApi.listCourses();
        } catch (err) {
          console.error('Failed to load courses:', err);
          setError(prev => prev ? prev : 'Failed to load courses');
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
      const data = await certificateApi.listCertificates();
      setCertificates(data);
    } catch (err) {
      console.error('Failed to refresh');
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const search = filters.search.trim().toLowerCase();
    const matchesSearch = !search || [
      cert.certificate_number,
      cert.student_name,
      cert.course_title,
    ].some((value) => value?.toLowerCase().includes(search));
    const matchesCourse = !filters.course_id || String(cert.course) === filters.course_id;
    const matchesType = !filters.certificate_type || cert.certificate_type === filters.certificate_type;
    const matchesStatus = !filters.status || cert.status === filters.status;
    return matchesSearch && matchesCourse && matchesType && matchesStatus;
  });

  const handleExport = async () => {
    try {
      const rows = filteredCertificates.map((cert) => ({
        'Certificate Number': cert.certificate_number,
        'Student Name': cert.student_name,
        Programme: cert.programme_name || 'Young Innovators Academy',
        Specialization: cert.specialization_title || cert.course_title,
        'Certificate Type': cert.certificate_type ? humanize(cert.certificate_type) : '',
        'Issue Date': cert.issue_date || cert.issued_at || '',
        Status: cert.status === 'active' || cert.status === 'issued' ? 'Active' : humanize(cert.status),
      }));
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [
        { wch: 22 },
        { wch: 28 },
        { wch: 28 },
        { wch: 32 },
        { wch: 18 },
        { wch: 16 },
        { wch: 14 },
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');
      XLSX.writeFile(workbook, 'certificates.xlsx');
    } catch (err) {
      setError('Failed to export certificates');
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
            Manage and issue certificates to learners
          </p>
          <Link
            href="/admin/activity-logs"
            className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            View certificate logs
          </Link>
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
                <div className="mb-5 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                  <label className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      value={filters.search}
                      onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
                      placeholder="Search certificates"
                      className="w-full rounded border border-gray-300 py-2 pl-9 pr-3"
                    />
                  </label>
                  <select
                    value={filters.course_id}
                    onChange={(e) => setFilters((current) => ({ ...current, course_id: e.target.value }))}
                    className="rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="">All courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                  <select
                    value={filters.certificate_type}
                    onChange={(e) => setFilters((current) => ({ ...current, certificate_type: e.target.value }))}
                    className="rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="">All types</option>
                    <option value="participation">Participation</option>
                    <option value="completion">Completion</option>
                    <option value="excellence">Excellence</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}
                    className="rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center justify-center gap-2 rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
                <CertificatesList
                  certificates={filteredCertificates}
                  onRefresh={handleRefresh}
                  canRevoke={true}
                  canReissue={true}
                />
              </div>
            )}

            {activeTab === 'issue' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Issue New Certificate</h2>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Course
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
