import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/constants/routes';
import { formatCurrency } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import DownloadReceiptButton from '@/components/student/download-receipt-button';

import { CreditCard, Tag, Landmark, Calendar, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentFeesPage() {
  const supabase = await createClient();

  // Get current auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Fetch student demographics to populate receipt info later
  const { data: student } = await supabase
    .from('students')
    .select('*, profiles (full_name)')
    .eq('id', user.id)
    .single();

  if (!student) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Fetch full student fees ledger, installments, receipts, and issuing admin profiles
  const { data: feeLedger, error: ledgerError } = await supabase
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
    .eq('student_id', user.id)
    .maybeSingle();

  if (ledgerError) {
    console.error('Error fetching fee ledger:', ledgerError);
  }

  if (!feeLedger) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3 max-w-md mx-auto">
        <div className="text-4xl text-slate-300">💳</div>
        <h3 className="text-lg font-bold text-slate-800">No Fee Record Configured</h3>
        <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
          The administrative office has not set up a fee structure for your student profile yet. Please check back after admission approval.
        </p>
      </div>
    );
  }

  // Sort installments chronologically by number
  const installments = [...(feeLedger.fee_installments || [])].sort(
    (a, b) => a.installment_number - b.installment_number
  );

  // Summarize payment data
  const totalPaid = installments.reduce((acc, inst) => acc + Number(inst.amount_paid), 0);
  const outstanding = Number(feeLedger.net_payable_amount) - totalPaid;

  const summaryCards = [
    {
      icon: <Landmark className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
      label: 'Net Payable Fees',
      value: formatCurrency(feeLedger.net_payable_amount),
      note: `Base: ${formatCurrency(feeLedger.total_fee_amount)}`,
    },
    {
      icon: <Landmark className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      label: 'Total Fees Paid',
      value: formatCurrency(totalPaid),
      note: 'Offline collection settled',
    },
    {
      icon: <Landmark className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-100',
      label: 'Outstanding Balance',
      value: formatCurrency(outstanding),
      note: 'Pending installments',
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success-50 text-success border-success-100';
      case 'overdue':
        return 'bg-destructive-50 text-destructive border-destructive-100';
      case 'partially_paid':
        return 'bg-warning-50 text-warning border-warning-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fees & Ledgers</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Track your installment schedules, scholarship/discount records, and download generated payment receipts.
        </p>
      </div>

      {/* Discount / Scholarship Notice */}
      {(Number(feeLedger.discount_amount) > 0 || Number(feeLedger.scholarship_amount) > 0) && (
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800">
          <Tag className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <span className="font-bold">Scholarship / Discount Applied:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              {Number(feeLedger.discount_amount) > 0 && (
                <li>
                  Discount of <span className="font-semibold text-slate-800">{formatCurrency(feeLedger.discount_amount)}</span> applied.
                  {feeLedger.discount_reason && ` Reason: "${feeLedger.discount_reason}"`}
                </li>
              )}
              {Number(feeLedger.scholarship_amount) > 0 && (
                <li>
                  Scholarship of <span className="font-semibold text-slate-800">{formatCurrency(feeLedger.scholarship_amount)}</span> applied.
                  {feeLedger.scholarship_reason && ` Reason: "${feeLedger.scholarship_reason}"`}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Ledger Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {summaryCards.map((c, idx) => (
          <div key={idx} className={`p-6 rounded-3xl border shadow-sm ${c.bg} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{c.label}</span>
              {c.icon}
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{c.value}</div>
            <div className="text-[10px] text-slate-400 font-semibold">{c.note}</div>
          </div>
        ))}
      </div>

      {/* Installments Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-slate-900 text-lg">Installment Schedule ({feeLedger.academic_year})</h3>
        </div>

        {installments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-4 px-6">Installment</th>
                  <th className="py-4 px-6">Amount Due</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Receipts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {installments.map((inst) => {
                  const receiptList = inst.fee_receipts || [];
                  const activeStudent: any = student.profiles;

                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 px-6 font-bold text-slate-900">Installment #{inst.installment_number}</td>
                      <td className="py-4.5 px-6">{formatCurrency(inst.amount_due)}</td>
                      <td className="py-4.5 px-6 text-slate-500">{formatCurrency(inst.amount_paid)}</td>
                      <td className="py-4.5 px-6 font-medium text-slate-500">{formatDate(inst.due_date)}</td>
                      <td className="py-4.5 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(inst.status)}`}>
                          {inst.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right space-y-1">
                        {receiptList.length > 0 ? (
                          receiptList.map((rc: any) => (
                            <div key={rc.id} className="flex justify-end items-center gap-1">
                              <DownloadReceiptButton
                                receipt={{
                                  receipt_number: rc.receipt_number,
                                  amount: Number(rc.amount),
                                  payment_method: rc.payment_method,
                                  issued_at: rc.issued_at,
                                  student_name: activeStudent.full_name,
                                  roll_number: student.roll_number,
                                  current_class: student.current_class,
                                  installment_number: inst.installment_number,
                                  issued_by_name: rc.profiles?.full_name || 'Admin Clerk',
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic font-normal">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            No installments configured for this fee ledger.
          </div>
        )}
      </div>
    </div>
  );
}
