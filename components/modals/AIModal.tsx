import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, X, Bot, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateStudyPlan } from '../../services/aiService';
import { Task } from '../../types';

interface AIModalProps {
  onClose: () => void;
}

export const AIModal: React.FC<AIModalProps> = ({ onClose }) => {
  const { tasks, addTask, settings, updateSettings } = useApp();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(settings.lastAiPrompt || '');

  // Persist prompt to settings when it changes (debounce could be added in prod)
  useEffect(() => {
    updateSettings({ lastAiPrompt: prompt });
  }, [prompt]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newTasks = await generateStudyPlan(tasks, settings.aiProvider, prompt);
      newTasks.forEach(t => {
        addTask({ ...t, id: Date.now().toString() + Math.random(), lastEdited: Date.now() } as Task);
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={!loading ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-lg transition-opacity" />
      <div 
        className="glass-card w-full max-w-lg modal-slide-up relative z-10 !p-6 !rounded-[32px] border border-white/10 shadow-2xl" 
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(40px)' }}
      >
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl theme-gradient-bg flex items-center justify-center shadow-lg shadow-[var(--theme-primary)]/30">
               <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">AI Planner</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">Auto-schedule your day</p>
            </div>
           </div>
           {!loading && (
             <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
               <X size={18} className="text-gray-500 dark:text-gray-400" />
             </button>
           )}
        </div>

        {/* AI Service Toggle */}
        <div className="bg-gray-100 dark:bg-black/20 p-1.5 rounded-2xl flex mb-6 relative border border-white/5">
          <button 
            onClick={() => updateSettings({ aiProvider: 'gemini' })}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${settings.aiProvider === 'gemini' ? 'shadow-md bg-white dark:bg-white/10 theme-text' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <Zap size={16} className={settings.aiProvider === 'gemini' ? "theme-text" : ""} />
            Gemini 2.5
          </button>
          <button 
            onClick={() => updateSettings({ aiProvider: 'chatgpt' })}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${settings.aiProvider === 'chatgpt' ? 'shadow-md bg-white dark:bg-white/10 theme-text' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <Bot size={16} className={settings.aiProvider === 'chatgpt' ? "theme-text" : ""} />
            ChatGPT
          </button>
        </div>

        <div className="mb-6 group">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">Custom Focus</label>
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)}
            className="input-field min-h-[140px] resize-none focus:ring-0 !bg-white/5 dark:!bg-black/20 border-white/5 transition-all duration-500"
            placeholder={settings.aiProvider === 'gemini' ? "E.g., Focus heavily on dynamic programming patterns..." : "E.g., Generate tasks for System Design..."}
            disabled={loading}
            style={{ 
              borderColor: loading ? 'var(--theme-primary)' : 'rgba(255,255,255,0.1)',
              boxShadow: loading ? '0 0 25px -5px var(--theme-primary)' : 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all duration-500 flex items-center justify-center gap-3 disabled:cursor-not-allowed relative overflow-hidden group 
            ${loading ? 'text-white' : 'theme-gradient-bg text-white hover:shadow-xl active:scale-[0.98] hover:shadow-[var(--theme-primary)]/50'}`}
          style={loading ? {
            background: 'var(--bg-color)',
            boxShadow: '0 0 40px -5px var(--theme-primary)',
            borderColor: 'var(--theme-primary)',
            borderWidth: '1px'
          } : undefined}
        >
          {loading && (
             <div 
               className="absolute inset-0 opacity-100 animate-gradient-flow" 
               style={{ 
                 background: 'linear-gradient(90deg, var(--theme-primary), var(--theme-secondary), #3b82f6, var(--theme-primary))',
                 backgroundSize: '200% 100%',
               }} 
             />
          )}
          
          <div className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">Generating Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Generate with {settings.aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'}</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};