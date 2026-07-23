import { createClient } from '@/lib/supabase/server';

import AboutCMSForm from './about-cms-form';

export const dynamic = 'force-dynamic';

export default async function AdminCmsAboutPage() {
  let story = {
    story_heading: 'Our Journey Since 2014',
    story_text:
      'Gurukul was founded with a single mission: to make premium offline education accessible and effective. Over the last decade, we have nurtured thousands of students to achieve their board exam and academic milestones through rigorous training, personal support, and disciplined feedback loops.',
  };
  let mission = {
    mission_heading: 'Our Core Mission',
    mission_text:
      'To inspire academic curiosity, build structural conceptual foundations, and foster an environment where offline classroom education transforms into life-long confidence.',
  };
  let vision = {
    vision_heading: 'Our Inspiring Vision',
    vision_text:
      'To remain the most trusted local offline learning hub that values student comprehension, parental transparency, and pedagogical discipline above all else.',
  };

  try {
    const supabase = await createClient();

    const { data: storyData } = await supabase
      .from('cms_content')
      .select('content')
      .eq('section_key', 'about_story')
      .maybeSingle();
    if (storyData?.content) story = storyData.content as any;

    const { data: missionData } = await supabase
      .from('cms_content')
      .select('content')
      .eq('section_key', 'about_mission')
      .maybeSingle();
    if (missionData?.content) mission = missionData.content as any;

    const { data: visionData } = await supabase
      .from('cms_content')
      .select('content')
      .eq('section_key', 'about_vision')
      .maybeSingle();
    if (visionData?.content) vision = visionData.content as any;
  } catch (error) {
    console.error('Error fetching about CMS content:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">About Page CMS Editor</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Modify the foundational narrative, core mission statements, and pedagogical vision fields.
        </p>
      </div>

      <AboutCMSForm initialStory={story} initialMission={mission} initialVision={vision} />
    </div>
  );
}
