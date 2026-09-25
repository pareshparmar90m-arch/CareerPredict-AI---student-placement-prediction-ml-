import React from 'react';
import { 
  Info, ShieldCheck, BrainCircuit, Users, Lock, Sparkles, 
  ArrowRight, CheckCircle2, AlertTriangle, Code2 
} from 'lucide-react';

export default function AboutPage({ onStartPredict, theme }) {
  const isDark = theme === 'dark';

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-10">
      
      {/* HEADER */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <Info className="w-3.5 h-3.5" />
          <span>Architecture & Governance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          About CareerPredict AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          An enterprise-grade educational analytics and machine learning engine designed for higher education institutions, placement officers, and students.
        </p>
      </div>

      {/* CORE DESIGN PRINCIPLES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Two-Stage Pipeline</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Decouples prediction into Stage 1 binary classification (Placed vs. Not Placed) and Stage 2 salary package regression (₹ LPA).
          </p>
        </div>

        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Privacy & Security</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            No Personally Identifiable Information (PII) such as student names, emails, roll numbers, or contact details are collected or stored.
          </p>
        </div>

        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Ethical AI Standards</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Outputs are statistical estimations intended for academic advisement and career planning, not deterministic hiring guarantees.
          </p>
        </div>

      </div>

      {/* RESPONSIBLE USE ADVISORY NOTICE */}
      <div className={`p-6 sm:p-8 rounded-2xl border space-y-3 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-amber-50/70 border-amber-200'
      }`}>
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Responsible Use Policy & Legal Disclaimer</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          This platform is designed for educational analytics and skill gap identification. Machine learning predictions rely on historical statistical patterns across 100,000 synthetic student training records. Actual placement outcomes depend on company hiring policies, market conditions, and real-time interview performance.
        </p>
      </div>

      {/* CTA BUTTON */}
      <div className="text-center pt-2">
        <button
          onClick={onStartPredict}
          className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Try CareerPredict AI Predictor</span>
        </button>
      </div>

    </div>
  );
}
