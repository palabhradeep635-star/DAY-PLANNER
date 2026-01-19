import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, X, Rocket, Brain, AlertCircle, Key, Bot, Zap, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateStudyPlan } from '../../services/aiService';
import { Task } from '../../types';

interface AIModalProps {
  onClose: () => void;
}

export const AIModal: React.FC<AIModalProps> = ({ onClose }) => {
  const { tasks, addTask, settings, updateSettings } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(settings.lastAiPrompt || '');
  const [deepThink, setDeepThink] = useState(false);
  const [isFuture, setIsFuture] = useState(false);

  const isGemini = settings.aiProvider === 'gemini';
  const providerLabel = isGemini ? "NEURAL_SYNC" : "GPT_FORGE";
  const modelSubtext = isGemini ? "Apex Neural Protocol" : "ChatGPT Reasoning Model";

  useEffect(() => {
    updateSettings({ lastAiPrompt: prompt });
  }, [prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Input target directives before launching.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newTasks = await generateStudyPlan(tasks, settings.aiProvider, prompt, deepThink);
      newTasks.forEach(t => {
        addTask({ 
          ...t, 
          isToday: !isFuture, 
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          lastEdited: Date.now() 
        } as Task);
      });
      onClose();
    } catch (e: any) {
      console.error("Launch Error:", e);
      const rawMsg = e?.message || String(e);
      let friendlyMsg = "Neural sync failure. The core might be unreachable.";
      
      if (rawMsg.includes("401") || rawMsg.includes("key") || rawMsg.includes("403")) {
        friendlyMsg = "Authentication failed. Please select a valid Neural Key.";
      }

      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeySelect = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-swift-enter" onClick={!loading ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl transition-opacity duration-700" />
      
      <div 
        className="apple-glass w-full relative z-10 flex flex-col border border-white/10 shadow-2xl transition-all duration-700
                   !rounded-t-[40px] !rounded-b-none sm:!rounded-[40px]
                   h-[75vh] sm:h-auto sm:max-h-[min(90vh,740px)]
                   sm:w-[clamp(380px,55vw,520px)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex sm:hidden justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-8 space-y-6 sm:space-y-8">
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-4">
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-[20px] sm:rounded-[24px] flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-700 ${isGemini ? 'theme-gradient-bg' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                 {isGemini ? <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" /> : <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter leading-none mb-1.5">{providerLabel}</h2>
                <p className="text-[8px] sm:text-[10px] text-white/30 font-black uppercase tracking-[0.3em] font-mono truncate">{modelSubtext}</p>
              </div>
             </div>
             {!loading && (
               <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-all hover:rotate-90">
                 <X size={18} />
               </button>
             )}
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col gap-3 animate-swift-enter">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5">Link_Interrupted</p>
                  <p className="text-[10px] sm:text-xs text-red-400/80 leading-relaxed italic">{error}</p>
                </div>
              </div>
              <button 
                onClick={handleKeySelect}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Key size={12} /> Re-configure Access
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            <label className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic font-mono ml-3">Direct_Neural_Injection</label>
            <textarea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-[24px] p-5 sm:p-6 text-white text-sm sm:text-base font-bold italic min-h-[140px] sm:min-h-[180px] resize-none focus:border-white/30 transition-all outline-none placeholder:text-white/10 shadow-inner no-scrollbar"
              placeholder="Describe focus targets..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div 
              onClick={() => !loading && setDeepThink(!deepThink)}
              className={`p-4 sm:p-5 rounded-[24px] border transition-all duration-500 cursor-pointer flex flex-col gap-2.5 swift-hover shadow-xl ${
                deepThink ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'border-white/5 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${deepThink ? 'bg-white/10' : 'bg-white/5'}`}>
                  <Brain size={16} className={deepThink ? 'theme-text' : 'text-white/20'} />
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-all duration-700 ease-in-out ${deepThink ? 'theme-gradient-bg shadow-[0_0_12px_var(--theme-primary-glow)]' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-700 ${deepThink ? 'translate-x-5 scale-110' : 'translate-x-1 scale-100'}`} />
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white italic">Deep Reasoning</span>
            </div>

            <div 
              onClick={() => !loading && setIsFuture(!isFuture)}
              className={`p-4 sm:p-5 rounded-[24px] border transition-all duration-500 cursor-pointer flex flex-col gap-2.5 swift-hover shadow-xl ${
                isFuture ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${isFuture ? 'bg-amber-500/10' : 'bg-white/5'}`}>
                  <Calendar size={16} className={isFuture ? 'text-amber-500' : 'text-white/20'} />
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-all duration-700 ease-in-out ${isFuture ? 'bg-amber-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-700 ${isFuture ? 'translate-x-5 scale-110' : 'translate-x-1 scale-100'}`} />
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white italic">Future Vectors</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 pt-0">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 sm:py-5 rounded-[24px] font-black text-base sm:text-lg italic uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 relative overflow-hidden shadow-2xl active:scale-[0.98] active:shadow-[0_0_40px_var(--theme-primary-glow)] active:brightness-125 ${
              loading ? 'bg-black/40 text-white border border-white/20 cursor-not-allowed' : 'theme-gradient-bg text-white hover:scale-[1.02]'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
            <span>{loading ? 'Synthesizing...' : 'Launch Protocol'}</span>
          </button>

          <div className="mt-6 flex justify-center">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[8px] sm:text-[9px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-[0.3em] font-mono italic"
            >
              IGNITION Billing Protocol
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};