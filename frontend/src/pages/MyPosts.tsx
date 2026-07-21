import { motion } from 'framer-motion';
import { Edit2, PauseCircle, Trash2, Eye, MousePointerClick, Users } from 'lucide-react';

const mockPost = {
  id: '1',
  status: 'ACTIVE',
  location: 'Koramangala, Bangalore',
  budget: '15,000',
  roomType: 'Private Room',
  views: 124,
  clicks: 45,
  interests: 12,
};

export const MyPosts = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Posts</h1>
            <p className="text-slate-500">Manage your roommate listings and track analytics.</p>
          </div>
          <button className="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-sm shadow-brand-500/20 hover:bg-brand-600 transition-colors">
            Create Post
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wide">
                  {mockPost.status}
                </span>
                <span className="text-slate-500 text-sm">Posted 2 days ago</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{mockPost.roomType} in {mockPost.location}</h2>
              <p className="text-lg font-bold text-slate-700 mt-1">₹{mockPost.budget} /mo</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"><Edit2 size={18} /></button>
              <button className="p-2 text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"><PauseCircle size={18} /></button>
              <button className="p-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                <Eye size={16} /> <span className="text-sm font-medium">Views</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{mockPost.views}</div>
            </div>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                <MousePointerClick size={16} /> <span className="text-sm font-medium">Clicks</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{mockPost.clicks}</div>
            </div>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                <Users size={16} /> <span className="text-sm font-medium">Interested</span>
              </div>
              <div className="text-2xl font-black text-brand-600">{mockPost.interests}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
