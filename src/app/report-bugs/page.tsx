"use client";

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomeLayout from '@/components/HomeLayout';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// Placeholder Notification, AddBugModal, ViewBugModal, DeleteBugModal, and bugService
// You should implement these or adapt from event components

interface Bug {
  id: string;
  reported: string;
  recording: string;
  module: string;
  status: string;
  fixed: string;
  published: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
}

interface Release {
  id: string;
  version: string;
  module: string;
  status: string;
  publishDate: string;
  dueDate: string;
}

const bugService = {
  async getBugs(): Promise<Bug[]> {
    // Example placeholder data
    return [
      {
        id: '1',
        reported: '2024-06-01',
        recording: 'https://example.com/recording.mp4',
        module: 'Login',
        status: 'open',
        fixed: '2024-06-05',
        published: '2024-06-06',
      },
    ];
  },
  async createBug(data: Partial<Bug>) {},
  async updateBug(id: string, data: Partial<Bug>) {},
  async deleteBug(id: string) {},
};

export default function ReportBugsPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [filteredBugs, setFilteredBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [releases, setReleases] = useState<Release[]>([]);
  // Add valid bug count fetching
  const [validBugsMap, setValidBugsMap] = useState<{ [releaseId: string]: number }>({});

  useEffect(() => {
    const fetchBugs = async () => {
      setLoading(true);
      try {
        const fetched = await bugService.getBugs();
        setBugs(fetched);
        setFilteredBugs(fetched);
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to fetch bugs', isVisible: true });
      } finally {
        setLoading(false);
      }
    };
    fetchBugs();
  }, []);

  useEffect(() => {
    let filtered = bugs;
    if (searchTerm.trim()) {
      filtered = filtered.filter((bug) =>
        bug.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((bug) => bug.status === statusFilter);
    }
    setFilteredBugs(filtered);
  }, [searchTerm, statusFilter, bugs]);

  useEffect(() => {
    const fetchReleases = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'apk_uploads'), orderBy('uploadedAt', 'desc'));
        const snapshot = await getDocs(q);
        const data: Release[] = snapshot.docs.map(doc => ({
          id: doc.id,
          version: doc.data().version,
          module: doc.data().module,
          status: doc.data().status,
          publishDate: doc.data().publishDate,
          dueDate: doc.data().dueDate,
        }));
        setReleases(data);
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to fetch releases', isVisible: true });
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  useEffect(() => {
    const fetchValidBugs = async () => {
      const map: { [releaseId: string]: number } = {};
      try {
        const bugsSnapshot = await getDocs(collection(db, 'bugs'));
        bugsSnapshot.docs.forEach(doc => {
          const bug = doc.data();
          if (bug.releaseId && bug.status !== 'closed' && bug.status !== 'resolved') {
            map[bug.releaseId] = (map[bug.releaseId] || 0) + 1;
          }
        });
        setValidBugsMap(map);
      } catch {}
    };
    fetchValidBugs();
  }, [releases]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleAddBug = async (data: Partial<Bug>) => {
    try {
      await bugService.createBug(data);
      const updated = await bugService.getBugs();
      setBugs(updated);
      setFilteredBugs(updated);
      setNotification({ type: 'success', message: 'Bug reported successfully!', isVisible: true });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to report bug', isVisible: true });
    }
  };

  const handleEditBug = async (data: Partial<Bug>) => {
    if (!selectedBug?.id) return;
    try {
      setActionLoading(true);
      await bugService.updateBug(selectedBug.id, data);
      const updated = await bugService.getBugs();
      setBugs(updated);
      setFilteredBugs(updated);
      setNotification({ type: 'success', message: 'Bug updated successfully!', isVisible: true });
      setEditModalOpen(false);
      setSelectedBug(null);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update bug', isVisible: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBug = async () => {
    if (!selectedBug?.id) return;
    try {
      setActionLoading(true);
      await bugService.deleteBug(selectedBug.id);
      const updated = await bugService.getBugs();
      setBugs(updated);
      setFilteredBugs(updated);
      setNotification({ type: 'success', message: 'Bug deleted successfully!', isVisible: true });
      setDeleteModalOpen(false);
      setSelectedBug(null);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete bug', isVisible: true });
    } finally {
      setActionLoading(false);
    }
  };

  const openViewModal = (bug: Bug) => {
    setSelectedBug(bug);
    setViewModalOpen(true);
  };
  const openEditModal = (bug: Bug) => {
    setSelectedBug(bug);
    setEditModalOpen(true);
  };
  const openDeleteModal = (bug: Bug) => {
    setSelectedBug(bug);
    setDeleteModalOpen(true);
  };

  const stats = {
    total: filteredBugs.length,
    open: filteredBugs.filter(bug => bug.status === 'open').length,
    in_progress: filteredBugs.filter(bug => bug.status === 'in_progress').length,
    resolved: filteredBugs.filter(bug => bug.status === 'resolved').length,
    closed: filteredBugs.filter(bug => bug.status === 'closed').length,
  };

  return (
    <ProtectedRoute>
      <HomeLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Report Bugs</h1>
              <p className="text-gray-600">Submit and track application bugs</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v2h6V4a1 1 0 00-1-1m-4 0h4" />
                    <circle cx="12" cy="17" r="1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bugs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
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
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
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
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bugs Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-red-500 hover:bg-red-400 transition ease-in-out duration-150 cursor-not-allowed">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading releases...
                </div>
              </div>
            ) : releases.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v2h6V4a1 1 0 00-1-1m-4 0h4" />
                  <circle cx="12" cy="17" r="1" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No releases found</h3>
                <p className="mt-1 text-sm text-gray-500">No releases have been created yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Bugs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug Fixes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {releases.map((release) => (
                      <tr key={release.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/report-bugs/${release.id}` }>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{release.version}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{validBugsMap[release.id] || 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{release.module}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{release.status}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{release.publishDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{release.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Notification */}
        {/* Implement Notification component as needed */}
        {/* AddBugModal, ViewBugModal, DeleteBugModal should be implemented or adapted from event modals */}
      </HomeLayout>
    </ProtectedRoute>
  );
} 