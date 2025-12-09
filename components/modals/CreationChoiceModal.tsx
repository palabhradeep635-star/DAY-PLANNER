import React from 'react';
import { X, Sparkles, Plus, Keyboard } from 'lucide-react';

interface CreationChoiceModalProps {
  onClose: () => void;
  onManual: () => void;
  onAI: () => void;
}

export const CreationChoiceModal: React.FC<CreationChoiceModalProps> = ({ onClose, onManual, onAI }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity" />
      <div 
        className="glass-card w-full max-w-sm modal-slide-up relative z-10 !p-8 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(50px)' }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-gray-500 dark:text-gray-400" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Task</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">How would you like to add a new task?</p>

        <div className="grid gap-4 w-full">
          <button 
            onClick={onAI}
            className="group relative w-full p-4 rounded-2xl theme-gradient-bg text-white shadow-lg hover:scale-[1.02] transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <div className="relative flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-bold">Generate with AI</span>
            </div>
          </button>

          <button 
            onClick={onManual}
            className="group w-full p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <Keyboard className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[var(--theme-primary)] transition-colors" />
            <span className="font-semibold">Manual Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
