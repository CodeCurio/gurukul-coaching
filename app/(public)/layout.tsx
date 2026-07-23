import React from 'react';
import Navbar from '../../components/public/navbar';
import Footer from '../../components/public/footer';
import FloatingContact from '../../components/public/floating-contact';
import { createClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  let cmsFooter = null;

  try {
    const supabase = await createClient();

    // Fetch global settings
    const { data: settingsData } = await supabase
      .from('institute_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settingsData) {
      settings = settingsData;
    }

    // Fetch footer CMS tagline
    const { data: footerData } = await supabase
      .from('cms_content')
      .select('content')
      .eq('section_key', 'footer_content')
      .maybeSingle();

    if (footerData && footerData.content) {
      cmsFooter = footerData.content as any;
    }
  } catch (error) {
    console.error('Error fetching layout data from Supabase:', error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer settings={settings} cmsFooter={cmsFooter} />
      <FloatingContact />
    </div>
  );
}
