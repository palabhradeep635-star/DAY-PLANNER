import React, { useState, useEffect } from 'react';
import { X, Trash2, Sparkles, Loader2, Tag, Calendar } from 'lucide-react';
import { Task, TASK_TYPES, STATUSES } from '../../types';
import { useApp } from '../../context/AppContext';
import { optimizeTaskContent } from '../../services/aiService';

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
}

const DEFAULT_TASK: Partial<Task> = {
  topic: 'General Directive',
  day: 'D1',
  title: '',
  details: '',
  type: 'Practice',
  priority: 'Medium',
  status: 'Not started',
  estimateMinutes: 60,
  actualMinutes: 0,
  isToday: true
};

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const { addTask, updateTask, deleteTask } = useApp();
  const [formData, setFormData] = useState<Partial<Task>>(task || DEFAULT_TASK);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData(DEFAULT_TASK);
    }
  }, [task]);

  const handleSubmit = () => {
    if (!formData.title) return;
    const taskData = { ...formData, code: formData.day || 'D1' } as Task;
    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask({ ...taskData, id: Date.now().toString(), actualMinutes: 0, lastEdited: Date.now() });
    }
    onClose();
  };

  const handleOptimize = async () => {
    if (!formData.title) return;
    setOptimizing(true);
    try {
      const optimized = await optimizeTaskContent(formData);
      setFormData(prev => ({ ...prev, ...optimized }));
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
      <div 
        className="apple-glass w-full max-w-lg relative z-10 p-0 overflow-hidden !rounded-[40px] shadow-4xl flex flex-col max-h-[85vh] border border-white/20" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
            {task ? 'Update Directive' : 'Forge Directive'}
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleOptimize}
              disabled={optimizing || !formData.title}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-[var(--theme-primary)]/20"
            >
              {optimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Neural Enhance
            </button>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1 no-scrollbar">
          <div>
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 block ml-1 font-mono italic">Directive_Identification</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base font-bold italic focus:border-white/30 transition-all outline-none placeholder:text-white/10" 
              placeholder="e.g. Optimize Dijkstra's Priority Queue" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 block ml-1 font-mono italic">Sector_Topic</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"><Tag size={14} /></div>
                   <input 
                    type="text" 
                    value={formData.topic} 
                    onChange={(e) => setFormData({...formData, topic: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-white text-xs font-bold italic outline-none focus:border-white/30 transition-all" 
                    placeholder="Sector..." 
                   />
                </div>
             </div>
             <div>
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 block ml-1 font-mono italic">Cycle_Index</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"><Calendar size={14} /></div>
                   <input 
                    type="text" 
                    value={formData.day} 
                    onChange={(e) => setFormData({...formData, day: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-white text-xs font-bold italic outline-none focus:border-white/30 transition-all" 
                    placeholder="e.g. D2" 
                   />
                </div>
             </div>
          </div>

          <div 
            onClick={() => setFormData(prev => ({ ...prev, isToday: !prev.isToday }))}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${
              formData.isToday ? 'border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/5' : 'border-white/5 bg-white/5'
            }`}
          >
             <div className="flex items-center gap-3">
                <Calendar size={16} className={formData.isToday ? 'theme-text' : 'text-white/20'} />
                <span className={`text-[11px] font-black uppercase tracking-widest ${formData.isToday ? 'text-white' : 'text-white/30'}`}>Schedule for Today</span>
             </div>
             <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ease-in-out ${formData.isToday ? 'theme-gradient-bg shadow-[0_0_15px_var(--theme-primary-glow)]' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${formData.isToday ? 'translate-x-7 scale-110' : 'translate-x-1 scale-100'}`} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 block ml-1 font-mono italic">Status_State</label>
                <select 
                   value={formData.status} 
                   onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-xs font-bold italic outline-none appearance-none"
                >
                   {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div>
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 block ml-1 font-mono italic">Directive_Module</label>
                <select 
                   value={formData.type} 
                   onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-xs font-bold italic outline-none appearance-none"
                >
                   {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 block ml-1 font-mono italic">Logic_Log_Details</label>
            <textarea 
              value={formData.details} 
              onChange={(e) => setFormData({...formData, details: e.target.value})} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-medium italic min-h-[120px] outline-none focus:border-white/30 placeholder:text-white/10" 
              placeholder="Patterns, complexities, or logic branches..." 
            />
          </div>
        </div>

        <div className="p-8 border-t border-white/5 flex gap-4">
          {task && (
            <button 
              onClick={() => { if(confirm('Erase directive from archives?')) { deleteTask(task.id); onClose(); } }} 
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={handleSubmit} 
            className="flex-1 py-5 theme-gradient-bg text-white font-black text-sm rounded-2xl italic uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10"
          >
             {task ? 'Commit Synchronize' : 'Forge Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};