import React from 'react';
import Logo from './Logo';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ setActiveTab, theme }) {
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t transition-colors duration-200 py-10 ${
      isDark 
        ? 'bg-slate-900 border-slate-800 text-slate-400' 
        : 'bg-white border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          
          {/* BRAND LOGO & SUBTITLE */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <Logo theme={theme} variant="full" />
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              AI-Powered College Student Placement Probability & Package Analytics Platform.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="flex flex-wrap justify-center items-center gap-6 font-medium text-xs">
            <button 
              onClick={() => setActiveTab('home')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('predict')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Placement Predictor
            </button>
            <button 
              onClick={() => setActiveTab('model')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Model Analysis
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              System & Ethical AI
            </button>
          </div>

          {/* COPYRIGHT */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Educational & Analytics Demo</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
