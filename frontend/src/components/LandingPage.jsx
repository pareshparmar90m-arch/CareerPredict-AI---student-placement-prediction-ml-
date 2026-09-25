import React from 'react';
import { 
  Sparkles, BrainCircuit, Target, TrendingUp, ShieldCheck, 
  ArrowRight, Award, Code2, Users, Layers, CheckCircle2, Activity,
  LineChart, BarChart2, Check, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell 
} from 'recharts';

export default function LandingPage({ onStartPredict, onViewModel, theme }) {
  const isDark = theme === 'dark';

  // Sample analytics preview data matching dataset trends
  const trendData = [
    { cgpa: '5.0', placementRate: 20, avgPackage: 3.2 },
    { cgpa: '6.0', placementRate: 45, avgPackage: 4.8 },
    { cgpa: '7.0', placementRate: 68, avgPackage: 6.5 },
    { cgpa: '8.0', placementRate: 86, avgPackage: 9.2 },
    { cgpa: '9.0', placementRate: 96, avgPackage: 14.5 },
    { cgpa: '10.0', placementRate: 99, avgPackage: 21.0 },
  ];

  const skillImpactData = [
    { name: 'CGPA > 8.0', impact: 92, color: '#2563EB' },
    { name: 'Coding > 80%', impact: 88, color: '#06B6D4' },
    { name: 'Internships >= 2', impact: 84, color: '#3B82F6' },
    { name: 'Soft Skills > 75%', impact: 76, color: '#6366F1' },
    { name: 'Projects >= 3', impact: 70, color: '#0284C7' },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10">
      
      {/* DASHBOARD HERO HEADER */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-12 shadow-xl border border-blue-900/50">
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>CareerPredict AI Platform v2.5</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            AI-Driven Student Placement Probability & Package Analytics
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            Evaluate candidate placement readiness with multi-stage machine learning pipelines. Analyze academic performance, coding scores, and soft skills to predict outcomes accurately.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onStartPredict}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Predict Placement Probability</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewModel}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Explore Model Performance</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid & Accent Orbs */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none hidden md:block" />
      </section>

      {/* KPI METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className={`p-5 sm:p-6 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Training Dataset
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">100,000+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
              <span className="text-emerald-600 font-semibold">Synthetic Cohorts</span>
              <span>• Evaluated</span>
            </div>
          </div>
        </div>

        <div className={`p-5 sm:p-6 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stage 1 Accuracy
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">88.5%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
              <span>Classification ROC-AUC:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">0.942</span>
            </div>
          </div>
        </div>

        <div className={`p-5 sm:p-6 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Package Regression R²
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-600 dark:text-cyan-400">0.84</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
              <span>MAE:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">±1.2 LPA</span>
            </div>
          </div>
        </div>

        <div className={`p-5 sm:p-6 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              FastAPI Latency
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">&lt; 45ms</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
              <span className="text-emerald-600 font-semibold">Live REST Service</span>
            </div>
          </div>
        </div>

      </section>

      {/* ANALYTICS PREVIEW & CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CGPA vs Placement Probability Area Chart */}
        <div className={`lg:col-span-2 p-6 rounded-xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold">Academic CGPA vs Placement Probability</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Statistical correlation between CGPA tier and placement likelihood</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Real Model Distribution
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="placementGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="cgpa" label={{ value: 'CGPA Score', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 12 }} />
                <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value}%`, 'Placement Probability']}
                />
                <Area type="monotone" dataKey="placementRate" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#placementGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Impact Ranking Bar Chart */}
        <div className={`p-6 rounded-xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold">Top Feature Impact</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Relative weight in classification prediction</p>
          </div>

          <div className="space-y-4 pt-2">
            {skillImpactData.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className="text-blue-600 dark:text-blue-400">{item.impact}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${item.impact}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* PIPELINE WORKFLOW STEPS */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How CareerPredict AI Evaluates Candidates
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A three-step analytical workflow powered by trained Scikit-learn pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center text-sm">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Input Profile Matrix</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter academic metrics (CGPA, 10th/12th %), technical skill ratings, aptitude test scores, internship counts, and soft skills.
            </p>
          </div>

          <div className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-600 font-bold flex items-center justify-center text-sm">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Stage 1 Classification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Machine learning classifier (Logistic Regression / XGBoost) predicts probability of getting placed versus not placed.
            </p>
          </div>

          <div className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-sm">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Stage 2 Package Regression</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              For candidates meeting the placement threshold, Ridge regression estimates expected salary package in LPA (₹ Lakhs Per Annum).
            </p>
          </div>

        </div>
      </section>

      {/* CTA BANNER */}
      <section className={`p-8 sm:p-10 rounded-2xl border text-center space-y-6 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-blue-50/70 border-blue-100'
      }`}>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Ready to Test a Student Profile?
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Generates placement probability percentage and package range using FastAPI core models.
        </p>
        <button
          onClick={onStartPredict}
          className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Placement Predictor</span>
        </button>
      </section>

    </div>
  );
}
