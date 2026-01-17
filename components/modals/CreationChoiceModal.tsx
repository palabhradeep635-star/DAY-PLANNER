import React from 'react';
import { X, Sparkles, Rocket, Cpu } from 'lucide-react';

interface CreationChoiceModalProps {
  onClose: () => void;
  onManual: () => void;
  onAI: () => void;
}

export const CreationChoiceModal: React.FC<CreationChoiceModalProps> = ({ onClose, onManual, onAI }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 animate-enter" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl transition-opacity" />
      <div 
        className="ignition-card w-full max-w-sm relative z-10 !p-12 flex flex-col items-center text-center gap-10 border-white/20 shadow-[0_0_100px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 w-12 h-12 rounded-[24px] bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90"
        >
          <X size={22} className="text-white/40" />
        </button>

        <div className="flex flex-col items-center gap-4">
           <div className="w-20 h-20 rounded-[32px] theme-gradient-bg flex items-center justify-center shadow-[0_0_40px_var(--theme-primary-glow)]">
              <Rocket size={40} className="text-white animate-bounce" />
           </div>
           <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Forge_Entry</h2>
           <p className="text-[11px] text-white/30 font-black uppercase tracking-[0.4em] italic font-mono px-4">Initialize protocol for new directive</p>
        </div>

        <div className="grid gap-6 w-full">
          <button 
            onClick={onAI}
            className="group relative w-full py-6 rounded-[32px] theme-gradient-bg text-white shadow-2xl hover:scale-[1.05] active:scale-[0.95] transition-all overflow-hidden"
          >
            <div className="relative flex items-center justify-center gap-4">
              <Sparkles className="w-7 h-7 animate-pulse" />
              <span className="font-black text-xl italic uppercase tracking-widest">Neural AI</span>
            </div>
          </button>

          <button 
            onClick={onManual}
            className="group w-full py-6 rounded-[32px] bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:border-white/30 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-4"
          >
            <Cpu className="w-7 h-7 text-white/40 group-hover:theme-text transition-colors" />
            <span className="font-black text-xl italic uppercase tracking-widest">Forge Manual</span>
          </button>
        </div>
      </div>
    </div>
  );
};