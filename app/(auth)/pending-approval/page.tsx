'use client';

import { Clock, LogOut } from 'lucide-react';
import { signOutAction } from '../../../lib/actions/auth-actions';
import { ROUTES } from '../../../lib/constants/routes';

export default function PendingApprovalPage() {
  const handleLogout = async () => {
    const res = await signOutAction();
    if (res.success) {
      window.location.href = ROUTES.PUBLIC.HOME;
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="w-12 h-12 bg-warning-50 text-warning rounded-full flex items-center justify-center text-xl mx-auto border border-warning-200">
        <Clock className="w-6 h-6 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Application Pending</h2>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
          Your admission request has been submitted and is currently being reviewed by the Gurukul administrative staff.
        </p>
        <p className="text-slate-400 text-xs leading-relaxed">
          Once your admission is approved, you will gain full access to your fee status, course enrollments, and receipts.
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
        <a
          href={ROUTES.PUBLIC.HOME}
          className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Return to Homepage
        </a>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-semibold text-destructive bg-white hover:bg-destructive-50 rounded-xl border border-destructive-100 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
