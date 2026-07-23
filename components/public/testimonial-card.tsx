import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: {
    id: string;
    author_name: string;
    author_role?: string | null;
    content: string;
    avatar_url?: string | null;
  };
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      {/* Decorative quote icon */}
      <div className="absolute top-4 right-4 text-indigo-50/50 -z-0">
        <Quote className="w-12 h-12 fill-current" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Quote Content */}
        <p className="text-slate-600 text-sm leading-relaxed italic font-sans">
          "{testimonial.content}"
        </p>

        {/* Profile Info */}
        <div className="flex items-center gap-3 pt-2">
          {testimonial.avatar_url ? (
            <img
              src={testimonial.avatar_url}
              alt={testimonial.author_name}
              className="w-10 h-10 rounded-full object-cover border border-slate-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">
              {testimonial.author_name.charAt(0)}
            </div>
          )}
          <div className="leading-tight">
            <h5 className="font-semibold text-slate-900 text-sm">{testimonial.author_name}</h5>
            {testimonial.author_role && (
              <span className="text-xs text-slate-500 font-medium">{testimonial.author_role}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
