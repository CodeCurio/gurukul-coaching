import { z } from 'zod';
import { CLASS_LEVELS } from '../constants/classes';

export const courseSchema = z.object({
  class_level: z.enum(CLASS_LEVELS, {
    message: 'Please select a valid class level',
  }),
  subject_name: z.string().min(2, 'Subject name must be at least 2 characters').max(50, 'Subject name is too long'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
  is_published: z.boolean().default(true),
  display_order: z.coerce.number().int().nonnegative('Display order must be 0 or greater').default(0),
});

export type CourseInput = z.infer<typeof courseSchema>;
