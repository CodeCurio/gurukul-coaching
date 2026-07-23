import { Book, CheckCircle2 } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    class_level: string;
    subject_name: string;
    description?: string | null;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Class level tag */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-primary-50 rounded-full border border-primary-100">
            <Book className="w-3.5 h-3.5" />
            {course.class_level}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono font-medium uppercase">
            In-Person Batches
          </span>
        </div>

        {/* Subject and description */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
            {course.subject_name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {course.description || `Specialized classroom training and guidance for ${course.class_level} ${course.subject_name} examinations.`}
          </p>
        </div>
      </div>

      {/* Roster detail */}
      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 text-success">
          <CheckCircle2 className="w-4 h-4" /> Syllabus Covered
        </span>
        <span>Offline Doubts Batch Included</span>
      </div>
    </div>
  );
}
export type { CourseCardProps };
