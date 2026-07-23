import { createClient } from '@/lib/supabase/server';

import FooterForm from './footer-form';

export const dynamic = 'force-dynamic';

export default async function AdminCmsFooterPage() {
  let content = {
    description: 'Gurukul is a premium offline tutoring institute offering disciplined, rigorous classroom teaching for grades 1 to 12. Establishing solid conceptual foundations for board exams.',
    copyright: `© ${new Date().getFullYear()} Gurukul Coaching Institute. All Rights Reserved.`,
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
  };

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('cms_content')
      .select('content')
      .eq('section_key', 'footer_settings')
      .maybeSingle();

    if (data?.content) {
      content = { ...content, ...(data.content as any) };
    }
  } catch (error) {
    console.error('Error querying footer CMS content:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Footer CMS Editor</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Modify the brand summary description and config social networking handle URLs displayed in the site footer.
        </p>
      </div>

      <FooterForm initialContent={content} />
    </div>
  );
}
