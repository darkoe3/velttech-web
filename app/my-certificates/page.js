'use client';

import { useState, useEffect } from 'react';
import { certificateApi } from '@/lib/certificate-api';
import { AlertCircle, Loader, Download, Share2 } from 'lucide-react';

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const data = await certificateApi.listCertificates();
        setCertificates(data);
      } catch (err) {
        setError('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = async (id, certificateNumber) => {
    try {
      setDownloading(id);
      const blob = await certificateApi.downloadCertificate(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  const handleShare = (certificateNumber) => {
    const verificationUrl = `https://portal.velttech.org/verify/${certificateNumber}/`;
    navigator.clipboard.writeText(verificationUrl);
    alert('Verification link copied to clipboard!');
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Certificates
          </h1>
          <p className="text-gray-600">
            View and download your Young Innovators Academy certificates
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {certificates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-600">
              Once you complete a specialization, your certificate will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="bg-gradient-to-r from-blue-600 to-orange-500 h-2" />

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {cert.programme_name || 'Young Innovators Academy'}
                      </h3>
                      <p className="mb-4 text-sm font-semibold text-gray-600">
                        Specialization: {cert.specialization_title || cert.course_title}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Certificate Number</p>
                          <p className="text-lg font-mono font-semibold text-gray-900">
                            {cert.certificate_number}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Issued Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(cert.issued_at).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Completion Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(cert.completion_date).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${
                              cert.status === 'active' || cert.status === 'issued'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          >
                            {cert.status === 'active' || cert.status === 'issued' ? 'Valid' : 'Revoked'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex gap-3">
                    <button
                      onClick={() =>
                        handleDownload(cert.id, cert.certificate_number)
                      }
                      disabled={downloading === cert.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      <Download className="w-5 h-5" />
                      {downloading === cert.id ? 'Downloading...' : 'Download PDF'}
                    </button>

                    <button
                      onClick={() => handleShare(cert.certificate_number)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold py-3 px-4 rounded hover:bg-gray-700 transition"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
