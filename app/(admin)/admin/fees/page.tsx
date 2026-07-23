import { createClient } from '../../../../lib/supabase/server';
import FeesFilterBar from './fees-filter-bar';
import Link from 'next/link';
import { ROUTES } from '../../../../lib/constants/routes';
import { formatCurrency } from '../../../../lib/utils/format-currency';
import { CreditCard, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface FeesPageProps {
  searchParams: Promise<{
    query?: string;
    classLevel?: string;
  }>;
}

export default async function AdminFeesPage({ searchParams }: FeesPageProps) {
  const resolvedParams = await searchParams;
  const queryVal = resolvedParams.query || '';
  const classLevelVal = resolvedParams.classLevel || 'all';

  let ledgers: any[] = [];
  try {
    const supabase = await createClient();

    // Query fee structures
    let queryBuilder;
    if (queryVal) {
      queryBuilder = supabase
        .from('student_fees')
        .select(`
          id,
          net_payable_amount,
          academic_year,
          students!inner (
            id,
            roll_number,
            current_class,
            profiles!inner (
              full_name
            )
          ),
          fee_installments (
            amount_paid,
            amount_due
          )
        `)
        .ilike('students.profiles.full_name', `%${queryVal}%`);
    } else {
      queryBuilder = supabase
        .from('student_fees')
        .select(`
          id,
          net_payable_amount,
          academic_year,
          students (
            id,
            roll_number,
            current_class,
            profiles (
              full_name
            )
          ),
          fee_installments (
            amount_paid,
            amount_due
          )
        `);
    }

    if (classLevelVal !== 'all') {
      queryBuilder = queryBuilder.eq('students.current_class', classLevelVal);
    }

    const { data } = await queryBuilder;
    if (data) {
      ledgers = data;
    }
  } catch (error) {
    console.error('Error fetching fees roster ledgers:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Fee Ledgers</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Track student ledger outstanding balances, record office collections, and manage discounts/scholarships.
        </p>
      </div>

      <FeesFilterBar />

      {/* Roster Grid */}
      {ledgers.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-lg">Financial Ledgers ({ledgers.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-4 px-6">Roll Number</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Class Level</th>
                  <th className="py-4 px-6">Net Payable</th>
                  <th className="py-4 px-6">Total Paid</th>
                  <th className="py-4 px-6">Outstanding</th>
                  <th className="py-4 px-6 text-right">Collect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {ledgers.map((l: any) => {
                  const student = l.students;
                  if (!student) return null; // safety gate

                  const profile = student.profiles;
                  const insts = l.fee_installments || [];

                  const totalPaid = insts.reduce((acc: number, cur: any) => acc + Number(cur.amount_paid), 0);
                  const netPayable = Number(l.net_payable_amount);
                  const balance = netPayable - totalPaid;

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-900 font-bold">{student.roll_number}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{profile?.full_name || 'Unknown'}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{student.current_class}</td>
                      <td className="py-4 px-6 text-slate-900 font-medium">{formatCurrency(netPayable)}</td>
                      <td className="py-4 px-6 text-emerald-600 font-bold">{formatCurrency(totalPaid)}</td>
                      <td className={`py-4 px-6 font-bold ${balance > 0 ? 'text-rose-600 animate-pulse' : 'text-success'}`}>
                        {formatCurrency(balance)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`${ROUTES.ADMIN.FEES}/${student.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary-800 bg-primary-50 border border-primary-100 rounded-xl transition-all"
                        >
                          Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
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
          <div className="text-4xl text-slate-300">💳</div>
          <h3 className="text-lg font-bold text-slate-800">No Ledgers Configured</h3>
          <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
            There are no active student ledger structures mapped under these filters.
          </p>
        </div>
      )}
    </div>
  );
}
