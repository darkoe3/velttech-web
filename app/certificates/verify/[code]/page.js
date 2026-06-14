'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { certificateApi } from '@/lib/certificate-api';
import { AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

function formatDate(value) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isActive(status) {
  return status === 'active' || status === 'issued';
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyCert = async () => {
      try {
        const data = await certificateApi.verifyCertificate(params.code);
        setCertificate(data);
      } catch (err) {
        setError('Certificate not found or invalid verification code.');
      } finally {
        setLoading(false);
      }
    };

    verifyCert();
  }, [params.code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-white text-lg">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
            <div className="flex items-start">
              <XCircle className="w-6 h-6 text-red-500 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-bold text-red-800 mb-2">
                  Certificate Not Found
                </h2>
                <p className="text-red-700 mb-4">{error}</p>
                <p className="text-sm text-red-600">
                  Please check the verification code and try again.
                </p>
              </div>
            </div>
          </div>
        ) : certificate ? (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-orange-500 px-8 py-6">
              <div className="flex items-center justify-center">
                {isActive(certificate.status) ? (
                  <CheckCircle className="w-8 h-8 text-white mr-3" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-200 mr-3" />
                )}
                <h1 className="text-3xl font-bold text-white">
                  {isActive(certificate.status) ? '✓ VERIFIED CERTIFICATE' : '✕ CERTIFICATE REVOKED'}
                </h1>
              </div>
            </div>

            <div className="px-8 py-8">
              {certificate.status === 'revoked' && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <p className="text-red-800 font-semibold">
                    This certificate has been revoked and is no longer valid.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issued by
                  </label>
                  <p className="text-lg text-gray-900 font-medium">
                    {certificate.issued_by_name || 'Velttech Academy'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Certificate Number
                  </label>
                  <p className="text-lg text-gray-900 font-mono">
                    {certificate.certificate_number}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient
                  </label>
                  <p className="text-lg text-gray-900 font-medium">
                    {certificate.student_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Programme
                  </label>
                  <p className="text-lg text-gray-900 font-medium">
                    {certificate.programme_name || 'Young Innovators Academy'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Specialization
                  </label>
                  <p className="text-lg text-gray-900 font-medium">
                    {certificate.specialization_title || certificate.course_title}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <p className="text-lg text-gray-900 font-medium">
                    {formatDate(certificate.issue_date || certificate.issued_at)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <span
                    className={`inline-block px-4 py-2 rounded-full font-semibold text-white ${
                      isActive(certificate.status) ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {isActive(certificate.status) ? 'VALID' : 'REVOKED'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-center text-gray-600 mb-4">
                  Issued by <span className="font-semibold">Velttech Academy</span>
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
