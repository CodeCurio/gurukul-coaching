'use client';

import { useState } from 'react';
import { Download, BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { formatCurrency } from '../../../../lib/utils/format-currency';

interface StudentRow {
  roll_number: string;
  full_name: string;
  current_class: string;
  phone_number: string;
  is_active: boolean;
}

interface CollectionRow {
  receipt_number: string;
  student_name: string;
  amount: number;
  payment_method: string;
  issued_at: string;
}

interface AnalyticsClientProps {
  studentsData: StudentRow[];
  collectionsData: CollectionRow[];
  classCounts: { label: string; count: number; percentage: number }[];
  collectionMonthly: { month: string; amount: number; percentage: number }[];
}

export default function AnalyticsClient({
  studentsData,
  collectionsData,
  classCounts,
  collectionMonthly,
}: AnalyticsClientProps) {
  const [exporting, setExporting] = useState(false);

  const exportStudents = () => {
    setExporting(true);
    try {
      const headers = ['Roll Number', 'Student Name', 'Class Level', 'Phone Number', 'Active Status'];
      const rows = studentsData.map((s) => [
        `"${s.roll_number}"`,
        `"${s.full_name}"`,
        `"${s.current_class}"`,
        `"${s.phone_number}"`,
        s.is_active ? 'Active' : 'Inactive',
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'gurukul_students_roster.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const exportCollections = () => {
    setExporting(true);
    try {
      const headers = ['Receipt Number', 'Student Name', 'Amount Collected (INR)', 'Payment Mode', 'Issued At'];
      const rows = collectionsData.map((c) => [
        `"${c.receipt_number}"`,
        `"${c.student_name}"`,
        c.amount,
        `"${c.payment_method.toUpperCase()}"`,
        `"${new Date(c.issued_at).toLocaleDateString()}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'gurukul_collections_ledger.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const totalCollected = collectionsData.reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <div className="space-y-8">
      {/* Report Exports panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-lg">Download Roster & Ledger Audits</h3>
          <p className="text-slate-500 text-xs sm:text-sm">
            Generate clean CSV data logs containing active registers and physical cash ledger transactions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={exportStudents}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Students CSV
          </button>
          <button
            onClick={exportCollections}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary-800 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" /> Export Collections CSV
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Class Enrollment Distribution Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Users className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-950 text-base">Class Group Distributions</h3>
          </div>
          <div className="h-48 flex items-end justify-around pb-2 border-b border-slate-100">
            {classCounts.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-16">
                <div
                  style={{ height: `${Math.max(8, item.percentage)}%` }}
                  className="w-full bg-gradient-to-t from-primary to-primary-400 rounded-t-lg relative group min-h-[8px]"
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    {item.count} Active
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-wider truncate w-full">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            <span>Roster Size: {studentsData.length}</span>
            <span>Batch Categories</span>
          </div>
        </div>

        {/* Monthly Collections Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <TrendingUp className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-950 text-base">Monthly Income Influx (Last 6 Months)</h3>
          </div>
          <div className="h-48 flex items-end justify-around pb-2 border-b border-slate-100">
            {collectionMonthly.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-16">
                <div
                  style={{ height: `${Math.max(8, item.percentage)}%` }}
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg relative group min-h-[8px]"
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-wider truncate w-full">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            <span>Aggregated Income: {formatCurrency(totalCollected)}</span>
            <span>Collection Timeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
