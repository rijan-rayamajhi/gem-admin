"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from '@/components/ProtectedRoute';
import HomeLayout from '@/components/HomeLayout';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Bug {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: any;
  recording?: string;
  module?: string;
  fixed?: string;
  published?: string;
}

export default function ReleaseBugsPage() {
  const params = useParams();
  const releaseId = params?.releaseId as string;
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [releaseVersion, setReleaseVersion] = useState<string>("");
  const [stats, setStats] = useState({ totalReported: 0, totalValidBugs: 0, totalValidSuggestion: 0 });
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState("Bug");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBugs = async () => {
      setLoading(true);
      try {
        // Fetch bugs for this release
        const q = query(collection(db, 'bugs'), where('releaseId', '==', releaseId));
        const snapshot = await getDocs(q);
        const data: Bug[] = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          status: doc.data().status,
          createdAt: doc.data().createdAt,
          recording: doc.data().recording,
          module: doc.data().module,
          fixed: doc.data().fixed,
          published: doc.data().published,
        }));
        setBugs(data);
        // Calculate stats
        setStats({
          totalReported: data.length,
          totalValidBugs: data.filter(bug => bug.status !== 'closed' && bug.status !== 'resolved' && bug.status !== 'suggestion').length,
          totalValidSuggestion: data.filter(bug => bug.status === 'suggestion').length,
        });
      } catch (error) {
        setBugs([]);
        setStats({ totalReported: 0, totalValidBugs: 0, totalValidSuggestion: 0 });
      } finally {
        setLoading(false);
      }
    };
    const fetchRelease = async () => {
      // Optionally fetch release version for header
      try {
        const snapshot = await getDocs(query(collection(db, 'apk_uploads')));
        const doc = snapshot.docs.find(d => d.id === releaseId);
        setReleaseVersion(doc?.data().version || releaseId);
      } catch {
        setReleaseVersion(releaseId);
      }
    };
    if (releaseId) {
      fetchBugs();
      fetchRelease();
    }
  }, [releaseId]);

  const handleReportBug = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await addDoc(collection(db, 'bugs'), {
        releaseId,
        recording: recordingUrl,
        description,
        status: reportType === 'Bug' ? 'open' : reportType.toLowerCase(),
        reportType,
        createdAt: Timestamp.now(),
        title: reportType,
      });
      setReportModalOpen(false);
      setRecordingUrl("");
      setDescription("");
      setReportType("Bug");
      setFormError(null);
      // Refresh bugs
      const q = query(collection(db, 'bugs'), where('releaseId', '==', releaseId));
      const snapshot = await getDocs(q);
      const data: Bug[] = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        status: doc.data().status,
        createdAt: doc.data().createdAt,
        recording: doc.data().recording,
        module: doc.data().module,
        fixed: doc.data().fixed,
        published: doc.data().published,
      }));
      setBugs(data);
      setStats({
        totalReported: data.length,
        totalValidBugs: data.filter(bug => bug.status !== 'closed' && bug.status !== 'resolved' && bug.status !== 'suggestion').length,
        totalValidSuggestion: data.filter(bug => bug.status === 'suggestion').length,
      });
    } catch (err) {
      setFormError("Failed to report bug. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <HomeLayout>
        <div className="p-6">
          {/* Stats Cards - Consistent UI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v2h6V4a1 1 0 00-1-1m-4 0h4" />
                    <circle cx="12" cy="17" r="1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reported</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReported}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Valid Bugs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalValidBugs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Valid Suggestion</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalValidSuggestion}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setReportModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow"
            >
              Report Bug
            </button>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bugs for Release: {releaseVersion}</h1>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading bugs...</div>
            ) : bugs.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v2h6V4a1 1 0 00-1-1m-4 0h4" />
                  <circle cx="12" cy="17" r="1" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bugs found for this release</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recording URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fixed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bugs.map((bug) => (
                      <tr key={bug.id} className="hover:bg-gray-50">
                        {/* Reported */}
                        <td className="px-6 py-4 text-sm text-gray-900">{bug.createdAt && typeof bug.createdAt === 'object' && (bug.createdAt as any).toDate ? (bug.createdAt as any).toDate().toLocaleString() : (typeof bug.createdAt === 'string' ? bug.createdAt : '')}</td>
                        {/* Recording URL */}
                        <td className="px-6 py-4 text-sm text-blue-600 underline">
                          {bug.recording ? <a href={bug.recording} target="_blank" rel="noopener noreferrer">View</a> : '—'}
                        </td>
                        {/* Module */}
                        <td className="px-6 py-4 text-sm text-gray-900">{bug.module || '—'}</td>
                        {/* Status */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {bug.status === 'open' ? 'open' : bug.status === 'valid' ? 'valid' : bug.status === 'invalid' ? 'invalid' : bug.status}
                        </td>
                        {/* Fixed */}
                        <td className="px-6 py-4 text-sm text-gray-900">{bug.fixed || '—'}</td>
                        {/* Published date */}
                        <td className="px-6 py-4 text-sm text-gray-900">{bug.published || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* Report Bug Modal */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setReportModalOpen(false)}
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Report Bug</h2>
              <form onSubmit={handleReportBug} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screen Recording URL</label>
                  <input
                    type="url"
                    value={recordingUrl}
                    onChange={e => setRecordingUrl(e.target.value)}
                    placeholder="https://..."
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe the bug or suggestion..."
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="Bug">Bug</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {formError && <div className="text-red-600 text-sm">{formError}</div>}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={formLoading}
                  >
                    {formLoading ? "Reporting..." : "Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </HomeLayout>
    </ProtectedRoute>
  );
} 