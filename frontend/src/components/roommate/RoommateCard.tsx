import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MapPin, Briefcase, GraduationCap, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface RoommateCardProps {
  id: string;
  name: string;
  photoUrl: string;
  compatibilityScore: number;
  budget: string;
  occupation: string;
  company?: string;
  college?: string;
  location: string;
  languages: string[];
  lifestyle: string[];
  bio: string;
  interests: string[];
  isVerified: boolean;
}

export const RoommateCard = ({ profile }: { profile: RoommateCardProps }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for the tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Motion values for the spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Map mouse position to rotation (-10 to 10 degrees)
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // For Tilt
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);

    // For Spotlight
    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX, 
        rotateY,
        transformPerspective: 1000,
        // @ts-ignore - Custom CSS variable for spotlight
        '--x': useTransform(mouseX, val => `${val}px`),
        '--y': useTransform(mouseY, val => `${val}px`),
      }}
      className={`glass-card overflow-hidden group transition-all duration-300 ${isHovered ? 'spotlight-border' : ''}`}
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <motion.img
          src={profile.photoUrl}
          alt={profile.name}
          style={{
            x: useTransform(smoothX, [-0.5, 0.5], [-10, 10]),
            y: useTransform(smoothY, [-0.5, 0.5], [-10, 10]),
            scale: 1.1 // Give room for parallax movement
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 z-20">
          <span className="text-xs font-black text-brand-600">{profile.compatibilityScore}% Match</span>
        </div>
        {profile.isVerified && (
          <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-20">
            <span className="text-[10px] font-bold text-white tracking-wide uppercase">Verified</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col gap-5 relative z-10 bg-white/50 backdrop-blur-sm">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">{profile.name}</h3>
            <div className="text-right">
              <span className="text-lg font-black text-slate-900">₹{profile.budget}</span>
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">/month</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mt-2 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {profile.location}</span>
            <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" /> {profile.occupation} {profile.company && <span className="text-slate-400">at {profile.company}</span>}</span>
            {profile.college && <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-slate-400" /> {profile.college}</span>}
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
          {profile.bio}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {profile.lifestyle.slice(0, 3).map((item) => (
            <span key={item} className="px-2.5 py-1 bg-slate-100/50 text-slate-600 rounded-md text-[9px] font-bold tracking-wide uppercase">
              {item}
            </span>
          ))}
          {profile.lifestyle.length > 3 && (
            <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-md text-[9px] font-bold tracking-wide uppercase">
              +{profile.lifestyle.length - 3}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1 pt-4 border-t border-slate-100">
          <Link to={`/profile/${profile.id}`} className="col-span-1">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs shadow-sm flex items-center justify-center gap-1.5">
              <LinkIcon size={14} /> Profile
            </motion.button>
          </Link>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="col-span-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors text-xs shadow-sm shadow-brand-500/20">
            Connect
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
