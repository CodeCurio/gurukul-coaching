'use server';

import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { type ActionResponse } from './auth-actions';
import { adminStudentUpdateSchema } from '../validations/student-schema';
import { revalidatePath } from 'next/cache';

export async function approveAdmissionAction(
  admissionId: string,
  assignedClass: string
): Promise<ActionResponse> {
  const adminClient = createAdminClient();
  const userClient = await createClient();

  // Get current admin user ID
  const { data: { user: adminUser }, error: adminAuthError } = await userClient.auth.getUser();
  if (adminAuthError || !adminUser) {
    return { success: false, error: 'Unauthorized: Admin authentication failed' };
  }

  // 1. Fetch the admission application
  const { data: admission, error: fetchError } = await adminClient
    .from('admissions')
    .select('*')
    .eq('id', admissionId)
    .single();

  if (fetchError || !admission) {
    return { success: false, error: 'Admission application not found' };
  }

  if (admission.status !== 'pending') {
    return { success: false, error: 'This application has already been processed' };
  }

  let createdAuthUserId: string | null = null;

  try {
    // 2. Create the user in Supabase auth using admin client
    // Setting email_confirm to false will send an invitation / password reset email to set their password.
    const { data: authUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email: admission.email,
      email_confirm: false,
      user_metadata: {
        role: 'student',
        full_name: admission.student_full_name,
        phone_number: admission.phone_number,
      },
    });

    if (createUserError || !authUser.user) {
      return { success: false, error: `Auth creation failed: ${createUserError?.message}` };
    }

    createdAuthUserId = authUser.user.id;

    // 3. Update the automatically created profile (from trigger)
    const { error: profileUpdateError } = await adminClient
      .from('profiles')
      .update({
        role: 'student',
        full_name: admission.student_full_name,
        phone_number: admission.phone_number,
      })
      .eq('id', createdAuthUserId);

    if (profileUpdateError) {
      throw new Error(`Profile update failed: ${profileUpdateError.message}`);
    }

    // 4. Generate Roll Number
    // Format: GCI-[Year]-[ClassDigits]-[Sequence] (e.g. GCI-2026-10-004)
    const currentYear = new Date().getFullYear();
    const classDigits = assignedClass.replace(/\D/g, ''); // Extract '10' from 'Class 10'
    const { count, error: countError } = await adminClient
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('current_class', assignedClass);

    if (countError) {
      throw new Error(`Roll number generation failed: ${countError.message}`);
    }

    const sequence = String((count || 0) + 1).padStart(3, '0');
    const rollNumber = `GCI-${currentYear}-${classDigits}-${sequence}`;

    // 5. Create student record
    const { error: studentInsertError } = await adminClient
      .from('students')
      .insert({
        id: createdAuthUserId,
        admission_id: admission.id,
        current_class: assignedClass,
        roll_number: rollNumber,
        date_of_birth: admission.date_of_birth,
        guardian_name: admission.guardian_name,
        guardian_phone_number: admission.phone_number,
        address: admission.address,
        is_active: true,
      });

    if (studentInsertError) {
      throw new Error(`Student record insertion failed: ${studentInsertError.message}`);
    }

    // 6. Generate fees based on class level fee structure
    const { data: feeStructure, error: feeStructureError } = await adminClient
      .from('fee_structures')
      .select('*')
      .eq('class_level', assignedClass)
      .maybeSingle();

    if (feeStructureError) {
      throw new Error(`Failed to retrieve fee structure: ${feeStructureError.message}`);
    }

    if (feeStructure) {
      const academicYear = `${currentYear}-${currentYear + 1}`;
      const totalFeeAmount = Number(feeStructure.annual_fee_amount) + Number(feeStructure.admission_fee_amount);

      // Create student_fees entry
      const { data: studentFee, error: studentFeeError } = await adminClient
        .from('student_fees')
        .insert({
          student_id: createdAuthUserId,
          academic_year: academicYear,
          total_fee_amount: totalFeeAmount,
          discount_amount: 0,
          scholarship_amount: 0,
        })
        .select('*')
        .single();

      if (studentFeeError) {
        throw new Error(`Student fee setup failed: ${studentFeeError.message}`);
      }

      // Generate Installments
      const numInstallments = feeStructure.number_of_installments;
      const baseAmount = Math.floor((totalFeeAmount / numInstallments) * 100) / 100;
      const remainder = Number((totalFeeAmount - (baseAmount * numInstallments)).toFixed(2));

      const installmentsData = [];
      const installmentSpacingMonths = 12 / numInstallments;

      for (let i = 1; i <= numInstallments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (i - 1) * installmentSpacingMonths);

        // Add rounding remainder to the final installment
        const amountDue = i === numInstallments ? (baseAmount + remainder) : baseAmount;

        installmentsData.push({
          student_fee_id: studentFee.id,
          installment_number: i,
          amount_due: amountDue,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
          amount_paid: 0,
        });
      }

      const { error: installmentsError } = await adminClient
        .from('fee_installments')
        .insert(installmentsData);

      if (installmentsError) {
        throw new Error(`Fee installments creation failed: ${installmentsError.message}`);
      }
    }

    // 7. Update admissions status
    const { error: admissionUpdateError } = await adminClient
      .from('admissions')
      .update({
        status: 'approved',
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        linked_student_id: createdAuthUserId,
      })
      .eq('id', admissionId);

    if (admissionUpdateError) {
      throw new Error(`Admission application status update failed: ${admissionUpdateError.message}`);
    }

    revalidatePath('/admin/admissions');
    revalidatePath('/admin/students');
    return { success: true };
  } catch (err: any) {
    // Transaction Rollback handling
    if (createdAuthUserId) {
      await adminClient.auth.admin.deleteUser(createdAuthUserId);
    }
    return { success: false, error: err.message || 'An error occurred during approval.' };
  }
}

