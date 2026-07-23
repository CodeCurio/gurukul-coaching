import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import AdmissionReviewer from './admission-reviewer';
import { ROUTES } from '@/lib/constants/routes';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdmissionDetailPageProps {
  params: Promise<{
    admissionId: string;
  }>;
}

export default async function AdminAdmissionDetailPage({ params }: AdmissionDetailPageProps) {
  const resolvedParams = await params;
  const admissionId = resolvedParams.admissionId;

  const supabaseAdmin = createAdminClient();

  // Query admission record and specify explicit foreign key relation to reviewer profile
  const { data: admission, error } = await supabaseAdmin
    .from('admissions')
    .select('*, reviewer:profiles!reviewed_by(full_name)')
    .eq('id', admissionId)
    .single();

  if (error || !admission) {
    redirect(ROUTES.ADMIN.ADMISSIONS);
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={ROUTES.ADMIN.ADMISSIONS}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to admissions queue
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Application: {admission.student_full_name}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Review detailed metrics, previous school context, and allocate class ranges.
          </p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            admission.status === 'pending'
              ? 'bg-warning-50 border-warning-100 text-warning'
              : admission.status === 'approved'
              ? 'bg-success-50 border-success-100 text-success'
              : 'bg-destructive-50 border-destructive-100 text-destructive'
          }`}>
            {admission.status}
          </span>
        </div>
      </div>

      <AdmissionReviewer admission={admission as any} />
    </div>
  );
}
