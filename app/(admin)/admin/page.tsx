import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { ROUTES } from '../../../lib/constants/routes';
import { Users, GraduationCap, CreditCard, AlertCircle, FileText, MessageSquare, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils/format-currency';
import { formatDate } from '../../../lib/utils/format-date';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardHome() {
  const supabase = await createClient();

  // 1. Fetch Statistics
  // Active students count
  const { count: activeStudents } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  // Pending admissions count
  const { count: pendingAdmissions } = await supabase
    .from('admissions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Fees collected this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyReceipts } = await supabase
    .from('fee_receipts')
    .select('amount')
    .gte('issued_at', startOfMonth.toISOString());

  const totalCollectedThisMonth = (monthlyReceipts || []).reduce(
    (acc, cur) => acc + Number(cur.amount),
    0
  );

  // Total fees overdue
  const { data: overdueInstallments } = await supabase
    .from('fee_installments')
    .select('amount_due, amount_paid')
    .eq('status', 'overdue');

  const totalOverdue = (overdueInstallments || []).reduce(
    (acc, cur) => acc + (Number(cur.amount_due) - Number(cur.amount_paid)),
    0
  );

  // 2. Fetch Recent Admissions (limit to 3)
  const { data: recentAdmissions } = await supabase
    .from('admissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // 3. Fetch Recent Payments (limit to 3)
  const { data: recentPayments } = await supabase
    .from('fee_receipts')
    .select('*, students (profiles (full_name))')
    .order('issued_at', { ascending: false })
    .limit(3);

  // 4. Fetch Recent Inquiries (limit to 3)
  const { data: recentInquiries } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // 5. Gather enrollment breakdown by Class range for a custom bar chart
  let chartData = [
    { label: 'Primary (1-5)', count: 0, height: 10 },
    { label: 'Middle (6-8)', count: 0, height: 10 },
    { label: 'Secondary (9-12)', count: 0, height: 10 },
  ];

  try {
    const { data: studentsList } = await supabase
      .from('students')
      .select('current_class')
      .eq('is_active', true);

    if (studentsList) {
      studentsList.forEach((s) => {
        const classNum = parseInt(s.current_class.replace(/\D/g, ''), 10);
        if (classNum >= 1 && classNum <= 5) chartData[0].count++;
        else if (classNum >= 6 && classNum <= 8) chartData[1].count++;
        else if (classNum >= 9 && classNum <= 12) chartData[2].count++;
      });

      const maxCount = Math.max(...chartData.map((c) => c.count));
      if (maxCount > 0) {
        chartData = chartData.map((c) => ({
          ...c,
          height: Math.max(10, Math.round((c.count / maxCount) * 100)),
        }));
      }
    }
  } catch (error) {
    console.error(error);
  }

  const statCards = [
    {
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      label: 'Active Students',
      value: activeStudents || 0,
      note: 'Enrolled in offline batches',
      bg: 'bg-white border-slate-200',
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-warning-600" />,
      label: 'Pending Admissions',
      value: pendingAdmissions || 0,
      note: pendingAdmissions && pendingAdmissions > 0 ? 'Urgent: Awaiting approval review' : 'Queue fully cleared',
      bg: pendingAdmissions && pendingAdmissions > 0 ? 'bg-amber-50/50 border-amber-100 ring-1 ring-amber-50' : 'bg-white border-slate-200',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
      label: 'Collected (This Month)',
      value: formatCurrency(totalCollectedThisMonth),
      note: 'Recorded physical collections',
      bg: 'bg-white border-slate-200',
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
      label: 'Overdue Dues',
      value: formatCurrency(totalOverdue),
      note: 'Unpaid expired installments',
      bg: totalOverdue > 0 ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-slate-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Welcome to the Gurukul administrative command center. Oversee admissions, tracking logs, and dynamic web content.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((c, idx) => (
          <div key={idx} className={`p-6 rounded-3xl border shadow-sm space-y-3 ${c.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{c.label}</span>
              {c.icon}
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{c.value}</div>
            <p className="text-[10px] text-slate-400 font-semibold">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Main Roster grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Activity Feeds */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recent Admissions applications */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-950 text-base">Recent Registrations</h3>
              <Link href={ROUTES.ADMIN.ADMISSIONS} className="text-xs font-semibold text-primary hover:text-primary-800 transition-colors flex items-center gap-0.5 group">
                Review Queue
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {recentAdmissions && recentAdmissions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentAdmissions.map((adm) => (
                  <div key={adm.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 block">{adm.student_full_name}</span>
                      <span className="text-xs text-slate-400">
                        Applying for {adm.applying_for_class} • {formatDate(adm.created_at)}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      adm.status === 'pending'
                        ? 'bg-warning-50 border-warning-100 text-warning'
                        : adm.status === 'approved'
                        ? 'bg-success-50 border-success-100 text-success'
                        : 'bg-destructive-50 border-destructive-100 text-destructive'
                    }`}>
                      {adm.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-4 text-center">No recent applications submitted.</p>
            )}
          </div>

          {/* Recent Payments logs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-950 text-base">Recent Payment Influx</h3>
              <Link href={ROUTES.ADMIN.FEES} className="text-xs font-semibold text-primary hover:text-primary-800 transition-colors flex items-center gap-0.5 group">
                All Ledgers
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {recentPayments && recentPayments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentPayments.map((p) => {
                  const studentInfo: any = p.students;
                  const profileName = studentInfo?.profiles?.full_name || 'Student';

                  return (
                    <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 block">{profileName}</span>
                        <span className="text-xs text-slate-400">
                          {p.receipt_number} • {formatDate(p.issued_at)}
                        </span>
                      </div>
                      <div className="text-right leading-tight">
                        <span className="font-bold text-slate-800 text-sm block">{formatCurrency(p.amount)}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                          {p.payment_method}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-4 text-center">No payment transactions recorded this week.</p>
            )}
          </div>
        </div>

        {/* Right Column: Custom Visual Charts & Web Inquiries */}
        <div className="lg:col-span-4 space-y-8">
          {/* Custom CSS Bar Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-slate-950 text-base">Active Roster Breakdown</h3>
            <div className="h-44 flex items-end justify-around border-b border-slate-100 pb-2">
              {chartData.map((c, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-12">
                  <div
                    style={{ height: `${c.height}%` }}
                    className="w-full bg-gradient-to-t from-primary to-primary-400 rounded-t-lg min-h-[8px] relative group"
                  >
                    {/* Tooltip on hover */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                      {c.count} Students
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 text-center font-semibold leading-normal truncate w-full">
                    {c.label.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Total Active: {activeStudents || 0}</span>
              <span>Class Categories</span>
            </div>
          </div>

          {/* Web Inquiries (Contact submissions) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-950 text-base">Web Inquiries</h3>
              <Link href={ROUTES.ADMIN.ANALYTICS} className="text-xs font-semibold text-primary hover:text-primary-800 transition-colors flex items-center gap-0.5 group">
                All Messages
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {recentInquiries && recentInquiries.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="py-3 first:pt-0 last:pb-0 space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{inq.full_name}</span>
                      <span className="text-[9px] text-slate-400">{formatDate(inq.created_at)}</span>
                    </div>
                    <p className="text-slate-500 line-clamp-2 text-xs leading-normal">
                      {inq.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-4 text-center">No contact inquiries received.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
