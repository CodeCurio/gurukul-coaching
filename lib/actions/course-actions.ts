'use server';

import { createClient } from '../supabase/server';
import { courseSchema, type CourseInput } from '../validations/course-schema';
import { type ActionResponse } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function saveCourseAction(
  courseId: string | null,
  input: CourseInput
): Promise<ActionResponse> {
  try {
    const validated = courseSchema.parse(input);
    const supabase = await createClient();

    if (courseId) {
      // Update existing course
      const { error } = await supabase
        .from('courses')
        .update({
          class_level: validated.class_level,
          subject_name: validated.subject_name,
          description: validated.description,
          is_published: validated.is_published,
          display_order: validated.display_order,
        })
        .eq('id', courseId);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Insert new course
      const { error } = await supabase
        .from('courses')
        .insert({
          class_level: validated.class_level,
          subject_name: validated.subject_name,
          description: validated.description,
          is_published: validated.is_published,
          display_order: validated.display_order,
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save subject' };
  }
}

export async function deleteCourseAction(courseId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete subject' };
  }
}

export async function enrollStudentInSubjectAction(
  studentId: string,
  courseId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('student_courses')
      .insert({
        student_id: studentId,
        course_id: courseId,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath('/dashboard/courses');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to enroll student in subject' };
  }
}

export async function unenrollStudentFromSubjectAction(
  studentId: string,
  courseId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('student_courses')
      .delete()
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath('/dashboard/courses');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to unenroll student from subject' };
  }
}

export async function updateStandardFeeAction(
  classLevel: string,
  totalFeeAmount: number,
  numberOfInstallments: number
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Check if standard fee exists
    const { data: existing } = await supabase
      .from('standard_fees')
      .select('id')
      .eq('class_level', classLevel)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('standard_fees')
        .update({
          total_fee_amount: totalFeeAmount,
          number_of_installments: numberOfInstallments,
        })
        .eq('id', existing.id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from('standard_fees')
        .insert({
          class_level: classLevel,
          total_fee_amount: totalFeeAmount,
          number_of_installments: numberOfInstallments,
        });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/admin/courses');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update standard fee' };
  }
}

