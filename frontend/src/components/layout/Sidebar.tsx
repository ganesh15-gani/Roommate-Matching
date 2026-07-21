import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Calendar, CreditCard, Heart, MessageCircle, Users, HelpCircle, Info, LogOut, X, Camera } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  const coreProtocols = [
    { label: 'Explore', icon: Home, path: '/' },
    { label: 'Blogs', icon: FileText, path: '/blogs' },
  ];

  const membersArea = [
    { label: 'My Bookings', icon: Calendar, path: '/bookings' },
    { label: 'Payments', icon: CreditCard, path: '/payments' },
    { label: 'Favorites', icon: Heart, path: '/favorites' },
    { label: 'Messages', icon: MessageCircle, path: '/chat' },
    { label: 'Roommates', icon: Users, path: '/browse' },
  ];

  const supportInfo = [
    { label: 'Help Center', icon: HelpCircle, path: '/help' },
    { label: 'About Us', icon: Info, path: '/about' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Header / Logo */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <Link to="/" onClick={onClose} className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-stayzen-gradient flex items-center justify-center text-white font-bold text-xs shadow-md">
                  SZ
                </div>
                <span className="text-xl font-bold text-slate-800">
                  Stay<span className="text-stayzen-light">Zen</span>
                </span>
              </Link>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Profile Badge */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative group cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-stayzen-dark text-white flex items-center justify-center font-bold">
                    G
                  </div>
                  {/* Camera Icon Overlay */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm text-slate-500 hover:text-stayzen-main hover:border-stayzen-main transition-colors">
                    <Camera size={10} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-slate-800">Golla Ganesh</span>
                  <span className="text-[9px] font-bold text-stayzen-light tracking-widest uppercase">Verified Account</span>
                </div>
              </div>
            </div>

            {/* Navigation Menus */}
            <div className="flex-1 px-3 pb-6 flex flex-col gap-6">
              
              {/* Core Protocols */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Core Protocols</h4>
                <div className="flex flex-col gap-1">
                  {coreProtocols.map(link => (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        location.pathname === link.path ? 'bg-stayzen-light text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <link.icon size={18} className={location.pathname === link.path ? 'text-white' : 'text-slate-400'} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Members Area */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Members Area</h4>
                <div className="flex flex-col gap-1">
                  {membersArea.map(link => (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        location.pathname === link.path || (link.path === '/browse' && location.pathname === '/') ? 'stayzen-btn-gradient text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <link.icon size={18} className={location.pathname === link.path || (link.path === '/browse' && location.pathname === '/') ? 'text-white' : 'text-slate-400'} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Support & Info */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Support & Info</h4>
                <div className="flex flex-col gap-1">
                  {supportInfo.map(link => (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        location.pathname === link.path ? 'bg-stayzen-light text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <link.icon size={18} className={location.pathname === link.path ? 'text-white' : 'text-slate-400'} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Enroll Property */}
              <div className="px-2 mt-2">
                <Link to="/enroll" onClick={onClose} className="text-sm font-semibold text-slate-700 hover:text-stayzen-main transition-colors">
                  Enroll Your Property
                </Link>
              </div>
            </div>

            {/* Logout */}
            <div className="p-5 border-t border-slate-100">
              <button className="flex items-center gap-2 text-rose-500 font-semibold text-sm hover:text-rose-600 transition-colors w-full">
                <LogOut size={16} />
                Log Out Account
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
