import React from 'react';
import { MapPin, Clock, Home, Users, CheckCircle, Heart } from 'lucide-react';

interface PostCardProps {
  post: any;
  variant: 'public' | 'mine' | 'favorite';
  isFavorited?: boolean;
  isRequested?: boolean;
  isConnected?: boolean;
  onToggleFavorite?: (postId: string, isFavorited: boolean) => void;
  onSendRequest?: (userId: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  variant,
  isFavorited = false,
  isRequested = false,
  isConnected = false,
  onToggleFavorite,
  onSendRequest,
  onDelete,
  onEdit
}) => {
  // Format dates
  const postedDate = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Property Title Logic
  const propertyName = post.propertyName || `${post.stayType || 'Property'} by ${post.author?.fullName || 'User'}`;
  
  // Badges logic
  const propertyTypeBadge = post.stayType || 'Property';
  const typeDetailBadge = post.sharingType || post.flatType;
  const isAvailable = post.status !== 'TAKEN';

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col cursor-pointer group h-full">
      
      {/* Image Header Section */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-200">
        <img 
          src={`https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600`} 
          alt="Property" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/90 via-[#003366]/20 to-black/30"></div>
        
        {/* Top Badges Area */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/90 backdrop-blur-md text-[#00707c] text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> {propertyTypeBadge}
            </span>
            {typeDetailBadge && (
              <span className="bg-[#003366]/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {typeDetailBadge}
              </span>
            )}
          </div>

          {/* Contextual Top Right Action */}
          {(variant === 'public' || variant === 'favorite') && onToggleFavorite && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(post.id, isFavorited); }}
              className="p-2.5 bg-white/20 backdrop-blur-md rounded-full shadow-sm hover:bg-white/40 transition-colors cursor-pointer border border-white/30"
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
          )}
        </div>

        {/* Bottom Image Info Area */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <img src={post.author?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${post.author?.fullName}`} alt={post.author?.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-md" />
            <div className="text-white">
              <h3 className="font-bold text-sm line-clamp-1">{variant === 'mine' ? 'Your Listing' : post.author?.fullName}</h3>
              <div className="flex items-center gap-1 text-xs font-medium text-white/90 opacity-90">
                <Clock className="w-3 h-3" /> Posted {postedDate}
              </div>
            </div>
          </div>
          
          <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg tracking-wider shadow-sm backdrop-blur-md ${isAvailable ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {isAvailable ? 'AVAILABLE' : 'TAKEN'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title and Location */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1" title={propertyName}>{propertyName}</h2>
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#10b981]" /> {post.area || post.city || 'Location not specified'}
          </p>
        </div>

        {/* Listing Description */}
        {post.author?.bio && (
          <div className="mb-5">
            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 italic">
              "{post.author.bio}"
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-y-2 gap-x-2 text-sm text-slate-600 font-medium mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Looking For</span>
            <span className="text-slate-800 text-xs font-bold">{post.lookingFor || 'Any'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Gender</span>
            <span className="text-slate-800 text-xs font-bold">{post.preferredGender || 'Any'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Food</span>
            <span className="text-slate-800 text-xs font-bold">{post.foodPreference || 'Any'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Drinking</span>
            <span className="text-slate-800 text-xs font-bold">{post.drinking || 'Any'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Smoking</span>
            <span className="text-slate-800 text-xs font-bold">{post.smoking || 'Any'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Sleep</span>
            <span className="text-slate-800 text-xs font-bold">{post.sleepingHabit || 'Any'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex justify-between items-center pt-2 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Budget</span>
            <div className="font-bold text-[#003366] text-xl leading-none">
              ₹{post.maxBudget || '0'}<span className="text-sm text-slate-400 font-medium">/mo</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {variant === 'mine' ? (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit?.(post.id); }}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(post.id); }}
                  className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  Delete
                </button>
              </>
            ) : (
              isConnected ? (
                <button disabled className="bg-green-50 text-green-600 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-default">
                  <CheckCircle className="w-4 h-4" /> Connected
                </button>
              ) : isRequested ? (
                <button disabled className="bg-slate-100 text-slate-500 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-default">
                  <Clock className="w-4 h-4" /> Pending
                </button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onSendRequest?.(post.author?.id); }} className="bg-[#00707c] hover:bg-[#005a63] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-md hover:shadow-lg flex items-center gap-1.5">
                  Connect
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
