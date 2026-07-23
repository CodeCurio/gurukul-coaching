'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  id: string;
  title?: string | null;
  storage_path: string;
  category?: string | null;
}

interface GalleryGridProps {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setActiveIdx(index);
    // Prevent scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setActiveIdx(null);
    document.body.style.overflow = '';
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev! - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev! + 1));
  };

  // Helper to resolve Supabase storage URLs
  const getImageUrl = (path: string) => {
    // If it is already a full URL (like unsplash), use it, otherwise format Supabase storage URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const bucket = 'gallery';
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <span className="text-slate-400 text-sm">No photographs added to the gallery yet.</span>
      </div>
    );
  }

  const activeImage = activeIdx !== null ? images[activeIdx] : null;

  return (
    <div>
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((image, idx) => (
          <motion.div
            key={image.id}
            layoutId={`image-${image.id}`}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-4/3 rounded-2xl bg-slate-100 overflow-hidden cursor-pointer shadow-sm border border-slate-200"
          >
            <img
              src={getImageUrl(image.storage_path)}
              alt={image.title || 'Gurukul Campus'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
              <div className="flex justify-end">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                {image.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-300">
                    {image.category}
                  </span>
                )}
                <h4 className="font-semibold text-sm leading-tight">
                  {image.title || 'Classroom / Event'}
                </h4>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {activeIdx !== null && activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Controls */}
            <button
              onClick={prevImage}
              className="absolute left-4 p-2 rounded-full bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 p-2 rounded-full bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Lightbox Content */}
            <div className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center gap-4">
              <motion.img
                key={activeImage.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={getImageUrl(activeImage.storage_path)}
                alt={activeImage.title || 'Gallery'}
                className="max-h-[70vh] max-w-full rounded-xl object-contain border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="text-center text-white space-y-1" onClick={(e) => e.stopPropagation()}>
                {activeImage.category && (
                  <span className="text-xs text-accent font-semibold uppercase tracking-widest">
                    {activeImage.category}
                  </span>
                )}
                <h3 className="font-bold text-lg">{activeImage.title || 'Campus Scene'}</h3>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
