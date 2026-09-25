import React from 'react';

export default function Logo({ variant = 'full', className = '', theme = 'light' }) {
  const isCompact = variant === 'compact';
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center ${isCompact ? '' : 'space-x-3'} ${className}`}>
      {/* Modern CareerPredict AI Icon */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-8 h-8 sm:w-9 sm:h-9"
        >
          <defs>
            <linearGradient id="cpPrimaryGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="cpAccentGrad" x1="0" y1="100" x2="100" y2="0">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>

          {/* Background Rounded Shield / Analytics Core */}
          <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#cpPrimaryGrad)" />
          
          {/* Ascending Trend Line & Academic Graduation Cap Symbol */}
          {/* Trend Bars */}
          <rect x="24" y="56" width="10" height="20" rx="3" fill="#FFFFFF" fillOpacity="0.6" />
          <rect x="40" y="44" width="10" height="32" rx="3" fill="#FFFFFF" fillOpacity="0.85" />
          <rect x="56" y="32" width="10" height="44" rx="3" fill="#FFFFFF" />
          
          {/* AI Sparkle / Growth Arrow Top Right */}
          <path d="M68 22L78 32M78 22H70M78 22V30" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="78" cy="22" r="4" fill="#22D3EE" />
        </svg>
      </div>

      {!isCompact && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className={`font-bold tracking-tight text-lg sm:text-xl font-sans ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              CareerPredict<span className="text-blue-600 dark:text-blue-400 font-extrabold ml-0.5">AI</span>
            </span>
          </div>
          <span className={`text-[10px] font-semibold tracking-wider uppercase -mt-1 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Placement Analytics
          </span>
        </div>
      )}
    </div>
  );
}
