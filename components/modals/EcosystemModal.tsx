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
    // Sequence the animations
    const t1 = setTimeout(() => setStep(1), 500); // Connect Google
    const t2 = setTimeout(() => setStep(2), 1500); // Sync Calendar
    const t3 = setTimeout(() => setStep(3), 2500); // Sync AI
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const SyncItem = ({ icon: Icon, label, active, delay }: any) => (
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-enter" onClick={onClose} />
      
      <GlassCard className="w-full max-w-md relative z-10 !p-0 overflow-hidden !rounded-[40px] border border-white/20 shadow-2xl">
        {/* Header Image / Gradient */}
        <div className="relative h-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600" />
          <div className="absolute inset-0 bg-[url('https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_light_clr_74x24px.svg')] bg-no-repeat bg-center opacity-10 scale-150" />
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-8 -mt-12 relative z-20">
           <div className="w-24 h-24 rounded-3xl bg-white dark:bg-[#1c1c1e] p-1 shadow-2xl mx-auto flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-20 blur-xl rounded-full" />
              <img src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Google" className="w-12 h-12 relative z-10" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#1c1c1e] flex items-center justify-center text-white">
                 <Check size={14} strokeWidth={4} />
              </div>
           </div>
           
           <div className="text-center mt-4 mb-8">
             <h2 className="text-2xl font-bold text-white mb-2">Google Ecosystem</h2>
             <p className="text-gray-400 text-sm leading-relaxed">
               Syncing your study plan across your entire productivity suite. One account, everywhere.
             </p>
           </div>

           <div className="space-y-3 mb-8">
              <SyncItem 
                icon={Calendar} 
                label="Google Calendar Events" 
                active={step >= 1} 
              />
              <SyncItem 
                icon={Database} 
                label="Notion Workspace Export" 
                active={step >= 2} 
              />
              <SyncItem 
                icon={Sparkles} 
                label="Gemini & ChatGPT Context" 
                active={step >= 3} 
              />
           </div>

           <button 
             onClick={onConfirm}
             className="w-full py-4 mb-6 rounded-2xl bg-white text-black font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
           >
             <span>Confirm & Sync</span>
             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
           </button>
           
           <div className="text-center pb-6">
             <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
               <Globe size={10} /> Secure Connection
             </p>
           </div>
        </div>
      </GlassCard>
    </div>
  );
};