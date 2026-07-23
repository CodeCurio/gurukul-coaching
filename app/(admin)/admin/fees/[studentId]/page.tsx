import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LedgerManager from './ledger-manager';
import { ROUTES } from '@/lib/constants/routes';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface FeeDetailPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function AdminFeeDetailPage({ params }: FeeDetailPageProps) {
  const resolvedParams = await params;
  const studentId = resolvedParams.studentId;

  const supabase = await createClient();

  // 1. Fetch Student details
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('roll_number, current_class, profiles (full_name)')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    redirect(ROUTES.ADMIN.FEES);
  }

  // 2. Fetch Student Fees ledger with nested installments and receipts
  const { data: ledgerRecord, error: ledgerError } = await supabase
    .from('student_fees')
    .select(`
      *,
      fee_installments (
        *,
        fee_receipts (
          *,
          profiles (
            full_name
          )
        )
      )
    `)
    .eq('student_id', studentId)
    .maybeSingle();

  if (ledgerError || !ledgerRecord) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href={ROUTES.ADMIN.FEES}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Fee Ledgers
          </Link>
        </div>
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-md mx-auto space-y-3">
          <div className="text-4xl">💳</div>
          <h3 className="text-lg font-bold text-slate-800">No Ledger Record Configured</h3>
          <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
            This student does not have an active fee structure assigned. Please verify they are approved.
          </p>
        </div>
      </div>
    );
  }

  // Sort installments chronologically by installment number
  const installments = (ledgerRecord.fee_installments || []).sort(
    (a: any, b: any) => a.installment_number - b.installment_number
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={ROUTES.ADMIN.FEES}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Fee Ledgers
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fee Ledger: {(student.profiles as any)?.full_name}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">
            Roll No: {student.roll_number} • Class Level: {student.current_class}
          </p>
        </div>
      </div>

      <LedgerManager
        student={student as any}
        ledger={ledgerRecord as any}
        installments={installments as any}
      />
    </div>
  );
}
