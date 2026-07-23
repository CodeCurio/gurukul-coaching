export const FEE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIALLY_PAID: 'partially_paid',
} as const;

export type FeeStatus = (typeof FEE_STATUS)[keyof typeof FEE_STATUS];
