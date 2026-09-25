import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Award, Target, TrendingUp, RefreshCw, 
  CheckCircle2, Layers, AlertCircle, Sparkles, Activity, ShieldCheck,
  FileSpreadsheet, HelpCircle
} from 'lucide-react';
import { getModelMetadata, getStatisticalAnalysis } from '../services/predictionService';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell 
} from 'recharts';

export default function ModelInfoDashboard({ theme }) {
  const [metadata, setMetadata] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metaRes, statsRes] = await Promise.all([
        getModelMetadata(),
        getStatisticalAnalysis().catch(() => null)
      ]);
      setMetadata(metaRes);
      if (statsRes && statsRes.statistical_analysis) {
        setStatsData(statsRes.statistical_analysis);
      } else if (metaRes && metaRes.statistical_analysis) {
        setStatsData(metaRes.statistical_analysis);
      }
    } catch (err) {
      console.error('Failed to load model metadata:', err);
      setError('Could not connect to FastAPI server to retrieve live model metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading Live ML Pipelines & Statistical Metrics...</p>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className={`p-10 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'}`}>
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-2xl font-bold mt-4">Metrics Connection Error</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-6 px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { dataset_info, classification, regression, feature_importance } = metadata;

  // 1. Classification Bar Chart Data
  const classComparisonData = classification.all_candidates.map(c => ({
    name: c.model_name.replace(' Classifier', '').replace(' Ensemble', ''),
    'CV ROC-AUC': Number((c.cv_roc_auc_mean * 100).toFixed(1)),
    'Test Accuracy': Number((c.accuracy * 100).toFixed(1)),
    'Test F1': Number((c.f1_score * 100).toFixed(1)),
    'Test ROC-AUC': Number((c.roc_auc * 100).toFixed(1)),
  }));

  // 2. Feature Importance Horizontal Chart Data
  const featureImportanceData = (feature_importance || []).map((fi, idx) => ({
    feature: fi.feature.replace('_', ' ').replace('_', ' ').toUpperCase(),
    importance: fi.importance,
    fill: ['#2563EB', '#06B6D4', '#3B82F6', '#6366F1', '#0284C7', '#0891B2', '#4F46E5', '#0284C7', '#2563EB', '#0369A1'][idx % 10]
  }));

  // 3. Confusion Matrix Extraction [[TN, FP], [FN, TP]]
  const cm = classification.metrics.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0][0];
  const fp = cm[0][1];
  const fn = cm[1][0];
  const tp = cm[1][1];

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>FastAPI Analytics Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Model Performance & Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            100% Calculated Metrics: 5-Fold Cross Validation, Untouched Test Set Evaluation & Statistical Tests.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all w-fit ${
            isDark 
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Live Metrics</span>
        </button>
      </div>

      {/* KPI METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Dataset Records</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono mt-2">
            {dataset_info.total_records.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Real Kaggle Dataset</span>
        </div>

        <div className={`p-5 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Placement Ratio</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono mt-2 text-emerald-600 dark:text-emerald-400">
            {((dataset_info.placed_count / dataset_info.total_records) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {dataset_info.placed_count.toLocaleString()} Placed Candidates
          </span>
        </div>

        <div className={`p-5 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Classifier</span>
          <div className="text-lg font-bold truncate mt-2 text-blue-600 dark:text-blue-400">
            {classification.selected_algorithm}
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 block">
            5-Fold CV AUC: {(classification.metrics.cv_roc_auc_mean * 100).toFixed(1)}%
          </span>
        </div>

        <div className={`p-5 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Regressor</span>
          <div className="text-lg font-bold truncate mt-2 text-cyan-600 dark:text-cyan-400">
            {regression.selected_algorithm}
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 block">
            MAE: ₹{regression.metrics.mae} LPA
          </span>
        </div>

      </div>

      {/* RECHARTS DATA VISUALIZATION SECTION 1: CLASSIFICATION MODEL COMPARISON */}
      <div className={`p-6 rounded-2xl border space-y-6 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}>
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Stage 1 Classification Model Comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Calculated 5-Fold CV Mean vs Untouched 20% Holdout Test Evaluation</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Recharts Visualizer
          </span>
        </div>

        {/* Grouped Bar Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classComparisonData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value}%`]}
              />
              <Legend formatter={(val) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{val}</span>} />
              <Bar dataKey="CV ROC-AUC" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Test Accuracy" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Test F1" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Test ROC-AUC" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Metrics Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Algorithm</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">5-Fold CV AUC</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Accuracy</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Precision</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Recall</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">F1 Score</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Test ROC AUC</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {classification.all_candidates.map((cand, idx) => {
                const isSelected = cand.model_name === classification.selected_algorithm;
                return (
                  <tr key={idx} className={isSelected ? (isDark ? 'bg-blue-950/40' : 'bg-blue-50/70') : ''}>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">{cand.model_name}</td>
                    <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{(cand.cv_roc_auc_mean * 100).toFixed(1)}% (±{(cand.cv_roc_auc_std * 100).toFixed(1)}%)</td>
                    <td className="py-3">{(cand.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3">{(cand.precision * 100).toFixed(1)}%</td>
                    <td className="py-3">{(cand.recall * 100).toFixed(1)}%</td>
                    <td className="py-3">{(cand.f1_score * 100).toFixed(1)}%</td>
                    <td className="py-3 font-bold text-blue-600 dark:text-blue-400">{(cand.roc_auc * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3">
                      {isSelected ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-sans font-bold bg-blue-600 text-white">
                          Selected Pipeline
                        </span>
                      ) : (
                        <span className="text-[10px] font-sans text-slate-400">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECHARTS DATA VISUALIZATION SECTION 2: FEATURE IMPORTANCE & CONFUSION MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Horizontal Feature Importance Chart */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold">Feature Importance Weights</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Calculated weights from trained Scikit-learn Classifier pipeline</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={featureImportanceData}>
                <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`${val}%`, 'Weight']}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureImportanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Card (2x2 Grid) */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold">Classifier Confusion Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Evaluation on 20,000 untouched test set records</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                True Positive (Placed)
              </span>
              <div className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                {tp.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Correctly Predicted Placed</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                False Positive (Type I)
              </span>
              <div className="text-2xl font-extrabold font-mono text-rose-700 dark:text-rose-300">
                {fp.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Incorrectly Predicted Placed</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                False Negative (Type II)
              </span>
              <div className="text-2xl font-extrabold font-mono text-amber-700 dark:text-amber-300">
                {fn.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Missed Placements</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center space-y-1">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                True Negative (Unplaced)
              </span>
              <div className="text-2xl font-extrabold font-mono text-blue-700 dark:text-blue-300">
                {tn.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Correctly Predicted Unplaced</span>
            </div>
          </div>
        </div>

      </div>

      {/* STATISTICAL ANALYSIS SECTION (Chi-Square & Correlations) */}
      {statsData && statsData.chi_square_tests && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>Chi-Square Tests of Independence & Correlations</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rigorous hypothesis testing evaluated on 100,000 student records</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Categorical Feature</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Chi2 Stat</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Degrees of Freedom</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">p-Value</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Cramer's V</th>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Statistical Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {statsData.chi_square_tests.map((test, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white capitalize">{test.feature.replace('_', ' ')}</td>
                    <td className="py-3 font-mono">{test.chi2_stat}</td>
                    <td className="py-3">{test.degrees_of_freedom}</td>
                    <td className="py-3">{test.p_value}</td>
                    <td className="py-3 font-bold text-blue-600">{test.cramers_v}</td>
                    <td className="py-3 px-3">
                      {test.is_statistically_significant ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Significant (p &lt; 0.05)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-sans text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                          Not Significant (p ≥ 0.05)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGRESSION MODEL METRICS SECTION */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}>
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold">Stage 2 Package Regression Evaluation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Salary estimation models evaluated via 5-Fold CV R², MAE, RMSE, and Test R²</p>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Regressor Model</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">5-Fold CV R²</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">MAE (₹ LPA)</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">RMSE (₹ LPA)</th>
                <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Test R² Variance Score</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {regression.all_candidates.map((cand, idx) => {
                const isSelected = cand.model_name === regression.selected_algorithm;
                return (
                  <tr key={idx} className={isSelected ? (isDark ? 'bg-blue-950/40' : 'bg-blue-50/70') : ''}>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">{cand.model_name}</td>
                    <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{(cand.cv_r2_mean * 100).toFixed(1)}% (±{(cand.cv_r2_std * 100).toFixed(1)}%)</td>
                    <td className="py-3 font-bold text-blue-600 dark:text-blue-400">₹{cand.mae} LPA</td>
                    <td className="py-3">₹{cand.rmse} LPA</td>
                    <td className="py-3 font-bold">{(cand.r2_score * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3">
                      {isSelected ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-sans font-bold bg-blue-600 text-white">
                          Selected Pipeline
                        </span>
                      ) : (
                        <span className="text-[10px] font-sans text-slate-400">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
