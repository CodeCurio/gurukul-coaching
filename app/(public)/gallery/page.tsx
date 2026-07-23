import { createClient } from '@/lib/supabase/server';
import GalleryGrid from '@/components/public/gallery-grid';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';


export const dynamic = 'force-dynamic';

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.category || 'all';

  let images: any[] = [];
  try {
    const supabase = await createClient();

    let query = supabase
      .from('gallery_images')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (currentCategory !== 'all') {
      query = query.eq('category', currentCategory);
    }

    const { data } = await query;
    if (data) {
      images = data;
    }
  } catch (error) {
    console.error('Error fetching gallery images:', error);
  }

  // Categories list
  const categories = [
    { key: 'all', label: 'All Photos' },
    { key: 'classrooms', label: 'Classrooms' },
    { key: 'labs', label: 'Study Facilities' },
    { key: 'events', label: 'Events & Achievements' },
  ];

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gurukul Gallery</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          Take a virtual tour of our classroom infrastructure, academic workspace, and recent events. Click on any image to open the lightbox viewer.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.key;
          return (
            <Link
              key={cat.key}
              href={`${ROUTES.PUBLIC.GALLERY}?category=${cat.key}`}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Grid container */}
      <div className="pt-4">
        <GalleryGrid images={images} />
      </div>
    </div>
  );
}
