import { createClient } from '@/lib/supabase/server';
import CourseCard from '@/components/public/course-card';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';


// Tell Next.js this page is dynamically rendered based on search params
export const dynamic = 'force-dynamic';

interface CoursesPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.filter || 'all';

  let courses: any[] = [];
  try {
    const supabase = await createClient();

    let query = supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('class_level', { ascending: true })
      .order('display_order', { ascending: true });

    const { data } = await query;
    if (data) {
      courses = data;
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }

  // Filter courses in server logic based on selection
  const filteredCourses = courses.filter((course) => {
    if (currentFilter === 'all') return true;

    // Extract class digit
    const classNum = parseInt(course.class_level.replace(/\D/g, ''), 10);

    if (currentFilter === 'primary') {
      return classNum >= 1 && classNum <= 5;
    } else if (currentFilter === 'middle') {
      return classNum >= 6 && classNum <= 8;
    } else if (currentFilter === 'secondary') {
      return classNum >= 9 && classNum <= 12;
    }
    return true;
  });

  const filterOptions = [
    { key: 'all', label: 'All Classes' },
    { key: 'primary', label: 'Primary (Class 1-5)' },
    { key: 'middle', label: 'Middle (Class 6-8)' },
    { key: 'secondary', label: 'Senior Secondary (Class 9-12)' },
  ];

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Our Roster of Courses</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          Explore the academic batches and subjects we guide. Select your class range below to view detailed curriculum listings.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {filterOptions.map((opt) => {
          const isActive = currentFilter === opt.key;
          return (
            <Link
              key={opt.key}
              href={`${ROUTES.PUBLIC.COURSES}?filter=${opt.key}`}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {/* Course List Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl max-w-md mx-auto space-y-3">
          <div className="text-4xl">📚</div>
          <h3 className="font-bold text-slate-950">No Courses Available</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed px-6">
            We currently do not have published subjects listed for this specific filter. Please check back later or contact the admin desk.
          </p>
        </div>
      )}
    </div>
  );
}
