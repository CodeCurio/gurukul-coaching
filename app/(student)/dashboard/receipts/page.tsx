import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/constants/routes';
import { formatCurrency } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import DownloadReceiptButton from '@/components/student/download-receipt-button';

import { Receipt, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentReceiptsPage() {
  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Fetch receipts with associated student, profiles, and installment details
  const { data: receipts, error: fetchError } = await supabase
    .from('fee_receipts')
    .select(`
      *,
      students (
        roll_number,
        current_class,
        profiles (
          full_name
        )
      ),
      fee_installments (
        installment_number
      ),
      profiles (
        full_name
      )
    `)
    .eq('student_id', user.id)
    .order('issued_at', { ascending: false });

  if (fetchError) {
    console.error('Error fetching receipts list:', fetchError);
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Receipt History</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Access and download immutable PDF copies of all fee payments recorded physically at the office desk.
        </p>
      </div>

      {/* Receipts Table */}
      {receipts && receipts.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-lg">Issued Payment Receipts</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-4 px-6">Receipt No</th>
                  <th className="py-4 px-6">Installment</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment Mode</th>
                  <th className="py-4 px-6">Issued Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {receipts.map((rc: any) => {
                  const studentData: any = rc.students;
                  const profileData: any = studentData?.profiles;
                  const instData: any = rc.fee_installments;
                  const adminProfile: any = rc.profiles;

                  return (
                    <tr key={rc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {rc.receipt_number}
                      </td>
                      <td className="py-4 px-6">Installment #{instData?.installment_number || '-'}</td>
                      <td className="py-4 px-6 text-slate-900 font-bold">{formatCurrency(rc.amount)}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {rc.payment_method}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-500">{formatDate(rc.issued_at)}</td>
                      <td className="py-4 px-6 text-right">
                        <DownloadReceiptButton
                          receipt={{
                            receipt_number: rc.receipt_number,
                            amount: Number(rc.amount),
                            payment_method: rc.payment_method,
                            issued_at: rc.issued_at,
                            student_name: profileData?.full_name || 'Student Name',
                            roll_number: studentData?.roll_number || 'Roll No',
                            current_class: studentData?.current_class || 'Class',
                            installment_number: instData?.installment_number || 1,
                            issued_by_name: adminProfile?.full_name || 'Admin Clerk',
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3 max-w-md mx-auto">
          <div className="text-4xl">🧾</div>
          <h3 className="text-lg font-bold text-slate-800">No Receipts Found</h3>
          <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
            You do not have any issued payment receipts yet. Receipts will appear here automatically when payments are recorded.
          </p>
        </div>
      )}
    </div>
  );
}
