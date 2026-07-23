'use client';

import { useState } from 'react';
import { createClient } from '../../../../lib/supabase/client';
import { saveGalleryImageAction, toggleGalleryPublishAction, deleteGalleryImageAction } from '../../../../lib/actions/admin-actions';
import { Upload, Trash2, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  category: string;
  description: string | null;
  display_order: number;
  is_published: boolean;
}

interface GalleryManagerProps {
  initialImages: GalleryImage[];
}

export default function GalleryManager({ initialImages }: GalleryManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Form Fields
  const [category, setCategory] = useState('classrooms');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isPublished, setIsPublished] = useState(true);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const supabase = createClient();

      // 1. Upload to Supabase storage 'gallery' bucket
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // 3. Save metadata to DB
      const res = await saveGalleryImageAction({
        image_url: publicUrl,
        category,
        description,
        display_order: displayOrder,
        is_published: isPublished,
      });

      if (res.success) {
        setFeedback({ success: true, msg: 'Gallery image uploaded and listed successfully!' });
        setDescription('');
        setDisplayOrder((prev) => prev + 1);
        window.location.reload();
      } else {
        throw new Error(res.error || 'Failed to register image metadata.');
      }
    } catch (err: any) {
      setFeedback({ success: false, msg: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const nextStatus = !currentStatus;
      const res = await toggleGalleryPublishAction(id, nextStatus);
      if (res.success) {
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, is_published: nextStatus } : img))
        );
        setFeedback({ success: true, msg: 'Publication status updated.' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Update failed.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'Failed to update.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this gallery image?')) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await deleteGalleryImageAction(id);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setFeedback({ success: true, msg: 'Image permanently deleted.' });
      } else {
        setFeedback({ success: false, msg: res.error || 'Deletion failed.' });
      }
    } catch (err) {
      setFeedback({ success: false, msg: 'Failed to delete.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Upload Panel */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">
          Upload New Image
        </h3>

        {feedback && (
          <div
            className={`border rounded-xl p-3 text-xs flex gap-2 ${
              feedback.success
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-destructive-50 border-destructive-100 text-destructive'
            }`}
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{feedback.msg}</span>
          </div>
        )}

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="classrooms">Classrooms</option>
              <option value="labs">Study Facilities</option>
              <option value="events">Events & Achievements</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Caption / Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of the photo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Display Order */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            {/* Published Toggle */}
            <div className="space-y-1.5 flex items-center gap-2 pt-6">
              <input
                id="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:outline-none"
              />
              <label htmlFor="isPublished" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer select-none">
                Publish
              </label>
            </div>
          </div>

          {/* File input */}
          <div className="pt-2">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 cursor-pointer hover:bg-slate-50 hover:border-primary transition-all relative">
              {uploading ? (
                <div className="space-y-2 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <span className="text-xs font-bold">Uploading file...</span>
                </div>
              ) : (
                <div className="space-y-2 text-center text-slate-400">
                  <Upload className="w-8 h-8 mx-auto" />
                  <span className="text-xs font-bold block text-slate-700">Select Image</span>
                  <span className="text-[10px]">PNG, JPG, WEBP up to 5MB</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Grid of uploaded images */}
      <div className="lg:col-span-8 space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">Current Image Inventory ({images.length})</h3>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col group relative"
              >
                {/* Photo */}
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img
                    src={img.image_url}
                    alt={img.description || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!img.is_published && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                      Hidden
                    </div>
                  )}
                </div>

                {/* Info & Details */}
                <div className="p-4 flex-grow space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <span>{img.category}</span>
                    <span>Order: {img.display_order}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {img.description || 'No caption description provided.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleTogglePublish(img.id, img.is_published)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                        img.is_published
                          ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          : 'bg-primary-50 border-primary-100 text-primary hover:bg-primary-100'
                      }`}
                    >
                      {img.is_published ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Publish
                        </>
                      )}
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleDelete(img.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg hover:border hover:border-rose-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl max-w-sm mx-auto space-y-3">
            <div className="text-4xl">🖼️</div>
            <h3 className="font-bold text-slate-800">No Gallery Photos</h3>
            <p className="text-slate-500 text-xs sm:text-sm px-6 leading-relaxed">
              No photos have been uploaded to the gallery bucket yet. Add your first image on the left.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export type { GalleryImage };