export async function rejectAdmissionAction(
  admissionId: string,
  rejectionReason: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Get current admin user ID
    const { data: { user: adminUser }, error: adminAuthError } = await supabase.auth.getUser();
    if (adminAuthError || !adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('admissions')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', admissionId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/admissions');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to reject admission' };
  }
}

export async function deactivateStudentAction(studentId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', studentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to deactivate student' };
  }
}

export async function activateStudentAction(studentId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('students')
      .update({ is_active: true })
      .eq('id', studentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to activate student' };
  }
}

export async function permanentlyDeleteStudentAction(
  studentId: string,
  studentNameConfirmation: string
): Promise<ActionResponse> {
  try {
    const adminClient = createAdminClient();
    const userClient = await createClient();

    // 1. Verify profile and student name match
    const { data: profile, error: profileFetchError } = await userClient
      .from('profiles')
      .select('full_name')
      .eq('id', studentId)
      .single();

    if (profileFetchError || !profile) {
      return { success: false, error: 'Student not found' };
    }

    if (profile.full_name.trim().toLowerCase() !== studentNameConfirmation.trim().toLowerCase()) {
      return { success: false, error: 'Name confirmation does not match.' };
    }

    // 2. Delete the user from Supabase auth (cascades profile, student, courses, and fees due to SQL schema)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(studentId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete student' };
  }
}

export async function updateStudentByAdminAction(
  studentId: string,
  input: any
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Parse input
    const validated = adminStudentUpdateSchema.parse(input);

    // 1. Update Profile (name)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: validated.full_name })
      .eq('id', studentId);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // 2. Update Student Details
    const { error: studentError } = await supabase
      .from('students')
      .update({
        current_class: validated.current_class,
        roll_number: validated.roll_number,
        date_of_birth: validated.date_of_birth,
        guardian_name: validated.guardian_name,
        guardian_phone_number: validated.guardian_phone_number,
        address: validated.address,
        is_active: validated.is_active,
      })
      .eq('id', studentId);

    if (studentError) {
      return { success: false, error: studentError.message };
    }

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath('/admin/students');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update student profile' };
  }
}

export async function createAdminAccountAction(
  email: string,
  fullName: string,
  phoneNumber: string
): Promise<ActionResponse> {
  try {
    const adminClient = createAdminClient();

    // Create user in Supabase auth with admin role metadata
    const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true, // Admin can confirm immediately
      user_metadata: {
        role: 'admin',
        full_name: fullName,
        phone_number: phoneNumber,
      },
    });

    if (createError || !authUser.user) {
      return { success: false, error: createError?.message || 'Failed to create admin user' };
    }

    // Update the auto-created profile to role 'admin'
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        role: 'admin',
        full_name: fullName,
        phone_number: phoneNumber,
      })
      .eq('id', authUser.user.id);

    if (profileError) {
      // Clean up orphaned user
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: profileError.message };
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create admin account' };
  }
}

export async function globalSearchAction(query: string): Promise<ActionResponse<{
  students: { id: string; full_name: string; roll_number: string; current_class: string }[];
  admissions: { id: string; student_full_name: string; applying_for_class: string; status: string }[];
}>> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, data: { students: [], admissions: [] } };
    }
    const supabase = await createClient();

    // 1. Search students
    const { data: studentsData, error: studentError } = await supabase
      .from('students')
      .select('id, roll_number, current_class, profiles!inner(full_name)')
      .or(`roll_number.ilike.%${query}%,profiles.full_name.ilike.%${query}%`)
      .limit(5);

    if (studentError) throw studentError;

    // 2. Search admissions
    const { data: admissionsData, error: admissionError } = await supabase
      .from('admissions')
      .select('id, student_full_name, applying_for_class, status')
      .ilike('student_full_name', `%${query}%`)
      .limit(5);

    if (admissionError) throw admissionError;

    const formattedStudents = (studentsData || []).map((s: any) => ({
      id: s.id,
      roll_number: s.roll_number,
      current_class: s.current_class,
      full_name: s.profiles?.full_name || 'Student Name',
    }));

    const formattedAdmissions = (admissionsData || []).map((a: any) => ({
      id: a.id,
      student_full_name: a.student_full_name,
      applying_for_class: a.applying_for_class,
      status: a.status,
    }));

    return {
      success: true,
      data: {
        students: formattedStudents,
        admissions: formattedAdmissions,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Search execution failed' };
  }
}

export async function saveGalleryImageAction(input: {
  image_url: string;
  category: string;
  description?: string;
  display_order: number;
  is_published: boolean;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('gallery_images')
      .insert({
        image_url: input.image_url,
        category: input.category,
        description: input.description || null,
        display_order: input.display_order,
        is_published: input.is_published,
      });

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save image metadata' };
  }
}

export async function toggleGalleryPublishAction(
  id: string,
  isPublished: boolean
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('gallery_images')
      .update({ is_published: isPublished })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle publication' };
  }
}

export async function deleteGalleryImageAction(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { data: img } = await supabase
      .from('gallery_images')
      .select('image_url')
      .eq('id', id)
      .single();

    const { error: dbError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (dbError) return { success: false, error: dbError.message };

    if (img?.image_url) {
      const parts = img.image_url.split('/gallery/');
      if (parts.length > 1) {
        const filePath = parts[1];
        await supabase.storage.from('gallery').remove([filePath]);
      }
    }

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete image' };
  }
}


