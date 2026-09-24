import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  Search,
  Building2,
  Ambulance,
  Pill,
  Droplet,
  Flame,
  Shield,
  Activity,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  const serviceCategories = [
    { title: 'Emergency Hospitals', icon: Building2, desc: 'Trauma centers, ICU, and acute medical admission', link: '/services?category=hospital', color: 'text-rose-600 bg-rose-50' },
    { title: 'Ambulance Services', icon: Ambulance, desc: '24/7 Mobile intensive care and emergency paramedic response', link: '/services?category=ambulance', color: 'text-amber-600 bg-amber-50' },
    { title: '24/7 Pharmacies', icon: Pill, desc: 'Critical prescription refills, antitoxins, and first-aid supplies', link: '/services?category=pharmacy', color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Blood & Plasma Banks', icon: Droplet, desc: 'Emergency blood transfusions, rare types, and donor units', link: '/services?category=blood_bank', color: 'text-red-600 bg-red-50' },
    { title: 'Fire & Rescue Stations', icon: Flame, desc: 'Fire suppression, building extrication, and hazard response', link: '/services?category=fire_station', color: 'text-orange-600 bg-orange-50' },
    { title: 'Police & Public Safety', icon: Shield, desc: 'Immediate protection, traffic control, and crime reporting', link: '/services?category=police_station', color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-rose-600" />
              AI-Powered Emergency Response Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              EmergencyAssist AI
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-rose-600">
              Find the right help. Right when you need it.
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              AI-powered emergency assistance that helps you identify the right type of emergency service, assesses urgency with Gemini AI, and discovers verified nearby help in seconds.
            </p>

            {/* Main Action CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/emergency" className="w-full sm:w-auto">
                <Button variant="emergency" size="lg" className="w-full sm:w-auto text-base sm:text-lg gap-3 font-bold px-8 shadow-rose-600/30">
                  <PhoneCall className="w-5 h-5" />
                  Get Emergency Help
                </Button>
              </Link>
              <Link to="/services" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg gap-3 font-semibold px-8 bg-white">
                  <Search className="w-5 h-5 text-slate-500" />
                  Find Emergency Services
                </Button>
              </Link>
            </div>

            {/* Life threatening advisory banner */}
            <div className="pt-6">
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 sm:p-5 text-rose-900 text-sm max-w-2xl mx-auto flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                <p className="text-left font-medium">
                  <strong>Life-Threatening Emergency Notice:</strong> If you are facing an immediate life-threatening emergency, contact your local official emergency service immediately (e.g. 911, 112, 999).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-extrabold tracking-wider text-rose-600">
            Fast 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How EmergencyAssist AI Works
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Engineered to remove friction and save precious minutes when an unexpected incident occurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-700 font-black text-xl mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Describe the Emergency</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Enter what happened in plain language (e.g. &quot;My father has chest pain and difficulty breathing&quot; or &quot;Bike accident with bleeding&quot;).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 font-black text-xl mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Identifies Help Needed</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Google Gemini classifies category, severity, urgency, and produces structured safety guidance tailored to your specific situation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-xl mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Find Nearby Emergency Services</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Instantly view verified hospitals, ambulances, fire departments, or pharmacies with distance, one-tap calling, and Google Maps directions.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-rose-600">
              Directory
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Emergency Services Supported
            </h2>
          </div>
          <Link to="/services" className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
            Browse all services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.link}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${cat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-rose-600">
                  <span>Explore nearby</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Official Emergency Contact Reference */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-2xl space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold">Standard Public Emergency Numbers</h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              If someone is unresponsive or in severe danger, dial official dispatch without delay.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <a href="tel:911" className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-4 rounded-2xl text-center transition-colors">
                <span className="text-xs text-slate-400 block font-medium">United States & Canada</span>
                <span className="text-2xl font-black text-rose-400">911</span>
              </a>
              <a href="tel:112" className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-4 rounded-2xl text-center transition-colors">
                <span className="text-xs text-slate-400 block font-medium">European Union & India</span>
                <span className="text-2xl font-black text-amber-400">112</span>
              </a>
              <a href="tel:999" className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-4 rounded-2xl text-center transition-colors">
                <span className="text-xs text-slate-400 block font-medium">United Kingdom</span>
                <span className="text-2xl font-black text-blue-400">999</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
