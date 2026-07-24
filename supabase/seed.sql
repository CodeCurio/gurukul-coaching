-- GURUKUL COACHING INSTITUTE SEED SCRIPT
-- Run this script in the Supabase SQL editor to populate default data.

-- 1. Initial Institute Settings
insert into public.institute_settings (institute_name, logo_storage_path, contact_email, contact_phone, address, primary_color)
values (
  'Gurukul Coaching Institute',
  'logo/logo.svg',
  'admissions@gurukulcoaching.com',
  '7985347987',
  'Dhodhepur Chauraha Ramapur Tarabganj Gonda',
  '#4338ca' -- Indigo
) on conflict do nothing;

-- 2. Seed Courses (Subjects)
insert into public.courses (class_level, subject_name, description, is_published, display_order)
values
  -- Class 10
  ('Class 10', 'Mathematics', 'Comprehensive curriculum covering Algebra, Geometry, Trigonometry, and Statistics.', true, 1),
  ('Class 10', 'Science', 'Integrated Science covering Physics, Chemistry, and Biology fundamentals.', true, 2),
  ('Class 10', 'English Literature', 'Study of classic prose, poetry, and advanced english grammar.', true, 3),
  ('Class 10', 'Social Science', 'Covers History, Geography, Civics, and Economics concepts.', true, 4),
  -- Class 12
  ('Class 12', 'Physics', 'In-depth study of Mechanics, Electromagnetism, Optics, and Modern Physics.', true, 1),
  ('Class 12', 'Chemistry', 'Organic, Inorganic, and Physical Chemistry preparation for boards.', true, 2),
  ('Class 12', 'Mathematics', 'Calculus, Vectors, 3D Geometry, and Probability courses.', true, 3),
  -- Middle School
  ('Class 8', 'Mathematics', 'Foundation building in Arithmetic, Geometry, and introductory Algebra.', true, 1),
  ('Class 8', 'Science', 'Basic experiments and foundational science concepts.', true, 2)
on conflict (class_level, subject_name) do nothing;

-- 3. Seed Fee Structures
insert into public.fee_structures (class_level, annual_fee_amount, admission_fee_amount, number_of_installments)
values
  ('Class 1', 12000.00, 2000.00, 4),
  ('Class 2', 12000.00, 2000.00, 4),
  ('Class 3', 12000.00, 2000.00, 4),
  ('Class 4', 15000.00, 2000.00, 4),
  ('Class 5', 15000.00, 2000.00, 4),
  ('Class 6', 18000.00, 2500.00, 4),
  ('Class 7', 18000.00, 2500.00, 4),
  ('Class 8', 20000.00, 2500.00, 4),
  ('Class 9', 24000.00, 3000.00, 4),
  ('Class 10', 28000.00, 3000.00, 4),
  ('Class 11', 35000.00, 4000.00, 4),
  ('Class 12', 40000.00, 4000.00, 4)
on conflict (class_level) do nothing;

-- 4. Seed Testimonials
insert into public.testimonials (author_name, author_role, content, is_published, display_order)
values
  ('Mrs. Sunita Sharma', 'Parent of Class 10 student', 'The dedication of teachers at Gurukul is unmatched. My daughter improved her math scores by 25% within three months of joining the offline batch.', true, 1),
  ('Mr. Rajesh Verma', 'Parent of Class 12 Board student', 'The small batch sizes and personal attention helped my son clear his doubts in Physics instantly. He scored 95% in his board exams.', true, 2),
  ('Aman Gupta', 'Alumni, Class 12 (Batch 2025)', 'Gurukul is not just a coaching center, it is a mentoring institute. The weekly doubt sessions and structural notes were critical for my competitive prep.', true, 3)
on conflict do nothing;

-- 5. Seed FAQs
insert into public.faqs (question, answer, display_order, is_published)
values
  ('What are the timings for Class 9-12 batches?', 'Classes are conducted in the afternoon/evening from 3:00 PM to 7:00 PM, Monday through Saturday. Each subject class is 1 hour long.', 1, true),
  ('Do you provide transportation services?', 'No, since we are an offline center, parents are responsible for their child''s pick-up and drop-off.', 2, true),
  ('What is the mode of payment for fees?', 'We collect payments physically at the institute office. Accepted methods are cash, bank transfers (NEFT/IMPS), cheques, or UPI codes.', 3, true),
  ('How do you track student progress?', 'We conduct offline subjective assessments every Sunday. Detailed mark sheets and attendance logs are shared during monthly parent-teacher meetings.', 4, true)
on conflict do nothing;

-- 6. Seed CMS Content Blocks
insert into public.cms_content (section_key, content)
values
  ('homepage_hero', '{
    "heading": "Empowering Minds, Shaping Successful Futures",
    "subheading": "Gurukul Coaching Institute provides premium offline, in-person coaching for students from Class 1 to 12. We build strong foundations and academic excellence.",
    "image_path": ""
  }'::jsonb),
  ('homepage_stats', '{
    "stats_years": 12,
    "stats_students": 450,
    "stats_subjects": 15,
    "stats_success_rate": 98
  }'::jsonb),
  ('about_story', '{
    "story_heading": "Our Journey Since 2014",
    "story_text": "Gurukul was founded with a single mission: to make premium offline education accessible and effective. Over the last decade, we have nurtured thousands of students to achieve their board exam and academic milestones through rigorous training, personal support, and disciplined feedback loops.",
    "story_image": ""
  }'::jsonb),
  ('about_mission', '{
    "mission_heading": "Our Core Mission",
    "mission_text": "To inspire academic curiosity, build structural conceptual foundations, and foster a environment where offline classroom education transforms into life-long confidence.",
    "mission_image": ""
  }'::jsonb),
  ('about_vision', '{
    "vision_heading": "Our Inspiring Vision",
    "vision_text": "To remain the most trusted local offline learning hub that values student comprehension, parental transparency, and pedagogical discipline above all else.",
    "vision_image": ""
  }'::jsonb),
  ('footer_content', '{
    "tagline": "Nurturing excellence, conceptual clarity, and academic discipline in physical classrooms since 2014.",
    "copyright_name": "Gurukul Coaching Institute"
  }'::jsonb)
on conflict (section_key) do nothing;
