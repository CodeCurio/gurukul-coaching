'use server';

import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { type ActionResponse } from './auth-actions';
import { testimonialSchema, faqSchema, type TestimonialInput, type FaqInput } from '../validations/cms-schema';
import { revalidatePath } from 'next/cache';

async function verifyAdminSession() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return null;
  return user;
}

export async function saveCMSContentAction(
  sectionKey: string,
  content: any
): Promise<ActionResponse> {
  try {
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized: Admin authentication required' };
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('cms_content')
      .upsert({
        section_key: sectionKey,
        content: content,
        updated_by: adminUser.id,
      }, {
        onConflict: 'section_key',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath(`/admin/cms/${sectionKey.split('_')[0]}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save content block' };
  }
}

export async function saveTestimonialAction(
  testimonialId: string | null,
  input: TestimonialInput
): Promise<ActionResponse> {
  try {
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = testimonialSchema.parse(input);
    const supabaseAdmin = createAdminClient();

    if (testimonialId) {
      const { error } = await supabaseAdmin
        .from('testimonials')
        .update({
          author_name: validated.author_name,
          author_role: validated.author_role,
          content: validated.content,
          avatar_url: validated.avatar_url || null,
          is_published: validated.is_published,
          display_order: validated.display_order,
        })
        .eq('id', testimonialId);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabaseAdmin
        .from('testimonials')
        .insert({
          author_name: validated.author_name,
          author_role: validated.author_role,
          content: validated.content,
          avatar_url: validated.avatar_url || null,
          is_published: validated.is_published,
          display_order: validated.display_order,
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/cms/testimonials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save testimonial' };
  }
}

export async function deleteTestimonialAction(testimonialId: string): Promise<ActionResponse> {
  try {
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', testimonialId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/cms/testimonials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete testimonial' };
  }
}

export async function saveFAQAction(
  faqId: string | null,
  input: FaqInput
): Promise<ActionResponse> {
  try {
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = faqSchema.parse(input);
    const supabaseAdmin = createAdminClient();

    if (faqId) {
      const { error } = await supabaseAdmin
        .from('faqs')
        .update({
          question: validated.question,
          answer: validated.answer,
          display_order: validated.display_order,
          is_published: validated.is_published,
        })
        .eq('id', faqId);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabaseAdmin
        .from('faqs')
        .insert({
          question: validated.question,
          answer: validated.answer,
          display_order: validated.display_order,
          is_published: validated.is_published,
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/cms/faqs');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save FAQ' };
  }
}

export async function deleteFAQAction(faqId: string): Promise<ActionResponse> {
  try {
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('faqs')
      .delete()
      .eq('id', faqId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/cms/faqs');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete FAQ' };
  }
}

export async function saveInstituteSettingsAction(input: {
  institute_name: string;
  logo_storage_path: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  primary_color: string;
}): Promise<ActionResponse> {
  try {
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized: Admin authentication required' };
    }

    const supabaseAdmin = createAdminClient();

    // Check if settings record exists (single row table)
    const { data: existing } = await supabaseAdmin
      .from('institute_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Update
      const { error } = await supabaseAdmin
        .from('institute_settings')
        .update(input)
        .eq('id', existing.id);

      if (error) return { success: false, error: error.message };
    } else {
      // Insert
      const { error } = await supabaseAdmin
        .from('institute_settings')
        .insert(input);

      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/about');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save settings' };
  }
}
