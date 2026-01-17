import React, { useEffect, useState } from 'react';
import { X, Check, Loader2, Calendar, Database, Bot, Sparkles, ArrowRight, Globe, Share2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface EcosystemModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export const EcosystemModal: React.FC<EcosystemModalProps> = ({ onConfirm, onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence the animations to simulate a real handshake
    const t1 = setTimeout(() => setStep(1), 800);  // Google Auth
    const t2 = setTimeout(() => setStep(2), 1600); // Notion Link
    const t3 = setTimeout(() => setStep(3), 2400); // Microsoft Task Hook
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const SyncItem = ({ icon: Icon, label, active }: any) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${active ? 'bg-white/10 border border-white/10 translate-x-0 opacity-100' : 'translate-x-4 opacity-50'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${active ? 'bg-green-500 text-white shadow-[0_0_15px_-3px_rgba(34,197,94,0.6)]' : 'bg-white/5 text-gray-500'}`}>
        {active ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
      </div>
      <div className="flex-1">
        <h4 className={`font-bold text-sm ${active ? 'text-white' : 'text-gray-400'}`}>{label}</h4>
        <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
          <div 
            className={`h-full bg-green-500 transition-all duration-[1000ms] ease-out ${active ? 'w-full' : 'w-0'}`} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-enter" onClick={onClose} />
      
      <div className="w-full max-w-md relative z-10 apple-glass !p-0 overflow-hidden !rounded-[40px] border border-white/20 shadow-4xl animate-enter">
        <div className="relative h-32 overflow-hidden">
          <div className="absolute inset-0 theme-gradient-bg opacity-80" />
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors backdrop-blur-md">
            <X size={16} />
          </button>
        </div>

        <div className="px-8 -mt-12 relative z-20">
           <div className="w-24 h-24 rounded-3xl bg-black border border-white/10 p-1 shadow-2xl mx-auto flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-20 blur-xl rounded-full" />
              <div className="w-14 h-14 rounded-2xl theme-gradient-bg flex items-center justify-center">
                <Share2 size={28} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center text-white">
                 <Check size={14} strokeWidth={4} />
              </div>
           </div>
           
           <div className="text-center mt-6 mb-8">
             <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">Neural Ecosystem</h2>
             <p className="text-white/40 text-sm leading-relaxed italic">
               Synchronizing directives across Google, Notion, and Microsoft Task clusters.
             </p>
           </div>

           <div className="space-y-3 mb-10">
              <SyncItem 
                icon={Calendar} 
                label="Google Calendar Schedule" 
                active={step >= 1} 
              />
              <SyncItem 
                icon={Database} 
                label="Notion Workspace Export" 
                active={step >= 2} 
              />
              <SyncItem 
                icon={Bot} 
                label="Microsoft To Do Integration" 
                active={step >= 3} 
              />
           </div>

           <button 
             onClick={onConfirm}
             className="w-full py-5 mb-8 rounded-2xl theme-gradient-bg text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group uppercase italic tracking-widest border border-white/10"
           >
             <span>Initialize Sync</span>
             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
           </button>
           
           <div className="text-center pb-8 opacity-20">
             <p className="text-[10px] text-white uppercase tracking-[0.4em] font-mono italic flex items-center justify-center gap-2">
               <Globe size={10} /> Nexus_Protocol_Active
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};