import React, { useState } from 'react';
import { 
  GraduationCap, Code2, Users, Sparkles, ArrowRight, ArrowLeft, 
  CheckCircle2, AlertCircle, RefreshCw, Layers, Sliders, ShieldCheck, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DEFAULT_FORM_DATA = {
  age: 21,
  gender: 'Female',
  cgpa: 8.5,
  branch: 'CSE',
  college_tier: 'Tier 1',
  internships_count: 2,
  projects_count: 4,
  certifications_count: 3,
  coding_skill_score: 82.0,
  aptitude_score: 85.0,
  communication_skill_score: 80.0,
  logical_reasoning_score: 84.0,
  hackathons_participated: 2,
  github_repos: 12,
  linkedin_connections: 350,
  mock_interview_score: 82.0,
  attendance_percentage: 90.0,
  backlogs: 0,
  extracurricular_score: 75.0,
  leadership_score: 80.0,
  volunteer_experience: 'Yes',
  sleep_hours: 7.0,
  study_hours_per_day: 4.5,
};

export default function PredictionWizard({ onSubmit, isLoading, apiError, theme }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});

  const isDark = theme === 'dark';

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (formData.cgpa < 0 || formData.cgpa > 10) newErrors.cgpa = 'CGPA must be between 0.0 and 10.0';
      if (formData.attendance_percentage < 0 || formData.attendance_percentage > 100) newErrors.attendance_percentage = 'Attendance must be between 0 and 100%';
      if (formData.backlogs < 0) newErrors.backlogs = 'Backlogs cannot be negative';
    }
    if (step === 2) {
      if (formData.coding_skill_score < 0 || formData.coding_skill_score > 100) newErrors.coding_skill_score = 'Score must be 0-100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const steps = [
    { num: 1, title: 'Academic Performance', icon: GraduationCap },
    { num: 2, title: 'Technical Skills', icon: Code2 },
    { num: 3, title: 'Professional Skills', icon: Users },
    { num: 4, title: 'Extracurriculars', icon: Layers },
    { num: 5, title: 'Review & Predict', icon: Sparkles },
  ];

  const inputStyle = `w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
  }`;

  return (
    <div className="max-w-4xl mx-auto py-6">
      
      {/* SaaS Wizard Card Container */}
      <div className={`p-6 sm:p-10 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>Placement Candidate Form</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Student Profile Assessment</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete candidate markers to compute AI placement probability and package estimate.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setFormData(DEFAULT_FORM_DATA)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors w-fit ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Values</span>
          </button>
        </div>

        {/* Navigation Step Progress Bar */}
        <div className="py-6">
          <div className="flex items-center justify-between relative px-2 sm:px-6">
            <div className="absolute top-5 left-[8%] w-[84%] h-[2px] bg-slate-200 dark:bg-slate-800 -z-0" />
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isDone = step.num < currentStep;
              const isCurrent = step.num === currentStep;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => isDone && setCurrentStep(step.num)}
                  disabled={!isDone && !isCurrent}
                  className="flex flex-col items-center group relative z-10 bg-transparent focus:outline-none"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 font-bold border-2 ${
                    isCurrent 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 scale-105' 
                      : isDone 
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isDark ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className={`hidden md:block text-[11px] font-semibold mt-2 whitespace-nowrap transition-colors ${
                    isCurrent ? 'text-blue-600 dark:text-blue-400 font-bold' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* API Error Banner State */}
        {apiError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Unable to generate the prediction right now. Please verify your inputs and try again.</span>
              <p className="text-xs opacity-80 mt-1">{apiError}</p>
            </div>
          </div>
        )}

        {/* STEP CONTENT FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ACADEMIC PERFORMANCE */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Academic Performance Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* CGPA Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">CGPA (Cumulative Grade Point Average) *</label>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm">{formData.cgpa.toFixed(2)} / 10.0</span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="10.0"
                      step="0.05"
                      value={formData.cgpa}
                      onChange={(e) => handleChange('cgpa', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-blue-600 cursor-pointer"
                    />
                    {errors.cgpa && <p className="text-xs text-rose-500">{errors.cgpa}</p>}
                  </div>

                  {/* Branch Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Degree Branch *</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => handleChange('branch', e.target.value)}
                      className={inputStyle}
                    >
                      <option value="CSE">CSE (Computer Science & Eng)</option>
                      <option value="IT">IT (Information Technology)</option>
                      <option value="ECE">ECE (Electronics & Comm)</option>
                      <option value="EEE">EEE (Electrical & Electronics)</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                      <option value="Civil">Civil Engineering</option>
                    </select>
                  </div>

                  {/* College Tier Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">College Institution Tier *</label>
                    <select
                      value={formData.college_tier}
                      onChange={(e) => handleChange('college_tier', e.target.value)}
                      className={inputStyle}
                    >
                      <option value="Tier 1">Tier 1 (Premier / IIT / NIT / BITS / Top Univ)</option>
                      <option value="Tier 2">Tier 2 (Established Regional State College)</option>
                      <option value="Tier 3">Tier 3 (Affiliated Private College)</option>
                    </select>
                  </div>

                  {/* Attendance Percentage Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Attendance Rate (%) *</label>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm">{formData.attendance_percentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="1"
                      value={formData.attendance_percentage}
                      onChange={(e) => handleChange('attendance_percentage', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Active / Past Backlogs */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Backlogs Count *</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.backlogs}
                      onChange={(e) => handleChange('backlogs', parseInt(e.target.value) || 0)}
                      className={inputStyle}
                    />
                  </div>

                  {/* Daily Study Hours */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Daily Study Hours *</label>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm">{formData.study_hours_per_day} hrs/day</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="12.0"
                      step="0.5"
                      value={formData.study_hours_per_day}
                      onChange={(e) => handleChange('study_hours_per_day', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-blue-600 cursor-pointer"
                    />
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 2: TECHNICAL & PROBLEM SOLVING SKILLS */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
                  <Code2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Technical & Coding Competencies</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Coding Skill Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Coding Skill Score (0-100) *</label>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">{formData.coding_skill_score} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={formData.coding_skill_score}
                      onChange={(e) => handleChange('coding_skill_score', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-cyan-600 cursor-pointer"
                    />
                  </div>

                  {/* Aptitude Test Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Aptitude Test Score (0-100) *</label>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">{formData.aptitude_score} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={formData.aptitude_score}
                      onChange={(e) => handleChange('aptitude_score', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-cyan-600 cursor-pointer"
                    />
                  </div>

                  {/* Logical Reasoning Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Logical Reasoning Score *</label>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">{formData.logical_reasoning_score} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={formData.logical_reasoning_score}
                      onChange={(e) => handleChange('logical_reasoning_score', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-cyan-600 cursor-pointer"
                    />
                  </div>

                  {/* Completed Projects Count */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Major Completed Projects *</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={formData.projects_count}
                      onChange={(e) => handleChange('projects_count', parseInt(e.target.value) || 0)}
                      className={inputStyle}
                    />
                  </div>

                  {/* GitHub Repos */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Public GitHub Repositories *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.github_repos}
                      onChange={(e) => handleChange('github_repos', parseInt(e.target.value) || 0)}
                      className={inputStyle}
                    />
                  </div>

                  {/* Completed Internships */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Industry Internships Completed *</label>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      value={formData.internships_count}
                      onChange={(e) => handleChange('internships_count', parseInt(e.target.value) || 0)}
                      className={inputStyle}
                    />
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 3: PROFESSIONAL READINESS */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Professional Readiness & Soft Skills</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Communication Skill Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Communication Skill Score *</label>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-sm">{formData.communication_skill_score} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={formData.communication_skill_score}
                      onChange={(e) => handleChange('communication_skill_score', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Mock Interview Rating */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Mock Interview Performance Rating *</label>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-sm">{formData.mock_interview_score} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={formData.mock_interview_score}
                      onChange={(e) => handleChange('mock_interview_score', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Technical Certifications */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Verified Certifications *</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.certifications_count}
                      onChange={(e) => handleChange('certifications_count', parseInt(e.target.value) || 0)}
                      className={inputStyle}
                    />
                  </div>

                  {/* LinkedIn Connections */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">LinkedIn Connections Count *</label>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={formData.linkedin_connections}
                      onChange={(e) => handleChange('linkedin_connections', parseInt(e.target.value) || 0)}
                      className={inputStyle}
                    />
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 4: EXTRACURRICULARS & LEADERSHIP */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
                  <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Extracurricular & Leadership Background</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Extracurricular Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Extracurricular Activity Score *</label>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">{formData.extracurricular_score} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.extracurricular_score}
                      onChange={(e) => handleChange('extracurricular_score', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Leadership Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700 dark:text-slate-300">Leadership Experience Rating *</label>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">{formData.leadership_score} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.leadership_score}
                      onChange={(e) => handleChange('leadership_score', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Volunteer Experience */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Volunteer Experience *</label>
                    <select
                      value={formData.volunteer_experience}
                      onChange={(e) => handleChange('volunteer_experience', e.target.value)}
                      className={inputStyle}
                    >
                      <option value="Yes">Yes (NSS / Community Leadership)</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Hackathons Participated */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hackathons Participated *</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.hackathons_participated}
                      onChange={(e) => handleChange('hackathons_participated', parseInt(e.target.value) || 0)}
                      className={inputStyle}
                    />
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 5: REVIEW & PREDICT */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Review Candidate Profile & Confirm Execution</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider block">Academics</span>
                    <p>CGPA: <strong className="font-mono">{formData.cgpa}</strong> | Branch: <strong>{formData.branch}</strong></p>
                    <p>Tier: <strong>{formData.college_tier}</strong> | Backlogs: <strong className="font-mono">{formData.backlogs}</strong></p>
                    <p>Attendance: <strong className="font-mono">{formData.attendance_percentage}%</strong></p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 text-xs uppercase tracking-wider block">Technical Competencies</span>
                    <p>Coding Score: <strong className="font-mono">{formData.coding_skill_score}/100</strong></p>
                    <p>Aptitude: <strong className="font-mono">{formData.aptitude_score}/100</strong> | Projects: <strong className="font-mono">{formData.projects_count}</strong></p>
                    <p>GitHub Repos: <strong className="font-mono">{formData.github_repos}</strong> | Internships: <strong className="font-mono">{formData.internships_count}</strong></p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs uppercase tracking-wider block">Professional Readiness</span>
                    <p>Communication: <strong className="font-mono">{formData.communication_skill_score}/100</strong></p>
                    <p>Mock Interview: <strong className="font-mono">{formData.mock_interview_score}/100</strong></p>
                    <p>LinkedIn Connections: <strong className="font-mono">{formData.linkedin_connections}</strong></p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider block">Leadership & Personal</span>
                    <p>Leadership Score: <strong className="font-mono">{formData.leadership_score}/100</strong></p>
                    <p>Volunteer Exp: <strong>{formData.volunteer_experience}</strong></p>
                    <p>Hackathons: <strong className="font-mono">{formData.hackathons_participated}</strong></p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* WIZARD ACTIONS FOOTER BUTTONS */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className={`px-5 py-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-2 ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-sm"
              >
                <span>Next Section</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating prediction...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Predict Placement Probability</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
