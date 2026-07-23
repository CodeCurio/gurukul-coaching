'use server';

import { createClient } from '../supabase/server';
import { studentProfileUpdateSchema, type StudentProfileUpdateInput } from '../validations/student-schema';
import { type ActionResponse } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function updateStudentProfile(input: StudentProfileUpdateInput): Promise<ActionResponse> {
  try {
    const validated = studentProfileUpdateSchema.parse(input);
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Start by updating the profiles table contact data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        phone_number: validated.phone_number,
        avatar_url: validated.avatar_url,
      })
      .eq('id', user.id);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Now update the students table details (guardian phone number, address)
    const { error: studentError } = await supabase
      .from('students')
      .update({
        guardian_phone_number: validated.guardian_phone_number,
        address: validated.address,
      })
      .eq('id', user.id);

    if (studentError) {
      return { success: false, error: studentError.message };
    }

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update profile' };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('notification_reads')
      .upsert({
        notification_id: notificationId,
        student_id: user.id,
      }, {
        onConflict: 'notification_id,student_id',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/notifications');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to mark notification as read' };
  }
}
