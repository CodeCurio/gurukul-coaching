import { z } from 'zod';
import { CLASS_LEVELS } from '../constants/classes';

export const personalDetailsSchema = z.object({
  student_full_name: z.string().min(2, 'Name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Please select date of birth').refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date of birth',
  }),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Please select a gender',
  }),
  applying_for_class: z.enum(CLASS_LEVELS, {
    message: 'Please select a valid class',
  }),
});

export const guardianDetailsSchema = z.object({
  guardian_name: z.string().min(2, 'Guardian name must be at least 2 characters'),
  guardian_relation: z.string().min(2, 'Please specify the relationship'),
  phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits)'),
  email: z.string().email('Invalid email address'),
});

export const academicDetailsSchema = z.object({
  address: z.string().min(10, 'Address must be at least 10 characters'),
  previous_school: z.string().optional(),
});

export const registrationSchema = z.object({
  ...personalDetailsSchema.shape,
  ...guardianDetailsSchema.shape,
  ...academicDetailsSchema.shape,
});

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type GuardianDetailsInput = z.infer<typeof guardianDetailsSchema>;
export type AcademicDetailsInput = z.infer<typeof academicDetailsSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
