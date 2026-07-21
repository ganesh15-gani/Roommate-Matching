import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { API_URL } from '../../config/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editPost?: any;
}

export const CreatePostModal = ({ isOpen, onClose, onSuccess, editPost }: CreatePostModalProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (isOpen) {
      if (editPost?.coverImage) setPhotos([editPost.coverImage]);
      else setPhotos([]);
    }
  }, [isOpen, editPost]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (photos.length >= 5) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const payload = {
      ...data,
      coverImage: photos.length > 0 ? photos[0] : null
    };

    const url = editPost ? `${API_URL}/api/posts/${editPost.id}` : `${API_URL}/api/posts`;
    const method = editPost ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (onSuccess) onSuccess();
        else onClose();
      } else {
        alert('Failed to broadcast request');
      }
    } catch (err) {
      console.error(err);
      alert('Error broadcasting request');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Find a Roommate</h2>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden max-h-full">
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                    <input name="fullName" defaultValue={editPost?.posterName || ''} type="text" placeholder="Name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all" />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone <span className="text-red-500">*</span></label>
                    <input name="phone" type="tel" placeholder="Phone" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all" />
                  </div>

                  {/* Your Stay */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Your Stay <span className="text-red-500">*</span></label>
                    <select name="yourStay" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all appearance-none cursor-pointer font-medium text-slate-700">
                      <option>Other Location</option>
                      <option>StayZen Co-living HSR</option>
                    </select>
                  </div>

                    {/* Property */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Property</label>
                      <input name="propertyName" defaultValue={editPost?.propertyName || ''} type="text" placeholder="Optional" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all" />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Location</label>
                      <input name="location" defaultValue={editPost?.location || ''} type="text" placeholder="Optional" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all" />
                    </div>

                    {/* Sharing */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Sharing</label>
                      <select name="sharingType" defaultValue={editPost?.sharingType || '2x Sharing'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all appearance-none cursor-pointer text-slate-700">
                      <option>2x Sharing</option>
                      <option>1x Private</option>
                      <option>3x Sharing</option>
                    </select>
                  </div>

                  {/* Occupation */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Occupation <span className="text-red-500">*</span></label>
                    <input name="occupation" defaultValue={editPost?.occupation || ''} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all" />
                  </div>

                  {/* Your Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Your Gender <span className="text-red-500">*</span></label>
                    <select name="gender" defaultValue={editPost?.gender || 'Male'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all appearance-none cursor-pointer text-slate-700">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>

                  {/* Looking for */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Looking for <span className="text-red-500">*</span></label>
                    <select name="lookingFor" defaultValue={editPost?.lookingFor || 'Any'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all appearance-none cursor-pointer text-slate-700">
                      <option>Any</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>

                  {/* Qualities */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Qualities</label>
                    <input name="qualities" defaultValue={editPost?.qualities || ''} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all" />
                  </div>

                  {/* Rent */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Rent</label>
                    <input name="budget" defaultValue={editPost?.budget || ''} type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all" />
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Amenities</label>
                    <input name="amenities" defaultValue={editPost?.amenities || ''} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all" />
                  </div>

                  {/* Photos */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Photos ({photos.length}/5)</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden group">
                          <img src={photo} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {photos.length < 5 && (
                        <>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                          />
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-stayzen-main hover:text-stayzen-main transition-colors bg-slate-50"
                          >
                            <Camera size={20} className="mb-1" />
                            <span className="text-[10px] font-bold">Add Photo</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Rules</label>
                    <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-stayzen-main outline-none text-sm transition-all resize-none"></textarea>
                  </div>

                </div>
              </div>

              {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex items-center justify-center">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-stayzen-main text-white font-bold rounded-xl shadow-lg shadow-stayzen-main/25 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Broadcasting...' : 'Broadcast Roommate Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
