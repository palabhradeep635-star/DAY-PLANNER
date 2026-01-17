import React from 'react';
import { Target, Zap, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingScreen: React.FC = () => {
  const { updateSettings } = useApp();

  const handleStart = () => {
    updateSettings({ onboardingCompleted: true });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="mesh-container">
        <div className="blob blob-1 opacity-40" />
        <div className="blob blob-2 opacity-40" />
      </div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="w-20 h-20 theme-gradient-bg rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-[var(--theme-primary-glow)] animate-float border border-white/20">
          <Target className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">
          APEX IGNITION
        </h1>
        <p className="text-white/40 mb-12 text-sm leading-relaxed font-medium italic">
          High-performance neural task orchestration. Forge directives, track execution velocity, and synchronize with AI-powered study vectors.
        </p>

        <div className="grid gap-6 mb-12 text-left">
           <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl theme-gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase text-xs tracking-widest italic">Neural Directives</h3>
                <p className="text-[11px] text-white/30 mt-1">Autonomous study plans calibrated to your cognitive flow.</p>
              </div>
           </div>
           <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white/40" />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase text-xs tracking-widest italic">Local Persistence</h3>
                <p className="text-[11px] text-white/30 mt-1">Encryption-grade local storage ensures directive security.</p>
              </div>
           </div>
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-5 theme-gradient-bg text-white font-black rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic tracking-[0.2em] text-sm border border-white/10"
        >
          Initialize Sync
        </button>
      </div>
    </div>
  );
};