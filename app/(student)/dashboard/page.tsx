import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { ROUTES } from '../../../lib/constants/routes';
import { CreditCard, BookOpen, Bell, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils/format-currency';
import { formatDate } from '../../../lib/utils/format-date';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardHome() {
  const supabase = await createClient();

  // Get user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  // 1. Fetch Student demographic details
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, profiles (full_name, avatar_url, phone_number)')
    .eq('id', user.id)
    .single();

  if (studentError || !student) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-red-500">Student enrollment record not found.</h3>
        <p className="text-slate-500 text-xs sm:text-sm">Please contact the administrator desk.</p>
      </div>
    );
  }

  // 2. Fetch the next pending or overdue fee installment
  let nextInstallment = null;
  try {
    const { data: feeRecords } = await supabase
      .from('student_fees')
      .select('id')
      .eq('student_id', user.id)
      .limit(1);

    if (feeRecords && feeRecords.length > 0) {
      const { data: insts } = await supabase
        .from('fee_installments')
        .select('*')
        .eq('student_fee_id', feeRecords[0].id)
        .in('status', ['pending', 'overdue', 'partially_paid'])
        .order('due_date', { ascending: true })
        .limit(1);

      if (insts && insts.length > 0) {
        nextInstallment = insts[0];
      }
    }
  } catch (err) {
    console.error('Error fetching dashboard fee summary:', err);
  }

  // 3. Fetch Enrolled Courses
  let courses: any[] = [];
  try {
    const { data } = await supabase
      .from('student_courses')
      .select('*, courses (*)')
      .eq('student_id', user.id);
    if (data) {
      courses = data.map((sc: any) => sc.courses).filter(Boolean);
    }
  } catch (err) {
    console.error('Error fetching dashboard courses:', err);
  }

  // 4. Fetch Recent Notifications (limit to 3)
  let notifications: any[] = [];
  try {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`target_student_id.eq.${user.id},target_student_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) {
      notifications = data;
    }
  } catch (err) {
    console.error('Error fetching dashboard notifications:', err);
  }

  const profileData: any = student.profiles;
  const firstName = profileData.full_name.split(' ')[0];
  const isProfileIncomplete = !profileData.avatar_url || !profileData.phone_number;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hello, {firstName}!</h1>
        <p className="text-slate-500 text-sm">Welcome back to your academic console. Here is your overview for today.</p>
      </div>

      {/* Profile Completion Alert */}
      {isProfileIncomplete && (
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Complete Your Profile Details</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                You have not uploaded a profile photograph or verified your phone number yet. Keeping details updated ensures communication reaches you.
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.STUDENT.PROFILE}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-800 transition-colors shrink-0"
          >
            Update Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fees Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <CreditCard className="w-5 h-5" />
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                Fee Status
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-lg">Next Due Installment</h3>
              {nextInstallment ? (
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-slate-900">
                    {formatCurrency(nextInstallment.amount_due - nextInstallment.amount_paid)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Due on {formatDate(nextInstallment.due_date)}
                    {nextInstallment.status === 'overdue' && (
                      <span className="ml-2 text-destructive font-bold uppercase tracking-wider text-[9px] bg-destructive-50 border border-destructive-100 px-1.5 py-0.5 rounded-full">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-success flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> All fees settled!
                  </p>
                  <p className="text-xs text-slate-400">
                    No outstanding or pending fee installments for this academic year.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href={ROUTES.STUDENT.FEES}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-800 transition-colors group"
            >
              View Full Fee Statement
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Enrolled Courses Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                Class {student.current_class}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-lg">My Subject Enrollments</h3>
              {courses.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {courses.map((course) => (
                    <span
                      key={course.id}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full border border-slate-200"
                    >
                      {course.subject_name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs sm:text-sm">
                  You are not currently enrolled in any subjects. Please contact the administrative desk to configure subjects.
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href={ROUTES.STUDENT.COURSES}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-800 transition-colors group"
            >
              View Curriculum Details
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-lg">Recent Announcements</h3>
          </div>
          <Link
            href={ROUTES.STUDENT.NOTIFICATIONS}
            className="text-xs font-semibold text-primary hover:text-primary-800 transition-colors"
          >
            View All
          </Link>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4 divider-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className="space-y-1 pt-3 first:pt-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 text-sm">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{formatDate(n.created_at)}</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs sm:text-sm">
            No active announcements. Updates will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
