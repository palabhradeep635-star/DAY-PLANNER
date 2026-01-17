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
          isToday: !isFuture, // Inject the future flag
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
      } else if (rawMsg.includes("429")) {
        friendlyMsg = "Rate limit exceeded. Wait for cool-down.";
      } else if (rawMsg.includes("not found")) {
        friendlyMsg = "The requested protocol is unavailable in this sector.";
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-enter" onClick={!loading ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl transition-opacity" />
      <div 
        className="apple-glass w-full max-w-lg relative z-10 p-6 sm:p-8 !rounded-t-[32px] !rounded-b-none sm:!rounded-[40px] border border-white/20 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto no-scrollbar" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden transition-all duration-500 ${isGemini ? 'theme-gradient-bg' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
               {isGemini ? <Sparkles className="w-5 h-5 text-white relative z-10" /> : <Bot className="w-5 h-5 text-white relative z-10" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white italic tracking-tighter leading-none mb-1">{providerLabel}</h2>
              <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.3em] font-mono truncate">{modelSubtext}</p>
            </div>
           </div>
           {!loading && (
             <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
               <X size={18} />
             </button>
           )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col gap-3 animate-enter">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Link Interrupted</p>
                <p className="text-[10px] text-red-400/80 leading-relaxed italic font-medium">{error}</p>
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

        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic font-mono ml-2">Direct_Input</label>
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white text-sm font-bold tracking-tight italic min-h-[120px] resize-none focus:border-white/30 transition-all outline-none placeholder:text-white/10"
            placeholder={isGemini ? "Neural focus targets..." : "ChatGPT prompt context..."}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => !loading && setDeepThink(!deepThink)}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-2 ${
              deepThink ? (isGemini ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'border-emerald-500 bg-emerald-500/10') : 'border-white/5 bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <Brain size={14} className={deepThink ? 'theme-text' : 'text-white/20'} />
              <div className={`w-9 h-5 rounded-full relative transition-all duration-500 ease-in-out ${deepThink ? 'bg-[var(--theme-primary)] shadow-[0_0_12px_var(--theme-primary-glow)]' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${deepThink ? 'translate-x-5 scale-110' : 'translate-x-1 scale-100'}`} />
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Deep Reasoning</span>
          </div>

          <div 
            onClick={() => !loading && setIsFuture(!isFuture)}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-2 ${
              isFuture ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <Calendar size={14} className={isFuture ? 'text-amber-500' : 'text-white/20'} />
              <div className={`w-9 h-5 rounded-full relative transition-all duration-500 ease-in-out ${isFuture ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isFuture ? 'translate-x-5 scale-110' : 'translate-x-1 scale-100'}`} />
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Future Vectors</span>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-black text-base italic uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
            loading ? 'bg-black/40 text-white border border-white/20 cursor-not-allowed' : (isGemini ? 'theme-gradient-bg text-white hover:scale-[1.02] active:scale-[0.98]' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/40')
          }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isGemini ? <Rocket className="w-5 h-5" /> : <Zap className="w-5 h-5" />)}
          <span>{loading ? 'Synthesizing...' : 'Launch Protocol'}</span>
        </button>

        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] text-center text-white/20 hover:text-white/40 transition-colors uppercase tracking-widest font-mono"
        >
          Apex Cloud Billing Status
        </a>
      </div>
    </div>
  );
};