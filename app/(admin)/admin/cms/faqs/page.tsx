import { createClient } from '@/lib/supabase/server';

import FAQsManager from './faqs-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCmsFaqsPage() {
  let faqs: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) {
      faqs = data;
    }
  } catch (error) {
    console.error('Error fetching FAQs list:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active FAQs CMS</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Adjust, add, or toggle clarification guidelines listed dynamically on the landing pages.
        </p>
      </div>

      <FAQsManager initialFaqs={faqs} />
    </div>
  );
}
