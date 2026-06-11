'use client';

import { useEffect, useState } from 'react';
import { certificateApi } from '@/lib/certificate-api';
import { Download, Share2 } from 'lucide-react';

export default function ChildCertificates({ childId, childName }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        const data = await certificateApi.listCertificates({ student_id: childId });
        setCertificates(data);
      } catch (err) {
        console.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, [childId]);

  const handleDownload = async (certId, certificateNumber) => {
    try {
      setDownloaded(certId);
      const blob = await certificateApi.downloadCertificate(certId);
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
      setDownloaded(null);
    }
  };

  const handleShare = (code) => {
    const verificationUrl = `https://velttech.org/certificates/verify/${code}`;
    navigator.clipboard.writeText(verificationUrl);
    alert('Verification link copied to clipboard!');
  };

  if (certificates.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          No certificates yet. Certificates will appear here once {childName}{' '}
          completes a course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? <p className="text-sm text-slate-600">Loading certificates...</p> : null}
      {certificates.map((cert) => (
        <div
          key={cert.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-bold text-gray-900">{cert.course_title}</h4>
              <p className="text-sm text-gray-600 font-mono">
                {cert.certificate_number}
              </p>
            </div>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Valid
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Issued: </span>
              <span className="font-semibold">
                {new Date(cert.issued_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Completed: </span>
              <span className="font-semibold">
                {new Date(cert.completion_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDownload(cert.id, cert.certificate_number)}
              disabled={downloaded === cert.id}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => handleShare(cert.verification_code)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white text-sm font-semibold py-2 px-3 rounded hover:bg-gray-700 transition"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
