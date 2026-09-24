import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Trash2, CheckCircle2, Lock, Save } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [stats, setStats] = useState({ totalReports: 0, totalFavorites: 0 });
  const [saving, setSaving] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await api.profile.get();
        if (data.profile) {
          setFullName(data.profile.full_name || '');
          setPhone(data.profile.phone || '');
          updateUser(data.profile);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfileData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await api.profile.update({
        full_name: fullName,
        phone: phone || null,
      });
      updateUser(updated);
      setMessage('Profile settings updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to permanently erase all your stored emergency reports and searches? This cannot be undone.')) {
      return;
    }

    setClearingHistory(true);
    try {
      await api.emergency.clearHistory();
      setStats(prev => ({ ...prev, totalReports: 0 }));
      setMessage('Your entire emergency request history has been securely erased.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete emergency history.');
    } finally {
      setClearingHistory(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-rose-600" />
          User Profile & Security
        </h1>
        <p className="text-slate-600 text-sm">
          Manage your account information, notification numbers, and emergency data privacy controls.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Account stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Emergency Reports Logged</span>
          <span className="text-3xl font-black text-slate-900">{stats.totalReports}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Saved Emergency Resources</span>
          <span className="text-3xl font-black text-rose-600">{stats.totalFavorites}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address (Account Identifier)
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Phone Number (For Emergency Verification)
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={saving} className="gap-2 font-bold px-6">
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </div>
      </form>

      {/* Privacy and Data Deletion Section */}
      <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 text-rose-900 font-bold text-lg">
          <Shield className="w-6 h-6 text-rose-600" />
          <span>Emergency Privacy & Data Sovereignty</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          EmergencyAssist AI values your personal privacy. In accordance with medical data privacy principles,
          we do not track or sell your emergency search queries. You have full control to permanently purge your recorded emergency logs at any time.
        </p>

        <div className="pt-2">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleClearHistory}
            isLoading={clearingHistory}
            className="gap-2 font-bold"
          >
            <Trash2 className="w-4 h-4" />
            Erase All Stored Emergency History
          </Button>
        </div>
      </div>
    </div>
  );
};
