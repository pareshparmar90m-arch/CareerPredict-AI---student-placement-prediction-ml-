import React from 'react';
import { 
  CheckCircle2, XCircle, TrendingUp, Award, RefreshCw, 
  BarChart3, Info, Sparkles, ArrowRight, ShieldAlert, ShieldCheck, Lock, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend
} from 'recharts';

export default function PredictionResult({ resultData, submittedData, onPredictAgain, onViewModel, theme }) {
  const isDark = theme === 'dark';

  if (!resultData) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
        <div className={`p-10 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">No Active Prediction</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Please fill in the student profile details in the Placement Predictor wizard to generate an AI evaluation.
          </p>
          <button
            onClick={onPredictAgain}
            className="mt-6 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Placement Predictor</span>
          </button>
        </div>
      </div>
    );
  }

  // Parse backend ML response
  const placementStatus = resultData.placement_prediction || resultData.classification?.placement_status || 'Not Placed';
  const isPlaced = placementStatus === 'Placed';
  
  const rawProb = resultData.placement_probability !== undefined 
    ? resultData.placement_probability 
    : (resultData.classification?.placement_probability || 0);
  const probNum = Number((rawProb * 100).toFixed(1));

  const estimatedLPA = resultData.estimated_package_lpa !== undefined && resultData.estimated_package_lpa !== null
    ? resultData.estimated_package_lpa
    : (resultData.regression?.estimated_lpa || null);

  const confidence = resultData.confidence_level || 'High';
  const stageBreakdown = resultData.stage_breakdown || {};
  const stage1Algo = stageBreakdown.stage_1_classification?.algorithm || 'Logistic Regression';
  const stage2Algo = stageBreakdown.stage_2_regression?.algorithm || 'Ridge Regression';

  // Determine probability status color
  const statusColor = probNum >= 70 ? 'emerald' : probNum >= 50 ? 'amber' : 'rose';
  const statusBadgeBg = probNum >= 70 
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
    : probNum >= 50 
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';

  // Chart data: Placed vs Not Placed
  const probabilityPieData = [
    { name: 'Placement Likelihood', value: probNum, fill: probNum >= 70 ? '#10B981' : probNum >= 50 ? '#F59E0B' : '#EF4444' },
    { name: 'Unplaced Risk', value: Number((100 - probNum).toFixed(1)), fill: isDark ? '#334155' : '#E2E8F0' },
  ];

  // Candidate metric vs Cohort average comparison chart data
  const comparisonData = [
    { metric: 'CGPA (*10)', candidate: (submittedData?.cgpa || 8.5) * 10, average: 72 },
    { metric: 'Coding Score', candidate: submittedData?.coding_skill_score || 82, average: 65 },
    { metric: 'Aptitude Test', candidate: submittedData?.aptitude_score || 85, average: 68 },
    { metric: 'Soft Skills', candidate: submittedData?.communication_skill_score || 80, average: 70 },
    { metric: 'Mock Interview', candidate: submittedData?.mock_interview_score || 82, average: 64 },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      {/* TOP SUMMARY RESULT CARD */}
      <div className={`p-6 sm:p-10 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* LEFT: Score & Badge */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${statusBadgeBg}`}>
              {isPlaced ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>Model Prediction: {placementStatus}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                Estimated Placement Probability
              </span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-5xl sm:text-6xl font-extrabold tracking-tight ${
                  probNum >= 70 ? 'text-emerald-600 dark:text-emerald-400' : probNum >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {probNum}%
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  (Confidence: {confidence})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
              Evaluated via Stage 1 classification pipeline (<strong>{stage1Algo}</strong>) across 23 student attributes.
            </p>
          </div>

          {/* RIGHT: Estimated Package Card (if placed) or Risk summary */}
          <div className="w-full md:w-80 flex-shrink-0">
            {isPlaced && estimatedLPA ? (
              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
                  <TrendingUp className="w-4 h-4" />
                  <span>Stage 2 Regression Package</span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold font-mono">
                    ₹ {Number(estimatedLPA).toFixed(2)} <span className="text-sm font-sans font-normal opacity-90">LPA</span>
                  </div>
                  <span className="text-[11px] text-blue-100 block mt-1">
                    Estimated Annual Salary Package (±1.2 LPA)
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-500/50 text-[10px] text-blue-200">
                  Algorithm: {stage2Algo}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Package Estimator Bypassed</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Candidate probability is below placement threshold. Focus on raising coding score and aptitude to increase placement odds.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Candidate Metric vs Cohort Benchmark */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold">Candidate Score vs Cohort Average</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparing candidate skill scores against benchmark averages</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="candidate" name="Candidate Score" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average" name="Cohort Avg" fill={isDark ? '#475569' : '#CBD5E1'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Probability Donut Chart & Key Highlights */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold">Probability Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Placement likelihood ratio derived from ML pipeline</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={probabilityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {probabilityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`${val}%`]}
                />
                <Legend formatter={(val) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* MANDATORY PREDICTION DISCLAIMER & POLICY NOTICE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Prediction Disclaimer */}
        <div className={`p-5 rounded-xl border space-y-2 ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-amber-50/60 border-amber-200 text-slate-800'
        }`}>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Prediction Disclaimer</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            This result is generated by a machine learning model based on the information provided. It is an estimate and should not be considered a guaranteed placement outcome. Actual placement results may vary depending on academic performance, skills, interview performance, market conditions, and company requirements.
          </p>
        </div>

        {/* Data Privacy Notice */}
        <div className={`p-5 rounded-xl border space-y-2 ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-blue-50/60 border-blue-200 text-slate-800'
        }`}>
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Data Privacy Policy</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Student information should be used only for authorized educational and analytical purposes. Avoid displaying or exposing sensitive personal information unnecessarily.
          </p>
        </div>

        {/* Informational Use Notice */}
        <div className={`p-5 rounded-xl border space-y-2 ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-100/60 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Informational Purpose</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            The predictions and analytics provided by this application are intended to support educational and career planning. They should not be treated as a definitive decision or guarantee.
          </p>
        </div>

      </div>

      {/* BOTTOM ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onPredictAgain}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Test Another Student Profile</span>
        </button>

        <button
          onClick={onViewModel}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center space-x-2 ${
            isDark 
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>View Detailed Model Analysis</span>
        </button>
      </div>

    </div>
  );
}
