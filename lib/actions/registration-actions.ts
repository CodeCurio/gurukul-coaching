'use server';

import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { registrationSchema, type RegistrationInput } from '../validations/registration-schema';
import { contactFormSchema, type ContactFormInput } from '../validations/contact-schema';
import { type ActionResponse } from './auth-actions';

export async function submitRegistrationAction(
  input: RegistrationInput
): Promise<ActionResponse<{ admissionId: string }>> {
  try {
    const validated = registrationSchema.parse(input);
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from('admissions')
      .insert([
        {
          student_full_name: validated.student_full_name,
          date_of_birth: validated.date_of_birth,
          gender: validated.gender,
          guardian_name: validated.guardian_name,
          guardian_relation: validated.guardian_relation,
          phone_number: validated.phone_number,
          email: validated.email,
          address: validated.address,
          applying_for_class: validated.applying_for_class,
          previous_school: validated.previous_school || null,
          status: 'pending',
        },
      ])
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { admissionId: data.id } };
  } catch (err: any) {
    if (err?.name === 'ZodError' && Array.isArray(err?.issues)) {
      const messages = err.issues.map((i: any) => i.message).join('. ');
      return { success: false, error: messages };
    }
    return { success: false, error: err.message || 'Failed to submit application' };
  }
}

/**
 * Allows applicants to check their admission status without logging in
 */
export async function checkAdmissionStatusAction(
  email: string,
  phoneNumber: string
): Promise<ActionResponse<{ status: string; student_full_name: string; rejection_reason?: string | null }>> {
  try {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from('admissions')
      .select('status, student_full_name, rejection_reason')
      .eq('email', email)
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No application found with these details.' };
    }

    return {
      success: true,
      data: {
        status: data.status,
        student_full_name: data.student_full_name,
        rejection_reason: data.rejection_reason,
      },
    };
  } catch (err: any) {
    return { success: false, error: 'An error occurred while checking status' };
  }
}

/**
 * Submits contact submissions
 */
export async function submitContactFormAction(input: ContactFormInput): Promise<ActionResponse> {
  try {
    const validated = contactFormSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        full_name: validated.full_name,
        email: validated.email,
        phone_number: validated.phone_number,
        message: validated.message,
        is_resolved: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit message' };
  }
}
