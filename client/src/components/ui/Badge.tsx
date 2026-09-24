import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'moderate' | 'low' | 'neutral' | 'verified' | 'success';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
  size = 'md',
}) => {
  const variants = {
    critical: 'bg-red-600 text-white font-bold animate-pulse',
    high: 'bg-orange-500 text-white font-semibold',
    moderate: 'bg-amber-100 text-amber-900 border border-amber-300 font-medium',
    low: 'bg-blue-100 text-blue-800 border border-blue-200 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium',
    verified: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium',
    success: 'bg-green-100 text-green-800 font-medium',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-full',
  };

  return (
    <span className={twMerge(clsx('inline-flex items-center gap-1 uppercase tracking-wider', variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};
