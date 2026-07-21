import { Menu, Heart, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onMenuClick}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg stayzen-btn-gradient flex items-center justify-center text-white font-bold text-xs shadow-md">
                SZ
              </div>
              <span className="text-xl font-bold text-slate-800">
                Stay<span className="text-stayzen-light">Zen</span>
              </span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-stayzen-dark text-white flex items-center justify-center font-bold text-xs shadow-sm hover:opacity-90 transition-opacity">
                G
              </button>
              
              {/* Dropdown Menu (Shows on Hover) */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden py-1">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-sm font-bold text-slate-800">Ganesh</p>
                    <p className="text-xs text-slate-500">ganesh@example.com</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-stayzen-main transition-colors flex items-center gap-2">
                    <Heart size={16} /> Favorites
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-stayzen-main transition-colors flex items-center gap-2">
                    <CreditCard size={16} /> Payments
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-stayzen-main transition-colors flex items-center gap-2">
                    <HelpCircle size={16} /> Help Center
                  </button>
                  <div className="h-px bg-slate-50 my-1"></div>
                  <button className="w-full px-4 py-2 text-left text-sm text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2 font-medium">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
