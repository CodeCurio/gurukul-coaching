import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/constants/routes';

import { BookOpen, Book, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentCoursesPage() {
  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Fetch student class details
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('current_class')
    .eq('id', user.id)
    .single();

  if (studentError || !student) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Fetch subject enrollments
  let courses: any[] = [];
  try {
    const { data } = await supabase
      .from('student_courses')
      .select('*, courses (*)')
      .eq('student_id', user.id)
      .order('enrolled_at', { ascending: true });

    if (data) {
      courses = data.map((sc: any) => sc.courses).filter(Boolean);
    }
  } catch (error) {
    console.error('Error fetching student enrolled subjects:', error);
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Subjects</h1>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">
          Enrolled in {student.current_class} Batches
        </p>
      </div>

      {/* Courses List */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 bg-primary-50 text-primary rounded-xl flex items-center justify-center border border-primary-100">
                    <Book className="w-4.5 h-4.5" />
                  </span>
                  <span className="text-[10px] text-success font-bold uppercase tracking-wider bg-success-50 border border-success-100 px-2 py-0.5 rounded-full">
                    Active Enrollment
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {course.subject_name}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    {course.description || `Specialized classroom training and guidance for ${student.current_class} ${course.subject_name} examinations.`}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-success font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Syllabus Activated
                </span>
                <span>Offline Batches Only</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3 max-w-md mx-auto">
          <div className="text-4xl">📚</div>
          <h3 className="text-lg font-bold text-slate-800">No Enrolled Subjects</h3>
          <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
            You are not enrolled in any class subjects yet. Please reach out to the administrator desk to map subjects to your student profile.
          </p>
        </div>
      )}
    </div>
  );
}
