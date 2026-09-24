import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center text-rose-600 mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404 - Page Not Found</h1>
        <p className="text-slate-600 text-sm">
          The page you are looking for does not exist or has been moved. If you are experiencing an emergency, please access emergency assistance right away.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
          <Link to="/emergency" className="w-full sm:w-auto">
            <Button variant="emergency" size="md" className="w-full sm:w-auto gap-2">
              <Phone className="w-4 h-4" />
              Emergency Help
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
