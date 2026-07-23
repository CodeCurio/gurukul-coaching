'use server';

import { createClient } from '../supabase/server';
import { recordPaymentSchema, feeStructureSchema, discountScholarshipSchema, type RecordPaymentInput, type FeeStructureInput, type DiscountScholarshipInput } from '../validations/fee-schema';
import { type ActionResponse } from './auth-actions';
import { generateReceiptNumber } from '../utils/generate-receipt-number';
import { revalidatePath } from 'next/cache';

export async function recordPaymentAction(
  installmentId: string,
  input: RecordPaymentInput
): Promise<ActionResponse<{ receiptId: string; receiptNumber: string }>> {
  try {
    const validated = recordPaymentSchema.parse(input);
    const supabase = await createClient();

    // 1. Fetch current admin details
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !adminUser) {
      return { success: false, error: 'Unauthorized: Admin context missing' };
    }

    // 2. Fetch installment details and associated fee record
    const { data: installment, error: instError } = await supabase
      .from('fee_installments')
      .select('*, student_fees (student_id, academic_year)')
      .eq('id', installmentId)
      .single();

    if (instError || !installment) {
      return { success: false, error: 'Installment not found' };
    }

    const currentPaid = Number(installment.amount_paid);
    const dueAmount = Number(installment.amount_due);
    const remainingBalance = dueAmount - currentPaid;

    if (validated.amount > remainingBalance) {
      return {
        success: false,
        error: `Payment amount (${validated.amount}) exceeds the remaining balance of this installment (${remainingBalance})`,
      };
    }

    const newAmountPaid = currentPaid + validated.amount;
    const isFullyPaid = newAmountPaid >= dueAmount;
    const newStatus = isFullyPaid ? 'paid' : 'partially_paid';

    // 3. Fetch next sequence value for receipt number
    const { data: seqData, error: seqError } = await supabase
      .rpc('get_next_receipt_sequence'); // Wait, if the function is not pre-registered, we can run a raw sql or define a custom RPC.
      // Wait, let's look at get_next_receipt_sequence. We didn't define it. Let's do a direct SQL execute or RPC.
      // Since supabase JS client cannot easily run raw SQL from client unless RPC is set up, let's check if we can write an RPC inside migrations or define it.
      // Alternatively, we can define a database RPC function in our migrations, or we can just fetch the count of receipts + 1. But count + 1 can have race conditions.
      // In the SQL file we defined sequence `public.fee_receipt_seq`. Let's create an RPC in a new migration to fetch the next value!
      // Wait! We can write a new migration file now that returns the next sequence number!
      // Let's first make sure we have a way to fetch sequence value. Let's write the Server Action code calling a RPC `nextval_receipt_seq` which we will add.

    // Let's call the RPC
    const { data: nextSeq, error: rpcError } = await supabase
      .rpc('nextval_receipt_seq');

    if (rpcError) {
      return { success: false, error: `Sequence generation failed: ${rpcError.message}` };
    }

    // Generate receipt number
    // installment.student_fees is typed as an object or array. Since it is .single() select, it is a single object.
    const studentFeesObj: any = installment.student_fees;
    const academicYear = studentFeesObj?.academic_year || '2026';
    const studentId = studentFeesObj?.student_id;
    const receiptNumber = generateReceiptNumber(academicYear, nextSeq);

    // 4. Update the installment
    const { error: installmentUpdateError } = await supabase
      .from('fee_installments')
      .update({
        amount_paid: newAmountPaid,
        status: newStatus,
        paid_at: new Date().toISOString(),
        payment_method: validated.payment_method,
        recorded_by: adminUser.id,
      })
      .eq('id', installmentId);

    if (installmentUpdateError) {
      return { success: false, error: `Failed to update installment: ${installmentUpdateError.message}` };
    }

    // 5. Insert the receipt record
    const { data: receipt, error: receiptError } = await supabase
      .from('fee_receipts')
      .insert({
        receipt_number: receiptNumber,
        student_id: studentId,
        fee_installment_id: installmentId,
        amount: validated.amount,
        payment_method: validated.payment_method,
        issued_by: adminUser.id,
        issued_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (receiptError) {
      return { success: false, error: `Failed to issue receipt: ${receiptError.message}` };
    }

    revalidatePath(`/admin/fees/${studentId}`);
    revalidatePath(`/dashboard/fees`);
    revalidatePath(`/dashboard/receipts`);

    return {
      success: true,
      data: {
        receiptId: receipt.id,
        receiptNumber,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}

export async function applyDiscountScholarshipAction(
  studentFeeId: string,
  input: DiscountScholarshipInput
): Promise<ActionResponse> {
  try {
    const validated = discountScholarshipSchema.parse(input);
    const supabase = await createClient();

    // 1. Fetch current fee record and its student ID
    const { data: fee, error: feeFetchError } = await supabase
      .from('student_fees')
      .select('*')
      .eq('id', studentFeeId)
      .single();

    if (feeFetchError || !fee) {
      return { success: false, error: 'Student fee record not found' };
    }

    // 2. Fetch all installments to evaluate paid amounts
    const { data: installments, error: instError } = await supabase
      .from('fee_installments')
      .select('*')
      .eq('student_fee_id', studentFeeId)
      .order('installment_number', { ascending: true });

    if (instError || !installments) {
      return { success: false, error: 'Could not fetch installments' };
    }

    const netPayable = Number(fee.total_fee_amount) - validated.discount_amount - validated.scholarship_amount;
    if (netPayable < 0) {
      return { success: false, error: 'Total discount and scholarship cannot exceed total fee amount' };
    }

    const totalPaid = installments.reduce((acc, inst) => acc + Number(inst.amount_paid), 0);
    if (netPayable < totalPaid) {
      return {
        success: false,
        error: `Net payable amount (${netPayable}) cannot be less than the total fees already paid (${totalPaid})`,
      };
    }

    // 3. Update the student_fees row
    const { error: feeUpdateError } = await supabase
      .from('student_fees')
      .update({
        discount_amount: validated.discount_amount,
        discount_reason: validated.discount_reason || null,
        scholarship_amount: validated.scholarship_amount,
        scholarship_reason: validated.scholarship_reason || null,
      })
      .eq('id', studentFeeId);

    if (feeUpdateError) {
      return { success: false, error: `Failed to update fee: ${feeUpdateError.message}` };
    }

    // 4. Recalculate unpaid installments
    // Remaining to be allocated to unpaid installments
    const remainingToPay = netPayable - totalPaid;
    const unpaidInstallments = installments.filter((inst) => inst.status !== 'paid');

    if (unpaidInstallments.length > 0) {
      const baseAmount = Math.floor((remainingToPay / unpaidInstallments.length) * 100) / 100;
      const remainder = Number((remainingToPay - (baseAmount * unpaidInstallments.length)).toFixed(2));

      for (let i = 0; i < unpaidInstallments.length; i++) {
        const inst = unpaidInstallments[i];
        const isLastUnpaid = i === unpaidInstallments.length - 1;
        const newDueAmount = isLastUnpaid ? (baseAmount + remainder) : baseAmount;

        // If the new due amount matches amount_paid, it becomes paid.
        const amountPaid = Number(inst.amount_paid);
        const isPaid = amountPaid >= newDueAmount;
        const newStatus = isPaid ? 'paid' : (amountPaid > 0 ? 'partially_paid' : 'pending');

        const { error: instUpdateError } = await supabase
          .from('fee_installments')
          .update({
            amount_due: newDueAmount,
            status: newStatus,
          })
          .eq('id', inst.id);

        if (instUpdateError) {
          return { success: false, error: `Recalculation update failed: ${instUpdateError.message}` };
        }
      }
    }

    revalidatePath(`/admin/fees/${fee.student_id}`);
    revalidatePath(`/dashboard/fees`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to apply discount/scholarship' };
  }
}

export async function saveFeeStructureAction(input: FeeStructureInput): Promise<ActionResponse> {
  try {
    const validated = feeStructureSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase
      .from('fee_structures')
      .upsert({
        class_level: validated.class_level,
        annual_fee_amount: validated.annual_fee_amount,
        admission_fee_amount: validated.admission_fee_amount,
        number_of_installments: validated.number_of_installments,
      }, {
        onConflict: 'class_level',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/courses'); // Courses page manages both courses and fee structures
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save fee structure' };
  }
}
