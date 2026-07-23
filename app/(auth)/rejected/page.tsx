'use client';

import { XCircle, LogOut } from 'lucide-react';
import { signOutAction } from '../../../lib/actions/auth-actions';
import { ROUTES } from '../../../lib/constants/routes';

export default function RejectedPage() {
  const handleLogout = async () => {
    const res = await signOutAction();
    if (res.success) {
      window.location.href = ROUTES.PUBLIC.HOME;
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="w-12 h-12 bg-destructive-50 text-destructive rounded-full flex items-center justify-center text-xl mx-auto border border-destructive-200">
        <XCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Admission Declined</h2>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
          Unfortunately, your application for admission has been declined by the institute administration.
        </p>
        <p className="text-slate-400 text-xs leading-relaxed">
          This could be due to eligibility constraints, incorrect documentation, or batch capacity limits. If you have questions, please call the institute office directly.
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
