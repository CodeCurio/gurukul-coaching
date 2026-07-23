import { createClient } from '@/lib/supabase/server';

import CoursesAndFeesManager from './courses-and-fees-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  let courses: any[] = [];
  let standardFees: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch all courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .order('class_level', { ascending: true })
      .order('display_order', { ascending: true });

    if (coursesData) {
      courses = coursesData;
    }

    // Fetch standard fees templates
    const { data: feesData } = await supabase
      .from('standard_fees')
      .select('*');

    if (feesData) {
      standardFees = feesData;
    }
  } catch (error) {
    console.error('Error fetching courses and fee templates:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Courses & Tuition Structures</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Add or edit class subjects, adjust standard tuition fees, and configure installment counts.
        </p>
      </div>

      <CoursesAndFeesManager courses={courses} standardFees={standardFees} />
    </div>
  );
}
