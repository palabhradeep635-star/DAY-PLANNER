import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Sparkles, Loader2, Tag, Calendar, ChevronDown, Check, Play, Circle, BookOpen, PenTool, RefreshCw, FileText, LayoutGrid, Zap, CheckCircle2 } from 'lucide-react';
import { Task, TASK_TYPES, STATUSES, Status, TaskType } from '../../types';
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

const OPTION_ICONS: Record<string, any> = {
  'Not started': Circle,
  'In progress': Play,
  'Done': Check,
  'Lecture': BookOpen,
  'Practice': PenTool,
  'Revision': RefreshCw,
  'Notes': FileText,
  'Misc': LayoutGrid
};

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const { addTask, updateTask, deleteTask } = useApp();
  const [formData, setFormData] = useState<Partial<Task>>(task || DEFAULT_TASK);
  const [optimizing, setOptimizing] = useState(false);
  
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [showTypeSelect, setShowTypeSelect] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData(DEFAULT_TASK);
    }
  }, [task]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setShowStatusSelect(false);
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) setShowTypeSelect(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.title) return;
    const taskData = { ...formData, code: formData.day || 'D1' } as Task;
    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask({ ...taskData, id: Date.now().toString(), actualMinutes: 0, lastEdited: Date.now() });
    }
    onClose();
  };

  const handleOptimize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const CustomSelect = ({ label, value, options, onSelect, isOpen, setIsOpen, containerRef }: any) => (
    <div className="w-full" ref={containerRef}>
      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2.5 block ml-1 font-mono italic">
        {label}
      </label>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-white text-[13px] font-bold italic flex items-center justify-between transition-all duration-300 hover:border-white/20 hover:bg-white/[0.1] ${isOpen ? 'ring-1 ring-[var(--theme-primary)] border-[var(--theme-primary)]/50 bg-white/[0.12]' : ''}`}
      >
        <div className="flex items-center gap-3">
          {OPTION_ICONS[value] && React.createElement(OPTION_ICONS[value], { size: 14, className: "theme-text" })}
          <span className="truncate">{value}</span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-500 text-white/20 ${isOpen ? 'rotate-180 text-white' : ''}`} />
      </button>

      <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isOpen ? 'max-h-[300px] mt-2 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}>
        <div className="p-1.5 bg-[#0A0A0A] border border-white/10 rounded-[24px] shadow-2xl">
          <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
            {options.map((option: string) => {
              const Icon = OPTION_ICONS[option];
              const isActive = value === option;
              return (
                <button
                  key={option}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 relative group ${
                    isActive 
                    ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary-glow)]' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon size={13} className={isActive ? 'text-white' : 'text-white/20 group-hover:text-white transition-colors'} />}
                    <span>{option}</span>
                  </div>
                  {isActive && <Check size={14} strokeWidth={3} className="text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-swift-enter" onClick={onClose}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
      <div 
        className="apple-glass w-full max-w-lg relative z-10 p-0 !rounded-[40px] shadow-4xl flex flex-col max-h-[90vh] border border-white/10 animate-swift-zoom overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-white/5 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
              {task ? 'Update Directive' : 'Forge Entry'}
            </h2>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] font-mono italic">Sector Management Module</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleOptimize}
              disabled={optimizing || !formData.title}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 text-white/60 border border-white/10 text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]/20 active:scale-95"
            >
              {optimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="theme-text" />}
              Optimize
            </button>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors">
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8 overflow-y-auto flex-1 no-scrollbar">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] block ml-1 font-mono italic">Primary_Identification</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full bg-white/[0.05] border border-white/10 rounded-[28px] px-6 py-5 text-white text-lg font-bold italic focus:border-white/30 focus:bg-white/[0.08] transition-all outline-none placeholder:text-white/10 shadow-inner" 
              placeholder="e.g. Memory Map Real-time Sync" 
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] block ml-1 font-mono italic">Sector_Link</label>
                <div className="relative group">
                   <Tag size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--theme-primary)] transition-colors" />
                   <input 
                    type="text" 
                    value={formData.topic} 
                    onChange={(e) => setFormData({...formData, topic: e.target.value})} 
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold italic outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all" 
                    placeholder="Sector..." 
                   />
                </div>
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] block ml-1 font-mono italic">Cycle_Index</label>
                <div className="relative group">
                   <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--theme-primary)] transition-colors" />
                   <input 
                    type="text" 
                    value={formData.day} 
                    onChange={(e) => setFormData({...formData, day: e.target.value})} 
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold italic outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all" 
                    placeholder="e.g. D1" 
                   />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-5 items-start">
             <CustomSelect 
                label="Execution_Status"
                value={formData.status}
                options={STATUSES}
                onSelect={(val: Status) => setFormData({...formData, status: val})}
                isOpen={showStatusSelect}
                setIsOpen={setShowStatusSelect}
                containerRef={statusRef}
             />
             <CustomSelect 
                label="Module_Branch"
                value={formData.type}
                options={TASK_TYPES}
                onSelect={(val: TaskType) => setFormData({...formData, type: val})}
                isOpen={showTypeSelect}
                setIsOpen={setShowTypeSelect}
                containerRef={typeRef}
             />
          </div>

          <div 
            onClick={() => setFormData(prev => ({ ...prev, isToday: !prev.isToday }))}
            className={`p-6 rounded-[32px] border transition-all duration-500 cursor-pointer flex items-center justify-between group ${
              formData.isToday ? 'border-[var(--theme-primary)]/40 bg-[var(--theme-primary)]/10 shadow-[0_0_30px_var(--theme-primary-glow)]' : 'border-white/5 bg-white/5 hover:bg-white/[0.08]'
            }`}
          >
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.isToday ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}>
                  <Calendar size={20} />
                </div>
                <div>
                  <span className={`text-[12px] font-black uppercase tracking-widest block ${formData.isToday ? 'text-white' : 'text-white/40'}`}>Today's Agenda</span>
                  <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest italic">{formData.isToday ? 'High Priority Sync' : 'Upcoming Queue'}</span>
                </div>
             </div>
             <div className={`w-14 h-7 rounded-full relative transition-all duration-500 ease-in-out ${formData.isToday ? 'bg-white/20' : 'bg-white/10'}`}>
                <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${formData.isToday ? 'translate-x-8 scale-110 shadow-[0_0_15px_white]' : 'translate-x-2 scale-100 opacity-30'}`} />
             </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] block ml-1 font-mono italic">Logic_Description</label>
            <textarea 
              value={formData.details} 
              onChange={(e) => setFormData({...formData, details: e.target.value})} 
              className="w-full bg-white/[0.05] border border-white/10 rounded-[28px] px-6 py-5 text-white text-sm font-medium italic min-h-[140px] outline-none focus:border-white/30 focus:bg-white/[0.08] placeholder:text-white/10 transition-all resize-none no-scrollbar shadow-inner" 
              placeholder="Inject patterns, complexities, or logic branches..." 
            />
          </div>
        </div>

        <div className="p-6 sm:p-10 border-t border-white/5 shrink-0 flex items-center gap-6 bg-black/40 backdrop-blur-xl">
          {task && (
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(confirm('Erase directive?')) { deleteTask(task.id); onClose(); } }} 
              className="flex items-center gap-2.5 text-red-500/40 hover:text-red-500 transition-all duration-300 group/del py-2 px-1"
            >
              <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Discard</span>
            </button>
          )}
          
          <button 
            onClick={handleSubmit} 
            className="flex-1 h-14 bg-white text-black font-black text-xs rounded-2xl italic uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group/save"
          >
             {task ? <RefreshCw size={14} className="group-hover/save:rotate-90 transition-transform duration-500" /> : <Zap size={14} fill="currentColor" />}
             <span>{task ? 'Sync' : 'Commit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};