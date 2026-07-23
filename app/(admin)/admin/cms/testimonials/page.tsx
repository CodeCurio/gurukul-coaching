import { createClient } from '@/lib/supabase/server';

import TestimonialsManager from './testimonials-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCmsTestimonialsPage() {
  let testimonials: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) {
      testimonials = data;
    }
  } catch (error) {
    console.error('Error fetching testimonials CMS entries list:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Parent & Student Testimonials</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Adjust, add, or toggle parent recommendations featured dynamically on the home page.
        </p>
      </div>

      <TestimonialsManager initialTestimonials={testimonials} />
    </div>
  );
}
