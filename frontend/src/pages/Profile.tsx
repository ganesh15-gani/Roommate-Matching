import { motion } from 'framer-motion';
import { Camera, MapPin, Briefcase, GraduationCap, ShieldCheck, CheckCircle2, MessageCircle, MoreHorizontal } from 'lucide-react';

const profileData = {
  name: 'Sarah Chen',
  age: 24,
  gender: 'Female',
  photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
  isVerified: true,
  location: 'Koramangala, Bangalore',
  occupation: 'UX Designer',
  company: 'Google',
  college: 'NID Ahmedabad',
  budget: '15,000',
  bio: 'Hey! I am a UX Designer looking for a chill flatmate. I love keeping the place clean, making coffee in the mornings, and occasionally baking on weekends. Prefer a quiet environment during weekdays since I WFH most days.',
  languages: ['English', 'Hindi', 'Mandarin'],
  lifestyle: ['Early Bird', 'Non-Smoker', 'Vegetarian', 'WFH Friendly'],
  interests: ['Design', 'Baking', 'Yoga', 'Coffee', 'Indie Music'],
  friendsCount: 142,
  postsCount: 1,
};

export const Profile = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Cover Banner */}
      <div className="h-64 md:h-80 relative overflow-hidden bg-slate-200">
        <img 
          src={profileData.coverUrl} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        
        {/* Edit Cover Button */}
        <button className="absolute top-24 right-6 md:top-28 md:right-8 glass-card p-2 rounded-full text-white hover:bg-white/20 transition-colors">
          <Camera size={20} />
        </button>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative -mt-24">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Core Info & Actions */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card p-6 md:p-8 flex flex-col items-center text-center shadow-xl relative"
            >
              <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden -mt-20 bg-white">
                <img 
                  src={profileData.photoUrl} 
                  alt={profileData.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{profileData.name}, {profileData.age}</h1>
                  {profileData.isVerified && <ShieldCheck className="text-blue-500" size={20} />}
                </div>
                <p className="text-slate-500 font-medium">{profileData.occupation} at {profileData.company}</p>
                <p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><MapPin size={14} /> {profileData.location}</p>
              </div>

              <div className="flex w-full gap-4 mt-8 pt-6 border-t border-slate-100">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-slate-900">{profileData.friendsCount}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Friends</div>
                </div>
                <div className="w-px bg-slate-100" />
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-slate-900">{profileData.postsCount}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Posts</div>
                </div>
              </div>

              {/* Action Buttons (For own profile, this would be 'Edit Profile') */}
              <div className="flex w-full gap-2 mt-6">
                <button className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-bold shadow-sm shadow-brand-500/20 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Connect
                </button>
                <button className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
                  <MessageCircle size={20} />
                </button>
                <button className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </motion.div>
            
            {/* Verification Status */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6 glass-card p-6"
            >
              <h3 className="font-bold text-slate-900 mb-4">Verification</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 size={16}/></div>
                  Email Verified
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 size={16}/></div>
                  Phone Verified
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 size={16}/></div>
                  Gov. ID Verified
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 flex flex-col gap-6 mt-6 lg:mt-0">
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">About Me</h2>
              <p className="text-slate-600 leading-relaxed">{profileData.bio}</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">Details</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Education & Work</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Briefcase size={18} className="text-slate-400" />
                      <span className="text-slate-700 font-medium">{profileData.occupation} at {profileData.company}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap size={18} className="text-slate-400" />
                      <span className="text-slate-700 font-medium">{profileData.college}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Budget Setup</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">₹{profileData.budget}</span>
                    <span className="text-slate-500 font-medium">/ month</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">Lifestyle & Preferences</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Lifestyle</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.lifestyle.map(item => (
                    <span key={item} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Interests & Hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map(item => (
                    <span key={item} className="px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.languages.map(item => (
                    <span key={item} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};
