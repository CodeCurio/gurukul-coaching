import { createClient } from '../../../../lib/supabase/server';
import Link from 'next/link';
import { ROUTES } from '../../../../lib/constants/routes';
import { formatDate } from '../../../../lib/utils/format-date';
import { GraduationCap, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdmissionsPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function AdminAdmissionsPage({ searchParams }: AdmissionsPageProps) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || 'pending';

  let admissions: any[] = [];
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('admissions')
      .select('*')
      .eq('status', activeTab)
      .order('created_at', { ascending: false });

    if (data) {
      admissions = data;
    }
  } catch (error) {
    console.error('Error fetching admissions applications:', error);
  }

  const tabs = [
    { key: 'pending', label: 'Pending Applications' },
    { key: 'approved', label: 'Approved Students' },
    { key: 'rejected', label: 'Rejected Inquiries' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admissions Review</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Review, approve, or reject student admission registrations submitted online.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`${ROUTES.ADMIN.ADMISSIONS}?tab=${t.key}`}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Queue List Table */}
      {admissions.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-lg">Applications Queue ({admissions.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-4 px-6">Applicant Name</th>
                  <th className="py-4 px-6">Applying Class</th>
                  <th className="py-4 px-6">Guardian Name</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Submitted On</th>
                  <th className="py-4 px-6 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-bold text-slate-900">{adm.student_full_name}</td>
                    <td className="py-4.5 px-6 text-slate-800">{adm.applying_for_class}</td>
                    <td className="py-4.5 px-6 font-medium text-slate-500">{adm.guardian_name}</td>
                    <td className="py-4.5 px-6 font-medium text-slate-500">{adm.phone_number}</td>
                    <td className="py-4.5 px-6 font-medium text-slate-500">{formatDate(adm.created_at)}</td>
                    <td className="py-4.5 px-6 text-right">
                      <Link
                        href={`${ROUTES.ADMIN.ADMISSIONS}/${adm.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary-800 bg-primary-50 border border-primary-100 rounded-xl transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3 max-w-md mx-auto">
          <div className="text-4xl text-slate-300">📥</div>
          <h3 className="text-lg font-bold text-slate-800">Queue is Clear</h3>
          <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
            There are no registrations listed in this queue categories.
          </p>
        </div>
      )}
    </div>
  );
}
