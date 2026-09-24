import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, ExternalLink, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Safety Disclaimer Banner */}
        <div className="bg-rose-950/60 border border-rose-800/60 rounded-2xl p-4 sm:p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-rose-200">
          <div className="p-3 bg-rose-900/80 rounded-xl text-rose-300 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-sm space-y-1">
            <h4 className="font-bold text-white text-base">Critical Emergency Safety Notice</h4>
            <p className="text-rose-200/90 leading-relaxed">
              If you or someone near you is in an immediate life-threatening situation (cardiac arrest, unconsciousness, severe hemorrhage, active fire),
              call your local government emergency services immediately (911 in North America, 112 in the EU & India, 999 in the UK).
              EmergencyAssist AI is an assistance discovery tool and does not replace emergency dispatchers or medical professionals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & mission */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">EmergencyAssist AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Find the right help. Right when you need it. Fast, intelligent emergency classification and verified nearby resource discovery during critical times.
            </p>
            <div className="text-xs text-slate-500">
              Powered by Google Gemini AI & Real-Time Haversine Geolocation
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-3">Emergency Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/services?category=hospital" className="hover:text-white transition-colors">Hospitals & Trauma</Link></li>
              <li><Link to="/services?category=ambulance" className="hover:text-white transition-colors">Ambulance Dispatch</Link></li>
              <li><Link to="/services?category=pharmacy" className="hover:text-white transition-colors">24-Hour Pharmacies</Link></li>
              <li><Link to="/services?category=blood_bank" className="hover:text-white transition-colors">Blood & Plasma Banks</Link></li>
              <li><Link to="/services?category=fire_station" className="hover:text-white transition-colors">Fire Departments</Link></li>
              <li><Link to="/services?category=police_station" className="hover:text-white transition-colors">Police Stations</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/emergency" className="hover:text-white transition-colors">Analyze Emergency</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Find Nearby Help</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Emergency Dashboard</Link></li>
              <li><Link to="/history" className="hover:text-white transition-colors">Search History</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Privacy & Settings</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EmergencyAssist AI. All emergency data labeled as Demo Data is for development and testing purposes.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built for public safety & healthcare response</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
