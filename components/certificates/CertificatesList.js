'use client';

import { useState } from 'react';
import { certificateApi } from '@/lib/certificate-api';
import { Download, RefreshCcw, Trash2 } from 'lucide-react';

function humanize(value) {
  return value ? value.replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase()) : 'Not recorded';
}

function isActive(status) {
  return status === 'active' || status === 'issued';
}

export default function CertificatesList({ certificates, onRefresh, canRevoke = false, canReissue = false }) {
  const [downloading, setDownloading] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [reissuing, setReissuing] = useState(null);
  const [error, setError] = useState(null);

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
      setError('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) {
      return;
    }

    try {
      setRevoking(id);
      await certificateApi.revokeCertificate(id);
      onRefresh();
    } catch (err) {
      setError('Failed to revoke certificate');
    } finally {
      setRevoking(null);
    }
  };

  const handleReissue = async (id) => {
    try {
      setReissuing(id);
      await certificateApi.reissueCertificate(id);
      onRefresh();
    } catch (err) {
      setError('Failed to reissue certificate');
    } finally {
      setReissuing(null);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No certificates found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Certificate Number
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Student
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Programme
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Specialization
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Type
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Issued Date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                    {cert.certificate_number}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cert.student_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cert.programme_name || 'Young Innovators Academy'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cert.specialization_title || cert.course_title}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {humanize(cert.certificate_type)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(cert.issue_date || cert.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        isActive(cert.status)
                          ? 'bg-green-100 text-green-800'
                          : cert.status === 'revoked'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {isActive(cert.status)
                        ? 'Valid'
                        : cert.status === 'revoked'
                          ? 'Revoked'
                          : 'Draft'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          handleDownload(cert.id, cert.certificate_number)
                        }
                        disabled={downloading === cert.id}
                        className="p-2 hover:bg-blue-100 rounded disabled:opacity-50"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                      </button>
                      {canRevoke && isActive(cert.status) && (
                        <button
                          onClick={() => handleRevoke(cert.id)}
                          disabled={revoking === cert.id}
                          className="p-2 hover:bg-red-100 rounded disabled:opacity-50"
                          title="Revoke"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                      {canReissue && cert.status === 'revoked' && (
                        <button
                          onClick={() => handleReissue(cert.id)}
                          disabled={reissuing === cert.id}
                          className="p-2 hover:bg-green-100 rounded disabled:opacity-50"
                          title="Reissue"
                        >
                          <RefreshCcw className="w-4 h-4 text-green-700" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
