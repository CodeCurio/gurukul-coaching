import { createClient } from '../../../../lib/supabase/server';
import GalleryManager from './gallery-manager';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  let images: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) {
      images = data;
    }
  } catch (error) {
    console.error('Error fetching gallery images list:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gallery Media Management</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Upload classrooms, study workspaces, and events achievement pictures to update the public gallery page.
        </p>
      </div>

      <GalleryManager initialImages={images} />
    </div>
  );
}
