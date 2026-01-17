
import React, { useState } from 'react';
import { X, Check, Star, Zap, Crown, Shield, Infinity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Defined props interface to align with other project modals
interface PremiumModalProps {
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose }) => {
  // Replaced non-existent closePremiumModal with onClose prop
  const { upgradeToPro, user } = useApp();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    await upgradeToPro();
    setLoading(false);
    onClose();
  };

  const features = [
    { icon: Infinity, label: "Unlimited AI Generations", desc: "No daily limits on study plans" },
    { icon: Zap, label: "Advanced Models", desc: "Access GPT-4 & Gemini Pro" },
    { icon: Star, label: "Premium Themes", desc: "Unlock RGB, Midnight & Sunset" },
    { icon: Shield, label: "Cloud Backup", desc: "Priority sync & conflict resolution" }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Replaced closePremiumModal calls with onClose prop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-enter" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-[#222] rounded-[36px] overflow-hidden shadow-2xl modal-slide-up flex flex-col">
        {/* Header with Premium Gradient */}
        <div className="relative h-48 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 opacity-90" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
           
           <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors backdrop-blur-md z-20">
             <X size={16} />
           </button>

           <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] to-transparent">
              <div className="flex items-center gap-2 mb-1">
                 <div className="px-2 py-0.5 rounded-full bg-black/30 border border-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
                    <Crown size={10} className="text-amber-300" />
                    Pro
                 </div>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Unlock Mastery</h2>
           </div>
        </div>

        <div className="p-6 pt-2 flex-1">
           <p className="text-gray-400 text-sm mb-6">
             Supercharge your interview prep with AI-powered tools and premium customization.
           </p>

           <div className="space-y-4 mb-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 text-amber-500">
                      <f.icon size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-white text-sm">{f.label}</h4>
                      <p className="text-xs text-gray-500">{f.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6 text-center relative overflow-hidden group cursor-pointer border-amber-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                 <div className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Best Value</div>
                 <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-white">$4.99</span>
                    <span className="text-gray-500">/ month</span>
                 </div>
                 <p className="text-[10px] text-gray-400 mt-2">7-day free trial, cancel anytime.</p>
              </div>
           </div>

           <button 
             onClick={handleSubscribe}
             disabled={loading}
             className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-lg shadow-[0_0_25px_-5px_rgba(251,191,36,0.5)] hover:shadow-[0_0_35px_-5px_rgba(251,191,36,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden"
           >
              {loading ? (
                 <span className="animate-pulse">Processing...</span>
              ) : (
                 <>
                   <span>Start Free Trial</span>
                   <Zap size={18} fill="currentColor" />
                 </>
              )}
           </button>
        </div>
      </div>
    </div>
  );
};
