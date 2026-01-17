import React from 'react';
import { Check, Clock, Pause, ChevronRight, Activity, Zap, Cloud, Calendar } from 'lucide-react';
import { Task } from '../types';
import { useApp } from '../context/AppContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  startTime?: string;
  endTime?: string;
}

const COMPLEXITIES = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, startTime, endTime }) => {
  const { updateTask, toggleTaskTimer } = useApp();

  const toggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'Done' ? 'Not started' : task.status === 'In progress' ? 'Done' : 'In progress';
    updateTask(task.id, { status: newStatus });
  };

  const handleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskTimer(task.id);
  };

  const getPriorityStyles = (p: string) => {
    switch(p) {
      case 'High': return 'text-rose-400 border-rose-400/20 bg-rose-400/5';
      case 'Medium': return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
      default: return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
    }
  };

  const hash = task.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const complexity = COMPLEXITIES[hash % COMPLEXITIES.length];

  const isSynced = task.syncMetadata?.lastSyncedAt;

  return (
    <div 
      onClick={() => onEdit(task)}
      className={`apple-glass p-4 sm:p-6 group relative active:scale-[0.99] cursor-pointer border-white/5 shadow-lg transition-all hover:bg-white/[0.05] ${
        task.status === 'Done' ? 'opacity-30 grayscale-[0.8]' : ''
      }`}
    >
      {task.status === 'In progress' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 theme-gradient-bg shadow-[2px_0_15px_var(--theme-primary)]" />
      )}

      <div className="flex items-center gap-3 sm:gap-6 relative z-10">
        <button
          onClick={toggleStatus}
          className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-[18px] border flex items-center justify-center transition-all duration-500 flex-shrink-0 relative ${
            task.status === 'Done' ? 'theme-gradient-bg border-transparent' : 
            task.status === 'In progress' ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-[0_0_15px_var(--theme-primary-glow)]' : 'border-white/10 bg-white/5'
          }`}
        >
          {task.status === 'Done' && <Check size={20} className="text-white stroke-[3px] sm:w-[22px] sm:h-[22px]" />}
          {task.status === 'In progress' && <Activity size={20} className="text-white animate-pulse sm:w-[22px] sm:h-[22px]" />}
          {task.status === 'Not started' && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-2">
            <span className="text-[8px] sm:text-[9px] font-black text-white/30 font-mono tracking-widest uppercase truncate">{task.code}</span>
            <div className={`px-1.5 sm:px-2 py-0.5 rounded-lg border text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${getPriorityStyles(task.priority)}`}>
               {task.priority}
            </div>
            
            {startTime && endTime && task.status !== 'Done' && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[7px] sm:text-[8px] font-black text-white/40 font-mono tracking-tight uppercase">
                <Calendar size={8} className="theme-text sm:w-[10px] sm:h-[10px]" />
                <span className="hidden xs:inline">[{startTime} > {endTime}]</span>
                <span className="xs:hidden">{startTime}</span>
              </div>
            )}

            {isSynced && (
              <div className="flex items-center gap-1 ml-1 opacity-40">
                <Cloud size={9} className="theme-text sm:w-[10px] sm:h-[10px]" />
                <span className="text-[6px] sm:text-[7px] font-black text-white/60 uppercase font-mono italic">SYNC</span>
              </div>
            )}
            {task.timerRunning && (
              <div className="flex items-center gap-1 ml-auto">
                 <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                 <span className="text-[7px] sm:text-[8px] font-black text-rose-500 uppercase tracking-[0.1em] sm:tracking-[0.2em] font-mono whitespace-nowrap">LIVE</span>
              </div>
            )}
          </div>

          <h3 className={`font-black text-base sm:text-xl leading-tight transition-all mb-1.5 sm:mb-2.5 italic truncate tracking-tight ${
            task.status === 'Done' ? 'line-through text-white/20' : 'text-white'
          }`}>
            {task.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/20 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] font-mono">
            <span className="flex items-center gap-1 sm:gap-1.5"><Zap size={10} className="theme-text sm:w-[11px] sm:h-[11px]" /> {task.type}</span>
            <span className="flex items-center gap-1 sm:gap-1.5"><Clock size={10} className="sm:w-[11px] sm:h-[11px]" /> {Math.floor(task.actualMinutes)}M / {task.estimateMinutes}M</span>
            <span className="hidden sm:inline opacity-30">| {complexity}</span>
          </div>
        </div>

        <button 
          onClick={handleTimer}
          className={`w-9 h-9 sm:w-13 sm:h-13 rounded-xl sm:rounded-[18px] flex items-center justify-center transition-all border shrink-0 ${
            task.timerRunning 
              ? 'bg-[var(--theme-primary)] text-white border-transparent shadow-[0_0_20px_var(--theme-primary-glow)]' 
              : 'bg-white/5 text-white/10 hover:text-white/40 border-white/5 hover:border-white/10'
          }`}
        >
          {task.timerRunning ? <Pause size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" /> : <ChevronRight size={18} className="group-hover:translate-x-1 transition-all sm:w-[20px] sm:h-[20px]" />}
        </button>
      </div>
    </div>
  );
};