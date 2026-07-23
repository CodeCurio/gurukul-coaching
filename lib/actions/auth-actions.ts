'use server';

import { createClient } from '../supabase/server';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, type LoginInput, type ForgotPasswordInput, type ResetPasswordInput } from '../validations/auth-schema';
import { ROUTES } from '../constants/routes';

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function loginAction(input: LoginInput): Promise<ActionResponse<{ redirectUrl: string }>> {
  try {
    const validated = loginSchema.parse(input);
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (authError) {
      return { success: false, error: 'Invalid email or password' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'User profile not found' };
    }

    if (profile.role === 'admin') {
      return { success: true, data: { redirectUrl: ROUTES.ADMIN.DASHBOARD } };
    }

    // It is a student, check admission status
    const { data: admission, error: admissionError } = await supabase
      .from('admissions')
      .select('status')
      .eq('linked_student_id', authData.user.id)
      .maybeSingle();

    if (admissionError) {
      return { success: false, error: 'Could not retrieve admission details' };
    }

    if (!admission) {
      // Check if they are manually created by admin (profile exists but no admission record)
      return { success: true, data: { redirectUrl: ROUTES.STUDENT.DASHBOARD } };
    }

    if (admission.status === 'approved') {
      return { success: true, data: { redirectUrl: ROUTES.STUDENT.DASHBOARD } };
    } else if (admission.status === 'pending') {
      return { success: true, data: { redirectUrl: ROUTES.AUTH.PENDING_APPROVAL } };
    } else {
      return { success: true, data: { redirectUrl: ROUTES.AUTH.REJECTED } };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}

export async function signOutAction(): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to sign out' };
  }
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResponse> {
  try {
    const validated = forgotPasswordSchema.parse(input);
    const supabase = await createClient();

    // The redirect URL points back to our reset password page
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${ROUTES.AUTH.RESET_PASSWORD}`;

    const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      // Return success regardless to prevent user enumeration attacks
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    // Return success to keep consistent response, or standard error if it is validation error
    return { success: true };
  }
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResponse> {
  try {
    const validated = resetPasswordSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: validated.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}
