import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import PredictionWizard from './components/PredictionWizard';
import PredictionResult from './components/PredictionResult';
import ModelInfoDashboard from './components/ModelInfoDashboard';
import AboutPage from './components/AboutPage';

import { predictStudentPlacement, getModelMetadata, checkApiHealth } from './services/predictionService';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const [resultData, setResultData] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  // Theme State: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check FastAPI status on load and periodically
  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkApiStatus = async () => {
    try {
      await checkApiHealth();
      setIsApiOnline(true);
      setApiError(null);
    } catch (err) {
      console.warn('FastAPI backend connection check failed:', err);
      setIsApiOnline(false);
    }
  };

  const handlePredictSubmit = async (formData) => {
    setIsLoading(true);
    setApiError(null);
    setSubmittedData(formData);
    try {
      const response = await predictStudentPlacement(formData);
      setResultData(response);
      setActiveTab('result');
      setIsApiOnline(true);
    } catch (err) {
      setApiError(err.message || 'Failed to communicate with FastAPI prediction engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col justify-between transition-colors duration-300 relative ${
      theme === 'dark' 
        ? 'dark bg-slate-950 text-slate-100 selection:bg-blue-900 selection:text-white' 
        : 'light bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900'
    }`}>
      <div className="relative z-10 flex flex-col justify-between min-h-[100dvh]">
        
        {/* Top Navbar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isApiOnline={isApiOnline} 
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Main Content Viewport */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'home' && (
            <LandingPage 
              onStartPredict={() => setActiveTab('predict')} 
              onViewModel={() => setActiveTab('model')} 
              theme={theme}
            />
          )}

          {activeTab === 'predict' && (
            <PredictionWizard 
              onSubmit={handlePredictSubmit} 
              isLoading={isLoading} 
              apiError={apiError} 
              theme={theme}
            />
          )}

          {activeTab === 'result' && (
            <PredictionResult 
              resultData={resultData} 
              submittedData={submittedData} 
              onPredictAgain={() => {
                setResultData(null);
                setActiveTab('predict');
              }} 
              onViewModel={() => setActiveTab('model')} 
              theme={theme}
            />
          )}

          {activeTab === 'model' && (
            <ModelInfoDashboard theme={theme} />
          )}

          {activeTab === 'about' && (
            <AboutPage 
              onStartPredict={() => setActiveTab('predict')} 
              theme={theme}
            />
          )}
        </main>

        {/* Bottom Footer */}
        <Footer setActiveTab={setActiveTab} theme={theme} />

      </div>
    </div>
  );
}
