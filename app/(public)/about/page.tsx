import { createClient } from '@/lib/supabase/server';

import { BookOpen, Target, Eye } from 'lucide-react';

export const revalidate = 3600;

export default async function AboutPage() {
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
    console.error('Error fetching about page data:', error);
  }

  return (
    <div className="pt-28 pb-16 space-y-20">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About Gurukul Institute
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Nurturing academic excellence, rigorous conceptual understanding, and character development in classroom environments.
        </p>
      </section>

      {/* Story section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary border border-primary-100">
              <BookOpen className="w-3.5 h-3.5" />
              Our Foundational Story
            </div>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              {story.story_heading}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {story.story_text}
            </p>
          </div>
          <div className="aspect-video lg:aspect-square bg-gradient-to-br from-primary-800 to-indigo-950 rounded-3xl shadow-xl flex items-center justify-center p-8 text-center text-white border border-slate-200 order-1 lg:order-2">
            <div className="space-y-2">
              <div className="text-4xl">📚</div>
              <h4 className="font-bold text-lg">In-Person Classrooms</h4>
              <p className="text-white/60 text-xs max-w-xs leading-relaxed">
                We believe that human interaction, physical textbooks, and personal attention are critical for deep comprehension.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-primary-50 text-primary rounded-xl flex items-center justify-center border border-primary-100">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{mission.mission_heading}</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{mission.mission_text}</p>
          </div>

          {/* Vision */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-accent-50 text-accent rounded-xl flex items-center justify-center border border-accent-100">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{vision.vision_heading}</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{vision.vision_text}</p>
          </div>
        </div>
      </section>

      {/* Academic Framework Rules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Our Pedagogical Guidelines</h2>
          <p className="text-slate-500 text-sm">Four core values that define the student experience at Gurukul.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="text-xl font-bold text-primary">01 / Rigor</div>
            <h4 className="font-semibold text-slate-900">Concept Mastery</h4>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              We do not teach formulas. We teach derivations. Conceptual clarity leads to problem-solving capability.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xl font-bold text-primary">02 / Assessment</div>
            <h4 className="font-semibold text-slate-900">Sunday Assessment</h4>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Every Sunday, students sit for a subjective exam mapping to board standards. Progress is assessed weekly.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xl font-bold text-primary">03 / Communication</div>
            <h4 className="font-semibold text-slate-900">Parent Alignment</h4>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Attendance thresholds and test scores are updated. We align with families to support student growth.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xl font-bold text-primary">04 / Focus</div>
            <h4 className="font-semibold text-slate-900">Offline Only</h4>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              No online dashboards for classes. Classroom education ensures focus, collaboration, and high discipline.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
