import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Sparkles, BarChart3, Info, Sun, Moon } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ activeTab, setActiveTab, isApiOnline, theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Placement Prediction', icon: Sparkles },
    { id: 'model', label: 'Analysis', icon: BarChart3 },
    { id: 'about', label: 'About System', icon: Info },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 border-b ${
      isDark 
        ? (scrolled ? 'bg-slate-900/95 backdrop-blur-md border-slate-800 shadow-lg shadow-black/20' : 'bg-slate-900 border-slate-800')
        : (scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm' : 'bg-white border-slate-200')
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* BRAND LOGO */}
          <button 
            onClick={() => setActiveTab('home')} 
            className="flex items-center shrink-0 cursor-pointer focus:outline-none transition-opacity hover:opacity-90"
          >
            <Logo theme={theme} variant="full" />
          </button>

          {/* NAVIGATION TABS */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-2 rounded-lg border transition-all shrink-0 ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* API Connection Indicator */}
            <div className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-slate-300' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isApiOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isApiOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="whitespace-nowrap">{isApiOnline ? 'FastAPI Online' : 'Connecting ML...'}</span>
            </div>

            {/* Primary CTA Button */}
            <button
              onClick={() => setActiveTab('predict')}
              className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Predict Placement</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
