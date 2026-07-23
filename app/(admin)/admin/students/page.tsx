import { createClient } from '../../../../lib/supabase/server';
import StudentFilterBar from './filter-bar';
import Link from 'next/link';
import { ROUTES } from '../../../../lib/constants/routes';
import { Users, UserSquare2, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface StudentsPageProps {
  searchParams: Promise<{
    query?: string;
    classLevel?: string;
    status?: string;
  }>;
}

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const resolvedParams = await searchParams;
  const queryVal = resolvedParams.query || '';
  const classLevelVal = resolvedParams.classLevel || 'all';
  const statusVal = resolvedParams.status || 'all';

  let students: any[] = [];
  try {
    const supabase = await createClient();

    // Construct the query based on whether search keyword is provided
    let queryBuilder;
    if (queryVal) {
      queryBuilder = supabase
        .from('students')
        .select('id, roll_number, current_class, is_active, profiles!inner(full_name, phone_number)')
        .or(`roll_number.ilike.%${queryVal}%,profiles.full_name.ilike.%${queryVal}%`);
    } else {
      queryBuilder = supabase
        .from('students')
        .select('id, roll_number, current_class, is_active, profiles(full_name, phone_number)');
    }

    if (classLevelVal !== 'all') {
      queryBuilder = queryBuilder.eq('current_class', classLevelVal);
    }

    if (statusVal !== 'all') {
      queryBuilder = queryBuilder.eq('is_active', statusVal === 'active');
    }

    // Sort by roll number
    queryBuilder = queryBuilder.order('roll_number', { ascending: true });

    const { data } = await queryBuilder;
    if (data) {
      students = data;
    }
  } catch (error) {
    console.error('Error querying student database roster:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Student Roster</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Manage academic profiles, course subject enrollments, and status parameters.
          </p>
        </div>
      </div>

      {/* Filter Options */}
      <StudentFilterBar />

      {/* Roster Table */}
      {students.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-lg">Student Accounts ({students.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-4 px-6">Roll Number</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Class Level</th>
                  <th className="py-4 px-6">Contact Phone</th>
                  <th className="py-4 px-6">Roster Status</th>
                  <th className="py-4 px-6 text-right">Profile Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {students.map((std) => {
                  const profile: any = std.profiles;
                  const fullName = profile?.full_name || 'Unknown';
                  const phone = profile?.phone_number || '-';

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-900 font-bold">{std.roll_number}</td>
                      <td className="py-4 px-6 flex items-center gap-2 font-bold text-slate-800">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {fullName.charAt(0)}
                        </div>
                        {fullName}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-500">{std.current_class}</td>
                      <td className="py-4 px-6 font-medium text-slate-500">{phone}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          std.is_active
                            ? 'bg-success-50 border-success-100 text-success'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                          {std.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`${ROUTES.ADMIN.STUDENTS}/${std.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary-800 bg-primary-50 border border-primary-100 rounded-xl transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
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
          <div className="text-4xl text-slate-300">👥</div>
          <h3 className="text-lg font-bold text-slate-800">No Students Found</h3>
          <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
            We could not find any active student matching the search keyword or filter settings.
          </p>
        </div>
      )}
    </div>
  );
}
