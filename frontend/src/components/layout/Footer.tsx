import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#007c87] text-white pt-12 pb-6 w-full mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2 pr-0 md:pr-12">
            <Link to="/" className="flex items-center gap-1.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-stayzen-main font-bold text-xs shadow-sm">
                SZ
              </div>
              <span className="text-xl font-bold text-white">
                Stay<span className="text-stayzen-bg">Zen</span>
              </span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-xs">
              Redefining modern living with curated spaces and seamless technology. Your journey to a perfect home starts here.
            </p>
          </div>

          {/* Quick Links & Legal */}
          <div className="col-span-1 flex gap-12">
            <div>
              <h4 className="font-bold text-sm mb-4">Quick Links</h4>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                <li><Link to="/explore" className="hover:text-white transition-colors">Explore</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blogs" className="hover:text-white transition-colors">Blogs</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Legal</h4>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Us */}
          <div className="col-span-1">
            <h4 className="font-bold text-sm mb-4">Contact Us</h4>
            <ul className="flex flex-col gap-4 text-sm text-white/80">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-white/60" />
                <a href="mailto:support@stayzen.in" className="hover:text-white">support@stayzen.in</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-white/60" />
                <a href="tel:+919876543210" className="hover:text-white">+91 98765 43210</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-white/60 shrink-0 mt-0.5" />
                <span>Hitech City, Hyderabad, Telangana, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-xs text-white/60">
            © 2026 StayZen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
