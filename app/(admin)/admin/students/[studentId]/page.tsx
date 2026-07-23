import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StudentProfileEditor from './student-profile-editor';
import { ROUTES } from '@/lib/constants/routes';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface StudentDetailPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function AdminStudentDetailPage({ params }: StudentDetailPageProps) {
  const resolvedParams = await params;
  const studentId = resolvedParams.studentId;

  const supabase = await createClient();

  // 1. Fetch Student demographics
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, profiles (*)')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    redirect(ROUTES.ADMIN.STUDENTS);
  }

  // 2. Fetch Enrollments
  const { data: enrollmentData } = await supabase
    .from('student_courses')
    .select('*, courses (*)')
    .eq('student_id', studentId);

  const enrollments = (enrollmentData || [])
    .map((e: any) => e.courses)
    .filter(Boolean)
    .map((c: any) => ({ id: c.id, subject_name: c.subject_name }));

  // 3. Fetch Available subjects for this class
  const { data: classCourses } = await supabase
    .from('courses')
    .select('id, subject_name')
    .eq('class_level', student.current_class)
    .eq('is_published', true);

  const enrolledIds = new Set(enrollments.map((e) => e.id));
  const availableCourses = (classCourses || []).filter((c) => !enrolledIds.has(c.id));

  // 4. Fetch Fee Ledger & Installments
  const { data: feeData } = await supabase
    .from('student_fees')
    .select('*, fee_installments (*)')
    .eq('student_id', studentId)
    .maybeSingle();

  let feeLedger = null;
  if (feeData) {
    feeLedger = {
      total_fee_amount: Number(feeData.total_fee_amount),
      discount_amount: Number(feeData.discount_amount),
      scholarship_amount: Number(feeData.scholarship_amount),
      net_payable_amount: Number(feeData.net_payable_amount),
      installments: (feeData.fee_installments || [])
        .map((inst: any) => ({
          installment_number: inst.installment_number,
          amount_due: Number(inst.amount_due),
          amount_paid: Number(inst.amount_paid),
          due_date: inst.due_date,
          status: inst.status,
        }))
        .sort((a: any, b: any) => a.installment_number - b.installment_number),
    };
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={ROUTES.ADMIN.STUDENTS}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students Roster
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {student.profiles.full_name}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">
            Manage profile settings, subjects mapping, and payment history.
          </p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            student.is_active
              ? 'bg-success-50 border-success-100 text-success'
              : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
            {student.is_active ? 'Active student' : 'Deactivated record'}
          </span>
        </div>
      </div>

      <StudentProfileEditor
        student={student as any}
        enrollments={enrollments}
        availableCourses={availableCourses}
        feeLedger={feeLedger}
      />
    </div>
  );
}
