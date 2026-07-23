import { createClient } from '@/lib/supabase/server';

import HomepageForm from './homepage-form';

export const dynamic = 'force-dynamic';

export default async function AdminCmsHomepagePage() {
  let content = {
    hero_title: 'Unlocking Academic Excellence In-Person',
    hero_subtitle:
      'Gurukul Coaching Institute provides disciplined, concept-driven offline coaching for class 1 to 12. Weekly subjective tests, detailed analysis, and parent alignment.',
    cta_primary_label: 'Apply for Admission',
    cta_secondary_label: 'Check Status',
    stat_students_count: '1,200+',
    stat_students_label: 'Students Taught',
    stat_selection_count: '98%',
    stat_selection_label: 'Class Score Success',
    stat_experience_count: '12+',
    stat_experience_label: 'Years of Excellence',
  };

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('cms_content')
      .select('content')
      .eq('section_key', 'homepage_hero')
      .maybeSingle();

    if (data?.content) {
      content = { ...content, ...(data.content as any) };
    }
  } catch (error) {
    console.error('Error fetching homepage CMS hero content:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Homepage CMS Editor</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Modify the primary landing titles, subheadings, and stats totals displayed on the homepage.
        </p>
      </div>

      <HomepageForm initialContent={content} />
    </div>
  );
}
