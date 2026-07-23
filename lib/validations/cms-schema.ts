import { z } from 'zod';

export const homepageHeroSchema = z.object({
  heading: z.string().min(5, 'Heading must be at least 5 characters'),
  subheading: z.string().min(10, 'Subheading must be at least 10 characters'),
  image_path: z.string().optional().nullable(),
  stats_years: z.coerce.number().int().positive(),
  stats_students: z.coerce.number().int().positive(),
  stats_subjects: z.coerce.number().int().positive(),
  stats_success_rate: z.coerce.number().positive().max(100),
});

export const aboutContentSchema = z.object({
  story_heading: z.string().min(5),
  story_text: z.string().min(20),
  story_image: z.string().optional().nullable(),
  mission_heading: z.string().min(5),
  mission_text: z.string().min(20),
  mission_image: z.string().optional().nullable(),
  vision_heading: z.string().min(5),
  vision_text: z.string().min(20),
  vision_image: z.string().optional().nullable(),
});

export const testimonialSchema = z.object({
  author_name: z.string().min(2, 'Author name must be at least 2 characters'),
  author_role: z.string().min(2, 'Author role must be at least 2 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  avatar_url: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
  display_order: z.coerce.number().int().nonnegative().default(0),
});

export const faqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
  display_order: z.coerce.number().int().nonnegative().default(0),
  is_published: z.boolean().default(true),
});

export const footerContentSchema = z.object({
  tagline: z.string().min(10, 'Tagline must be at least 10 characters'),
  copyright_name: z.string().min(2, 'Copyright entity name must be at least 2 characters'),
});

export type HomepageHeroInput = z.infer<typeof homepageHeroSchema>;
export type AboutContentInput = z.infer<typeof aboutContentSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type FooterContentInput = z.infer<typeof footerContentSchema>;
