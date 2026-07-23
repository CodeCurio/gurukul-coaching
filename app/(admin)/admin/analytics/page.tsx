import { createClient } from '../../../../lib/supabase/server';
import AnalyticsClient from './analytics-client';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // 1. Fetch Students data for CSV
  const { data: studentsList } = await supabase
    .from('students')
    .select('roll_number, current_class, is_active, profiles(full_name, phone_number)')
    .order('roll_number', { ascending: true });

  const studentsData = (studentsList || []).map((s: any) => ({
    roll_number: s.roll_number,
    current_class: s.current_class,
    is_active: s.is_active,
    full_name: s.profiles?.full_name || 'Unknown',
    phone_number: s.profiles?.phone_number || '-',
  }));

  // 2. Fetch Collections data for CSV
  const { data: receiptsList } = await supabase
    .from('fee_receipts')
    .select('receipt_number, amount, payment_method, issued_at, students(profiles(full_name))')
    .order('issued_at', { ascending: false });

  const collectionsData = (receiptsList || []).map((r: any) => {
    const studentData: any = r.students;
    const studentName = studentData?.profiles?.full_name || 'Student';
    return {
      receipt_number: r.receipt_number,
      student_name: studentName,
      amount: Number(r.amount),
      payment_method: r.payment_method,
      issued_at: r.issued_at,
    };
  });

  // 3. Process Class Group Counts
  const classCounts = [
    { label: 'Primary (1-5)', count: 0, percentage: 0 },
    { label: 'Middle (6-8)', count: 0, percentage: 0 },
    { label: 'Secondary (9-12)', count: 0, percentage: 0 },
  ];

  studentsData.forEach((s) => {
    const classNum = parseInt(s.current_class.replace(/\D/g, ''), 10);
    if (classNum >= 1 && classNum <= 5) classCounts[0].count++;
    else if (classNum >= 6 && classNum <= 8) classCounts[1].count++;
    else if (classNum >= 9 && classNum <= 12) classCounts[2].count++;
  });

  const maxClassCount = Math.max(...classCounts.map((c) => c.count));
  classCounts.forEach((c) => {
    if (maxClassCount > 0) {
      c.percentage = Math.round((c.count / maxClassCount) * 100);
    }
  });

  // 4. Process Monthly collections trends (Last 6 months)
  const collectionMonthly: { month: string; amount: number; percentage: number }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const y = d.getFullYear();

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

    // Sum receipts in month range
    const monthlySum = collectionsData
      .filter((r) => {
        const issued = new Date(r.issued_at);
        return issued >= start && issued <= end;
      })
      .reduce((acc, cur) => acc + cur.amount, 0);

    collectionMonthly.push({
      month: `${monthNames[m]} ${y}`,
      amount: monthlySum,
      percentage: 0,
    });
  }

  const maxMonthAmount = Math.max(...collectionMonthly.map((m) => m.amount));
  collectionMonthly.forEach((m) => {
    if (maxMonthAmount > 0) {
      m.percentage = Math.round((m.amount / maxMonthAmount) * 100);
    }
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & Dynamic Reports</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Overview visual parameters of batch selections, collections cycles, and database ledger logs.
        </p>
      </div>

      <AnalyticsClient
        studentsData={studentsData}
        collectionsData={collectionsData}
        classCounts={classCounts}
        collectionMonthly={collectionMonthly}
      />
    </div>
  );
}
