'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useBugReport } from '../providers/BugReportProvider';
import { UpdateBugReportRequest } from '../../domain/usecases/UpdateBugReportUseCase';
import { AddBugReportCommentRequest } from '../../domain/usecases/AddBugReportCommentUseCase';

interface BugReportDetailsModalProps {
  bugReportId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BugReportDetailsModal({ bugReportId, isOpen, onClose }: BugReportDetailsModalProps) {
  const { user } = useAuth();
  const { 
    selectedBugReport, 
    comments, 
    loading,
    getBugReportById,
    getBugReportComments,
    updateBugReport,
    addBugReportComment,
    clearSelectedBugReport
  } = useBugReport();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('open');
  const [adminNotes, setAdminNotes] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    if (isOpen && bugReportId) {
      getBugReportById(bugReportId);
      getBugReportComments(bugReportId);
    } else if (!isOpen) {
      clearSelectedBugReport();
    }
  }, [isOpen, bugReportId, clearSelectedBugReport, getBugReportById, getBugReportComments]);

  useEffect(() => {
    if (selectedBugReport) {
      setNewStatus(selectedBugReport.status);
      setAdminNotes(selectedBugReport.adminNotes || '');
      setRewardAmount(selectedBugReport.rewardAmount);
    }
  }, [selectedBugReport]);

  const handleStatusUpdate = async () => {
    if (!selectedBugReport) return;

    setIsUpdating(true);
    try {
      const update: UpdateBugReportRequest = {
        id: selectedBugReport.id,
        status: newStatus as 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected',
        adminNotes: adminNotes.trim() || undefined,
        rewardAmount: rewardAmount
      };

      await updateBugReport(update);
    } catch (error) {
      console.error('Failed to update bug report:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedBugReport || !newComment.trim() || !user?.uid) return;

    setIsAddingComment(true);
    try {
      const commentRequest: AddBugReportCommentRequest = {
        bugReportId: selectedBugReport.id,
        userId: user.uid,
        content: newComment.trim(),
        isAdmin: true // Assuming admin users are commenting
      };

      await addBugReportComment(commentRequest);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'open':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'resolved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'closed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (priority) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (severity) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!isOpen || !selectedBugReport) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">Bug Report Details</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-card-foreground transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bug Report Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Bug Report Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-card-foreground font-medium">{selectedBugReport.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-card-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">
                      {selectedBugReport.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="text-card-foreground">{selectedBugReport.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                      <div className="mt-1">
                        <span className={getStatusBadge(selectedBugReport.status)}>
                          {selectedBugReport.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Priority</label>
                      <div className="mt-1">
                        <span className={getPriorityBadge(selectedBugReport.priority)}>
                          {selectedBugReport.priority.charAt(0).toUpperCase() + selectedBugReport.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Severity</label>
                      <div className="mt-1">
                        <span className={getSeverityBadge(selectedBugReport.severity)}>
                          {selectedBugReport.severity.charAt(0).toUpperCase() + selectedBugReport.severity.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reward Amount</label>
                    <p className="text-card-foreground font-medium text-green-600">₹{selectedBugReport.rewardAmount}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-card-foreground">{formatDate(selectedBugReport.createdAt)}</p>
                  </div>

                  {selectedBugReport.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-card-foreground">{formatDate(selectedBugReport.updatedAt)}</p>
                    </div>
                  )}

                  {selectedBugReport.stepsToReproduce && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Steps to Reproduce</label>
                      <p className="text-card-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">
                        {selectedBugReport.stepsToReproduce}
                      </p>
                    </div>
                  )}

                  {selectedBugReport.deviceInfo && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Device Information</label>
                      <p className="text-card-foreground">{selectedBugReport.deviceInfo}</p>
                    </div>
                  )}

                  {selectedBugReport.screenshots && selectedBugReport.screenshots.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Screenshots</label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedBugReport.screenshots.map((screenshot, index) => (
                          <div key={index} className="border border-border rounded-lg p-2 bg-muted/50">
                            <p className="text-sm text-muted-foreground truncate">{screenshot}</p>
                            {/* In a real app, you'd display the actual image here */}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Actions and Comments */}
            <div className="space-y-6">
              {/* Admin Actions */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Admin Actions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Reward Amount (₹)</label>
                    <input
                      type="number"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(Number(e.target.value))}
                      min="0"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add admin notes..."
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || loading}
                    className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? 'Updating...' : 'Update Bug Report'}
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Comments</h3>
                
                {/* Add Comment */}
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={isAddingComment || !newComment.trim() || loading}
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAddingComment ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No comments yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium ${
                            comment.isAdmin ? 'text-blue-600' : 'text-muted-foreground'
                          }`}>
                            {comment.isAdmin ? 'Admin' : 'User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-card-foreground whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Existing Admin Notes */}
          {selectedBugReport.adminNotes && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Admin Notes</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-card-foreground whitespace-pre-wrap">
                  {selectedBugReport.adminNotes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
