import { z } from 'zod';
import { CLASS_LEVELS } from '../constants/classes';

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  payment_method: z.enum(['cash', 'bank_transfer', 'cheque', 'upi'], {
    message: 'Please select a valid payment method',
  }),
  notes: z.string().optional(),
});


export const feeStructureSchema = z.object({
  class_level: z.enum(CLASS_LEVELS),
  annual_fee_amount: z.coerce.number().nonnegative('Annual fee must be 0 or greater'),
  admission_fee_amount: z.coerce.number().nonnegative('Admission fee must be 0 or greater'),
  number_of_installments: z.coerce.number().int().min(1, 'Must have at least 1 installment').max(12, 'Cannot exceed 12 installments'),
});

export const discountScholarshipSchema = z.object({
  discount_amount: z.coerce.number().nonnegative('Discount must be 0 or greater'),
  discount_reason: z.string().optional().refine((val) => !val || val.trim().length >= 3, {
    message: 'Reason must be at least 3 characters if discount is applied',
  }),
  scholarship_amount: z.coerce.number().nonnegative('Scholarship must be 0 or greater'),
  scholarship_reason: z.string().optional().refine((val) => !val || val.trim().length >= 3, {
    message: 'Reason must be at least 3 characters if scholarship is applied',
  }),
}).refine((data) => {
  if (data.discount_amount > 0 && !data.discount_reason?.trim()) return false;
  if (data.scholarship_amount > 0 && !data.scholarship_reason?.trim()) return false;
  return true;
}, {
  message: 'Reason is required when discount or scholarship amount is specified',
  path: ['discount_reason'],
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type FeeStructureInput = z.infer<typeof feeStructureSchema>;
export type DiscountScholarshipInput = z.infer<typeof discountScholarshipSchema>;
