"use client";

import { useState, useEffect } from "react";
import HomeLayout from "@/components/HomeLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { collection, addDoc, Timestamp, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function QualityAssurancePage() {
  // Placeholder state for search/filter and stats
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [apkVersion, setApkVersion] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [module, setModule] = useState("");
  const [status, setStatus] = useState("Draft");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [apkUploads, setApkUploads] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  // New fields
  const [appUrl, setAppUrl] = useState("");
  const [testCases, setTestCases] = useState("");
  const [bugs, setBugs] = useState("");
  // State for viewing release details
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewRelease, setViewRelease] = useState<any | null>(null);

  // Placeholder stats
  const stats = {
    total: 5,
    passed: 3,
    failed: 1,
    pending: 1,
  };

  // Placeholder QA data
  const qaData = [
    { id: 1, name: "Login Test", status: "passed", date: "2024-06-01" },
    { id: 2, name: "Signup Test", status: "failed", date: "2024-06-02" },
    { id: 3, name: "Profile Update", status: "pending", date: "2024-06-03" },
    { id: 4, name: "Logout Test", status: "passed", date: "2024-06-04" },
    { id: 5, name: "Password Reset", status: "passed", date: "2024-06-05" },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      passed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Helper: today's date in yyyy-mm-dd
  const today = new Date().toISOString().split('T')[0];

  // Helper: check if form is valid
  const isFormValid =
    apkVersion.trim() &&
    publishDate &&
    dueDate &&
    module &&
    status &&
    appUrl.trim() &&
    testCases.trim() &&
    bugs.trim();

  // Reset all fields when opening modal
  const openUploadModal = () => {
    setApkVersion("");
    setPublishDate("");
    setDueDate("");
    setModule("");
    setStatus("Draft");
    setAppUrl("");
    setTestCases("");
    setBugs("");
    setFileInputKey(prev => prev + 1); // force file input reset
    setUploadModalOpen(true);
  };

  // Filtered data
  const filteredData = qaData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Save form data to Firestore (without file)
  const saveApkFormData = async (data: Omit<any, 'apkUrl' | 'apkName'>) => {
    const docData = {
      ...data,
      uploadedAt: Timestamp.now(),
    };
    await addDoc(collection(db, 'apk_uploads'), docData);
  };

  // Fetch APK uploads from Firestore
  const fetchApkUploads = async () => {
    setTableLoading(true);
    setTableError(null);
    try {
      const q = query(collection(db, "apk_uploads"), orderBy("uploadedAt", "desc"));
      const snapshot = await getDocs(q);
      const uploads: any[] = snapshot.docs.map((doc: any) => doc.data());
      setApkUploads(uploads);
    } catch (err) {
      setTableError("Failed to load APK uploads.");
    } finally {
      setTableLoading(false);
    }
  };

  // Delete APK upload by Firestore doc id
  const handleDelete = async (apk: any, idx: number) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    setDeletingId(apk.id || idx.toString());
    try {
      // Find the doc id by querying for this row's data
      const q = query(collection(db, "apk_uploads"), orderBy("uploadedAt", "desc"));
      const snapshot = await getDocs(q);
      const docToDelete = snapshot.docs.find(d => {
        const data = d.data();
        return data.version === apk.version && data.publishDate === apk.publishDate && data.dueDate === apk.dueDate && data.module === apk.module && data.status === apk.status && data.uploadedAt?.seconds === apk.uploadedAt?.seconds;
      });
      if (docToDelete) {
        await deleteDoc(doc(db, "apk_uploads", docToDelete.id));
        setMessage("Entry deleted successfully!");
        fetchApkUploads();
      } else {
        setMessage("Could not find entry to delete.");
      }
    } catch (err) {
      setMessage("Failed to delete entry.");
    } finally {
      setDeletingId(null);
    }
  };

  // Open modal for editing
  const handleEdit = async (apk: any, idx: number) => {
    setEditing(true);
    setEditingDocId(null);
    // Find the doc id by querying for this row's data
    const q = query(collection(db, "apk_uploads"), orderBy("uploadedAt", "desc"));
    const snapshot = await getDocs(q);
    const docToEdit = snapshot.docs.find(d => {
      const data = d.data();
      return data.version === apk.version && data.publishDate === apk.publishDate && data.dueDate === apk.dueDate && data.module === apk.module && data.status === apk.status && data.uploadedAt?.seconds === apk.uploadedAt?.seconds;
    });
    if (docToEdit) {
      setEditingDocId(docToEdit.id);
      setApkVersion(apk.version);
      setPublishDate(apk.publishDate);
      setDueDate(apk.dueDate);
      setModule(apk.module);
      setStatus(apk.status);
      setAppUrl(apk.appUrl || "");
      setTestCases(apk.testCases || "");
      setBugs(apk.bugs || "");
      setUploadModalOpen(true);
    } else {
      setMessage("Could not find entry to edit.");
    }
    setEditing(false);
  };

  // Update or create on submit
  useEffect(() => {
    fetchApkUploads();
    // eslint-disable-next-line
  }, []);

  // Refetch after successful upload
  useEffect(() => {
    if (message && message.includes("success")) {
      fetchApkUploads();
    }
    // eslint-disable-next-line
  }, [message]);

  return (
    <ProtectedRoute>
      <HomeLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Release</h1>
                <p className="text-gray-600">Create and manage release entries</p>
              </div>
              <button
                onClick={openUploadModal}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow"
              >
                Create Release
              </button>
            </div>
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search APK uploads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {/* Status Filter */}
                <div className="md:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total APKs</p>
                  <p className="text-2xl font-bold text-gray-900">{apkUploads.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{apkUploads.filter(apk => apk.status === 'Published').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Review</p>
                  <p className="text-2xl font-bold text-gray-900">{apkUploads.filter(apk => apk.status === 'In Review').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{apkUploads.filter(apk => apk.status === 'Draft').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QA Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-500">Loading APK uploads...</div>
            ) : tableError ? (
              <div className="p-8 text-center text-red-600">{tableError}</div>
            ) : apkUploads.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No APK uploads found</h3>
                <p className="mt-1 text-sm text-gray-500">No APKs have been uploaded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publish Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bugs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apkUploads.map((apk, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-orange-50 group"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">{apk.version}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apk.publishDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apk.dueDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apk.module}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${apk.status === 'Published' ? 'bg-green-100 text-green-800' : apk.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{apk.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apk.uploadedAt?.toDate ? apk.uploadedAt.toDate().toLocaleString() : ''}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          <span
                            title={apk.bugs}
                            onClick={() => window.open('http://localhost:3000/report-bugs/5hHtTslfH2fpFxsIFVCa', '_blank')}
                            className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                          >
                            {(() => {
                              if (!apk.bugs) return '0 bugs';
                              const lines = apk.bugs.split('\n').map((l: string) => l.trim()).filter(Boolean);
                              const commaItems = apk.bugs.split(',').map((l: string) => l.trim()).filter(Boolean);
                              const count = Math.max(lines.length, commaItems.length);
                              return `${count} bug${count === 1 ? '' : 's'}`;
                            })()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => { setViewRelease(apk); setViewModalOpen(true); }}
                            className={`px-3 py-1 mr-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition`}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(apk, idx)}
                            disabled={deletingId === (apk.id || idx.toString()) || uploading}
                            className={`px-3 py-1 mr-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(apk, idx)}
                            disabled={deletingId === (apk.id || idx.toString())}
                            className={`px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {deletingId === (apk.id || idx.toString()) ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upload APK Modal */}
          {uploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setUploadModalOpen(false)}
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold mb-4 text-gray-900">Create Release</h2>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setUploading(true);
                    setMessage(null);
                    try {
                      if (editingDocId) {
                        // Update existing doc
                        const docRef = doc(db, 'apk_uploads', editingDocId);
                        await updateDoc(docRef, {
                          version: apkVersion,
                          publishDate,
                          dueDate,
                          module,
                          status,
                          appUrl,
                          testCases,
                          bugs,
                          uploadedAt: Timestamp.now(),
                        });
                        setMessage("Entry updated successfully!");
                      } else {
                        await saveApkFormData({
                          version: apkVersion,
                          publishDate,
                          dueDate,
                          module,
                          status,
                          appUrl,
                          testCases,
                          bugs,
                        });
                      }
                      setUploadModalOpen(false);
                    } catch (err) {
                      setMessage("Failed to upload APK. Please try again.");
                    } finally {
                      setUploading(false);
                      setApkVersion("");
                      setPublishDate("");
                      setDueDate("");
                      setModule("");
                      setStatus("Draft");
                      setAppUrl("");
                      setTestCases("");
                      setBugs("");
                      setFileInputKey(prev => prev + 1);
                      setEditingDocId(null);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version No</label>
                    <input
                      type="text"
                      value={apkVersion}
                      onChange={e => setApkVersion(e.target.value)}
                      required
                      placeholder="e.g. 1.0.0"
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  {/* App URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">App URL</label>
                    <input
                      type="url"
                      value={appUrl}
                      onChange={e => setAppUrl(e.target.value)}
                      required
                      placeholder="https://example.com/app.apk"
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  {/* Test Cases */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Cases</label>
                    <textarea
                      value={testCases}
                      onChange={e => setTestCases(e.target.value)}
                      rows={3}
                      required
                      placeholder="List or describe test cases..."
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  {/* Bugs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bugs</label>
                    <textarea
                      value={bugs}
                      onChange={e => setBugs(e.target.value)}
                      rows={3}
                      required
                      placeholder="List or describe bugs found in this release..."
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                      <input
                        type="date"
                        value={publishDate}
                        onChange={e => setPublishDate(e.target.value)}
                        min={today}
                        required
                        className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        min={publishDate || today}
                        required
                        className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Module</label>
                    <select
                      value={module}
                      onChange={e => setModule(e.target.value)}
                      required
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select a module</option>
                      <option value="user-app">User App</option>
                      <option value="business-app">Business App</option>
                      <option value="admin-panel">Admin Panel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      required
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Draft">Draft</option>
                      <option value="In Review">In Review</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isFormValid || uploading}
                    >
                      {uploading ? (editingDocId ? "Updating..." : "Uploading...") : (editingDocId ? "Update" : "Upload")}
                    </button>
                  </div>
                  {message && (
                    <div className={`text-sm mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* View Release Modal */}
          {viewModalOpen && viewRelease && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setViewModalOpen(false)}
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold mb-4 text-gray-900">Release Details</h2>
                <div className="space-y-2">
                  <div><span className="font-semibold">Version:</span> {viewRelease.version}</div>
                  <div><span className="font-semibold">Publish Date:</span> {viewRelease.publishDate}</div>
                  <div><span className="font-semibold">Due Date:</span> {viewRelease.dueDate}</div>
                  <div><span className="font-semibold">Module:</span> {viewRelease.module}</div>
                  <div><span className="font-semibold">Status:</span> {viewRelease.status}</div>
                  <div><span className="font-semibold">App URL:</span> <a href={viewRelease.appUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{viewRelease.appUrl}</a></div>
                  <div><span className="font-semibold">Test Cases:</span><br /><pre className="whitespace-pre-wrap bg-gray-50 rounded p-2 border border-gray-100">{viewRelease.testCases}</pre></div>
                  <div><span className="font-semibold">Bugs:</span><br /><pre className="whitespace-pre-wrap bg-gray-50 rounded p-2 border border-gray-100">{viewRelease.bugs}</pre></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </HomeLayout>
    </ProtectedRoute>
  );
} 