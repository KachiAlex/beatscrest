import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Download, ArrowLeft, FileText } from 'lucide-react';

interface LicenseData {
  licenseId: string;
  beatTitle: string;
  producerName: string;
  producerEmail?: string;
  buyerName: string;
  buyerEmail: string;
  purchaseDate: string;
  purchaseAmount: number;
  licenseType: string;
  terms: string[];
}

export default function BeatLicense() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    const loadLicense = async () => {
      if (!purchaseId) {
        setError('Purchase ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getLicense(purchaseId);
        setLicenseData(response.license);
      } catch (err: any) {
        console.error('Error loading license:', err);
        setError(err.response?.data?.error || 'Failed to load license');
      } finally {
        setLoading(false);
      }
    };

    loadLicense();
  }, [purchaseId, user, authLoading, navigate]);

  const handleDownload = () => {
    if (!licenseData) return;

    // Create a printable version of the license
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const licenseHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Beat License - ${licenseData.licenseId}</title>
          <style>
            @media print {
              @page { margin: 0.5in; }
              body { margin: 0; }
            }
            body {
              font-family: 'Georgia', serif;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 40px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #1e40af;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1e40af;
              margin: 0;
              font-size: 32px;
              letter-spacing: 2px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .license-id {
              text-align: right;
              margin-bottom: 30px;
              font-weight: bold;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #1e40af;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 15px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              margin-bottom: 5px;
            }
            .info-value {
              color: #333;
            }
            .terms-list {
              list-style: none;
              padding: 0;
            }
            .terms-list li {
              margin-bottom: 12px;
              padding-left: 25px;
              position: relative;
            }
            .terms-list li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #10b981;
              font-weight: bold;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .signature-section {
              margin-top: 50px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
            }
            .signature-box {
              border-top: 2px solid #333;
              padding-top: 10px;
              margin-top: 60px;
            }
            .signature-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .date {
              margin-top: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BEAT LICENSE AGREEMENT</h1>
            <p>BeatCrest Music Marketplace</p>
            <p>Official License Certificate</p>
          </div>
          
          <div class="license-id">
            License ID: ${licenseData.licenseId}
          </div>

          <div class="section">
            <h2>License Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Beat Title:</div>
                <div class="info-value">${licenseData.beatTitle}</div>
              </div>
              <div class="info-item">
                <div class="info-label">License Type:</div>
                <div class="info-value">${licenseData.licenseType}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Producer:</div>
                <div class="info-value">${licenseData.producerName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Licensee (Buyer):</div>
                <div class="info-value">${licenseData.buyerName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Purchase Date:</div>
                <div class="info-value">${new Date(licenseData.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Purchase Amount:</div>
                <div class="info-value">₦${licenseData.purchaseAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>License Terms & Conditions</h2>
            <ul class="terms-list">
              ${licenseData.terms.map(term => `<li>${term}</li>`).join('')}
            </ul>
          </div>

          <div class="signature-section">
            <div>
              <div class="signature-box">
                <div class="signature-label">Producer Signature</div>
                <div class="date">Date: ${new Date(licenseData.purchaseDate).toLocaleDateString()}</div>
              </div>
            </div>
            <div>
              <div class="signature-box">
                <div class="signature-label">Licensee Signature</div>
                <div class="date">Date: ${new Date(licenseData.purchaseDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This license is issued by BeatCrest Music Marketplace</p>
            <p>For inquiries, contact: support@beatcrest.com</p>
            <p>License ID: ${licenseData.licenseId} | Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(licenseHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading license...</p>
        </div>
      </div>
    );
  }

  if (error || !licenseData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'License not found'}</p>
          <button onClick={() => navigate('/buyer')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="section-container py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/buyer')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Beat License</h1>
              <p className="text-slate-300">License ID: {licenseData.licenseId}</p>
            </div>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* License Document */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center border-b-4 border-blue-600 pb-6 mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2 tracking-wide">BEAT LICENSE AGREEMENT</h1>
            <p className="text-slate-600 text-lg">BeatCrest Music Marketplace</p>
            <p className="text-slate-500">Official License Certificate</p>
          </div>

          {/* License ID */}
          <div className="text-right mb-8">
            <p className="text-sm font-semibold text-slate-600">License ID: <span className="text-blue-600">{licenseData.licenseId}</span></p>
          </div>

          {/* License Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-600 border-b-2 border-slate-200 pb-3 mb-6">License Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Beat Title</p>
                <p className="text-lg text-slate-900 font-medium">{licenseData.beatTitle}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">License Type</p>
                <p className="text-lg text-slate-900 font-medium">{licenseData.licenseType}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Producer</p>
                <p className="text-lg text-slate-900 font-medium">{licenseData.producerName}</p>
                {licenseData.producerEmail && (
                  <p className="text-sm text-slate-500">{licenseData.producerEmail}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Licensee (Buyer)</p>
                <p className="text-lg text-slate-900 font-medium">{licenseData.buyerName}</p>
                <p className="text-sm text-slate-500">{licenseData.buyerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Purchase Date</p>
                <p className="text-lg text-slate-900 font-medium">
                  {new Date(licenseData.purchaseDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Purchase Amount</p>
                <p className="text-lg text-slate-900 font-medium">₦{licenseData.purchaseAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-blue-600 border-b-2 border-slate-200 pb-3 mb-6">License Terms & Conditions</h2>
            <ul className="space-y-4">
              {licenseData.terms.map((term, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span className="text-slate-700 leading-relaxed">{term}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-8 border-t-2 border-slate-200">
            <div>
              <div className="border-t-2 border-slate-900 pt-4 mt-16">
                <p className="font-semibold text-slate-900 mb-2">Producer Signature</p>
                <p className="text-sm text-slate-500">
                  Date: {new Date(licenseData.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <div className="border-t-2 border-slate-900 pt-4 mt-16">
                <p className="font-semibold text-slate-900 mb-2">Licensee Signature</p>
                <p className="text-sm text-slate-500">
                  Date: {new Date(licenseData.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-slate-200 text-center text-sm text-slate-500">
            <p className="mb-2">This license is issued by BeatCrest Music Marketplace</p>
            <p className="mb-2">For inquiries, contact: support@beatcrest.com</p>
            <p>License ID: {licenseData.licenseId} | Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

