import Link from 'next/link';
import { ArrowRight, Award, ShieldCheck, Users, Clock } from 'lucide-react';
import HeroSection from '../../components/public/hero-section';
import FounderSection from '../../components/public/founder-section';
import ResultsSection from '../../components/public/results-section';
import AdmissionProcess from '../../components/public/admission-process';
import FAQSection from '../../components/public/faq-section';
import CourseCard from '../../components/public/course-card';
import TestimonialCard from '../../components/public/testimonial-card';
import GalleryGrid from '../../components/public/gallery-grid';
import { createClient } from '../../lib/supabase/server';
import { ROUTES } from '../../lib/constants/routes';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let hero = null;
  let stats = {
    stats_years: 12,
    stats_students: 450,
    stats_subjects: 15,
    stats_success_rate: 98,
  };
  let courses: any[] = [];
  let testimonials: any[] = [];
  let galleryImages: any[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch Hero Content
    const { data: heroData } = await supabase
      .from('cms_content')
      .select('content')
      .eq('section_key', 'homepage_hero')
      .maybeSingle();
    if (heroData?.content) {
      hero = heroData.content as any;
    }

    // 2. Fetch Stats
    const { data: statsData } = await supabase
      .from('cms_content')
      .select('content')
      .eq('section_key', 'homepage_stats')
      .maybeSingle();
    if (statsData?.content) {
      stats = statsData.content as any;
    }

    // 3. Fetch Featured Courses (limit to 4)
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('class_level', { ascending: true })
      .order('display_order', { ascending: true })
      .limit(4);
    if (coursesData) {
      courses = coursesData;
    }

    // 4. Fetch Testimonials (limit to 3)
    const { data: testimonialsData } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .limit(3);
    if (testimonialsData) {
      testimonials = testimonialsData;
    }

    // 5. Fetch Gallery Images (limit to 3 for homepage preview)
    const { data: galleryData } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .limit(3);
    if (galleryData) {
      galleryImages = galleryData;
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: 'Small Batch Sizes',
      description: 'Maximum 20 students per batch to ensure individual attention and doubt resolution.',
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: 'Structured Homework & Tests',
      description: 'Daily assignments and mandatory weekly testing with descriptive feedback worksheets.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: 'Experienced Faculty',
      description: 'Expert coaching mentors with extensive experience in Class 10 & 12 board preparations.',
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: 'Regular Progress Updates',
      description: 'Monthly reports and visual score analysis shared directly in the parent meetings.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section (Full-Screen Carousel) */}
      <HeroSection hero={hero} />

      {/* 2. Founder & Director Spotlight */}
      <FounderSection />

      {/* 3. Statistics Band */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-accent">{stats.stats_years}+</div>
              <div className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Years of Education</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-accent">{stats.stats_students}+</div>
              <div className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Students Guided</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-accent">{stats.stats_subjects}+</div>
              <div className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Subjects Taught</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-accent">{stats.stats_success_rate}%</div>
              <div className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Pass Percentage</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us / Learning Framework */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Learning Framework
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            Gurukul focuses on a structured offline methodology to prepare students for core academic performance.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100">
                {feature.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-base">{feature.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Board Results & Hall of Fame Toppers Wall */}
      <ResultsSection />



      {/* 7. Admission Process 4-Step Roadmap */}
      <AdmissionProcess />

      {/* 8. Testimonials / Parent Reviews */}
      {testimonials.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                What Parents Say About Us
              </h2>
              <p className="text-slate-500 text-sm">
                Feedback from students and families who trust Gurukul for their education.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. Gallery Preview */}
      {galleryImages.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Our Campus & Classrooms
              </h2>
              <p className="text-slate-500 text-sm">
                A look inside our teaching facilities and student events.
              </p>
            </div>
            <Link
              href={ROUTES.PUBLIC.GALLERY}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-800 transition-colors self-center sm:self-end group"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <GalleryGrid images={galleryImages} />
        </section>
      )}

      {/* 10. Interactive FAQ Accordion */}
      <FAQSection />

      {/* 11. Final Closing Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-900 via-slate-900 to-secondary-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Ready to Secure Your Child's Academic Success?
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Register for admission today. The administrative team will review your application and schedule a physical campus interview.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={ROUTES.PUBLIC.REGISTER}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-slate-950 bg-gradient-to-r from-accent to-accent-400 hover:brightness-110 rounded-xl shadow-lg transition-all duration-150 group"
              >
                Start Registration Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={ROUTES.PUBLIC.CONTACT}
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-white bg-transparent hover:bg-white/10 border border-white/30 rounded-xl transition-colors"
              >
                Inquire via Call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
