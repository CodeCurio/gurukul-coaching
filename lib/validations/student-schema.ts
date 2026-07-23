import { z } from 'zod';
import { CLASS_LEVELS } from '../constants/classes';

export const studentProfileUpdateSchema = z.object({
  phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits)'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  guardian_phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits)'),
  avatar_url: z.string().nullable().optional(),
});

export const adminStudentUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  current_class: z.enum(CLASS_LEVELS),
  roll_number: z.string().min(1, 'Roll number is required'),
  date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date of birth',
  }),
  guardian_name: z.string().min(2, 'Guardian name must be at least 2 characters'),
  guardian_phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits)'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  is_active: z.boolean(),
});

export type StudentProfileUpdateInput = z.infer<typeof studentProfileUpdateSchema>;
export type AdminStudentUpdateInput = z.infer<typeof adminStudentUpdateSchema>;
