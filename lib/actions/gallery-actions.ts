'use server';

import { createClient } from '../supabase/server';
import { type ActionResponse } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function addGalleryImageAction(input: {
  title?: string;
  category?: string;
  storagePath: string;
  displayOrder?: number;
}): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('gallery_images')
      .insert({
        title: input.title || null,
        category: input.category || null,
        storage_path: input.storagePath,
        display_order: input.displayOrder || 0,
        is_published: true,
        uploaded_by: user.id,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to add image record' };
  }
}

export async function deleteGalleryImageAction(
  imageId: string,
  storagePath: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('gallery')
      .remove([storagePath]);

    if (storageError) {
      return { success: false, error: `Failed to delete from storage: ${storageError.message}` };
    }

    // 2. Delete metadata from table
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete gallery image' };
  }
}

export async function updateGalleryImageDetailsAction(
  imageId: string,
  input: {
    title?: string | null;
    category?: string | null;
    display_order?: number;
    is_published?: boolean;
  }
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('gallery_images')
      .update({
        title: input.title,
        category: input.category,
        display_order: input.display_order,
        is_published: input.is_published,
      })
      .eq('id', imageId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to update image details' };
  }
}
