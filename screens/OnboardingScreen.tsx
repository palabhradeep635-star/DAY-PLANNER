import React from 'react';
import { Target, Zap, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingScreen: React.FC = () => {
  const { updateSettings } = useApp();

  const handleStart = () => {
    updateSettings({ onboardingCompleted: true });
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30 animate-float">
          <Target className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
          Master DSA
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed">
          Your AI-powered companion to crush technical interviews. Track progress, time your code, and generate personalized study plans.
        </p>

        <div className="grid gap-6 mb-10 text-left">
           <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">AI Generated Plans</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Custom daily tasks based on your pace.</p>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Privacy First</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your data stays local on your device.</p>
              </div>
           </div>
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all scale-tap"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};