'use client';

import { useState } from 'react';
import { Check, X, ShieldAlert, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { approveAdmissionAction, rejectAdmissionAction } from '@/lib/actions/admin-actions';
import { CLASS_LEVELS } from '@/lib/constants/classes';
import { formatDate } from '@/lib/utils/format-date';


interface AdmissionReviewerProps {
  admission: {
    id: string;
    student_full_name: string;
    date_of_birth: string;
    gender: string;
    guardian_name: string;
    guardian_relation: string;
    phone_number: string;
    email: string;
    address: string;
    applying_for_class: string;
    previous_school: string | null;
    status: string;
    rejection_reason: string | null;
    reviewed_at: string | null;
    reviewer?: {
      full_name: string;
    } | null;
    profiles?: {
      full_name: string;
    } | null;
  };
}

export default function AdmissionReviewer({ admission }: AdmissionReviewerProps) {
  const [assignedClass, setAssignedClass] = useState(admission.applying_for_class);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await approveAdmissionAction(admission.id, assignedClass);
      if (res.success) {
        setFeedback({ success: true, msg: 'Admission approved! Student account has been provisioned.' });
        setModalMode(null);
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to approve application.' });
      }
    } catch (err: any) {
      setFeedback({ success: false, msg: err.message || 'An error occurred during approval.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    setLoading(true);
    setFeedback(null);
    try {
      const res = await rejectAdmissionAction(admission.id, rejectReason);
      if (res.success) {
        setFeedback({ success: true, msg: 'Application rejected.' });
        setModalMode(null);
        window.location.reload();
      } else {
        setFeedback({ success: false, msg: res.error || 'Failed to reject application.' });
      }
    } catch (err: any) {
      setFeedback({ success: false, msg: 'Failed to reject.' });
    } finally {
      setLoading(false);
    }
  };

  const details = [
    { label: 'Gender', value: admission.gender.toUpperCase() },
    { label: 'Date of Birth', value: formatDate(admission.date_of_birth) },
    { label: 'Applying For Class', value: admission.applying_for_class },
    { label: 'Previous School', value: admission.previous_school || 'None' },
    { label: 'Residential Address', value: admission.address, fullWidth: true },
  ];

  const guardianDetails = [
    { label: 'Guardian Name', value: admission.guardian_name },
    { label: 'Relation to Student', value: admission.guardian_relation },
    { label: 'Contact Phone', value: admission.phone_number },
    { label: 'Email Address', value: admission.email },
  ];

  return (
    <div className="space-y-8">
      {/* Action result feedback banner */}
      {feedback && (
        <div
          className={`border rounded-xl p-3.5 text-xs sm:text-sm flex gap-2 ${
            feedback.success
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-destructive-50 border-destructive-100 text-destructive'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Grid of Student and Guardian details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Student parameters */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-base border-b border-slate-100 pb-2">
            Student Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
            {details.map((d, idx) => (
              <div key={idx} className={d.fullWidth ? 'col-span-2' : ''}>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  {d.label}
                </span>
                <span className="text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guardian parameters */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-base border-b border-slate-100 pb-2">
            Guardian Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
            {guardianDetails.map((g, idx) => (
              <div key={idx}>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  {g.label}
                </span>
                <span className="text-slate-800">{g.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gating Status and review action section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        {admission.status === 'pending' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-base">Process Registration Admission</h4>
              <p className="text-slate-500 text-xs sm:text-sm">
                Confirm eligibility and class level allocation before approving.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setModalMode('reject')}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-destructive-200 text-sm font-semibold rounded-xl text-destructive hover:bg-rose-50 transition-colors"
              >
                <X className="w-4 h-4" /> Reject Request
              </button>
              <button
                type="button"
                onClick={() => setModalMode('approve')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-800 shadow-md transition-colors"
              >
                <Check className="w-4.5 h-4.5" /> Approve Registration
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Review Action Records
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm font-semibold">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Process Status
                </span>
                <span className={`inline-flex px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  admission.status === 'approved'
                    ? 'bg-success-50 border-success-100 text-success'
                    : 'bg-destructive-50 border-destructive-100 text-destructive'
                }`}>
                  {admission.status}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Processed By
                </span>
                <span className="text-slate-800">{admission.reviewer?.full_name || admission.profiles?.full_name || 'Admin Clerk'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Processed Date
                </span>
                <span className="text-slate-800">{formatDate(admission.reviewed_at)}</span>
              </div>
              {admission.rejection_reason && (
                <div className="col-span-2">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Declined Reason
                  </span>
                  <span className="text-destructive font-medium">{admission.rejection_reason}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal Overlay */}
      {modalMode === 'approve' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xl">Approve Admission Application</h3>
              <p className="text-slate-500 text-sm">
                Approving this registration will automatically provision a student account and calculate fee schedules.
              </p>
            </div>

            {/* Select class level before finalizing */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Assign Class Level Allocation
              </label>
              <select
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none font-semibold text-slate-800"
              >
                {CLASS_LEVELS.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={loading}
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleApprove}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-success hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md"
              >
                {loading ? 'Processing...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal Overlay */}
      {modalMode === 'reject' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleReject}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 max-w-md w-full space-y-6"
          >
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xl">Decline Admission Application</h3>
              <p className="text-slate-500 text-sm">
                Please provide an explanation for rejecting this student registration application.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Batch is fully loaded / Eligibility constraints..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={loading}
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !rejectReason.trim()}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-destructive hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md"
              >
                {loading ? 'Processing...' : 'Decline Application'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
