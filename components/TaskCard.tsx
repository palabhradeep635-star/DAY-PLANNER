
import React from 'react';
import { Check, Clock, Pause, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '../types';
import { useApp } from '../context/AppContext';
import { GlassCard } from './ui/GlassCard';
import { createGoogleCalendarUrl } from '../utils/calendar';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
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

  const handleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(createGoogleCalendarUrl(task), '_blank');
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'text-red-500 bg-red-500';
      case 'Medium': return 'text-orange-400 bg-orange-400';
      case 'Low': return 'text-green-500 bg-green-500';
      default: return 'text-gray-400 bg-gray-400';
    }
  };

  return (
    <GlassCard 
      onClick={() => onEdit(task)}
      className={`mb-4 relative overflow-hidden group w-full ${
        task.status === 'Done' ? 'opacity-60' : ''
      }`}
    >
      {/* Active Indicator Strip - Only visible when In Progress */}
      {task.status === 'In progress' && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 theme-gradient-bg z-20" />
      )}

      {/* Increased padding from p-1 to p-4 for proper fitting */}
      <div className="flex items-start justify-between relative z-10 p-4">
        <div className={`flex-1 min-w-0 pr-4 ${task.status === 'In progress' ? 'pl-2' : 'pl-0'}`}>
          {/* Header Row: Code & Type */}
          <div className="flex items-center gap-2 mb-2 text-[11px] font-bold tracking-wider uppercase opacity-80" style={{ color: 'var(--text-secondary)' }}>
            <span className="theme-text whitespace-nowrap">{task.code}</span>
            <span>•</span>
            <span className="truncate">{task.type}</span>
          </div>

          {/* Title - Enforce wrapping */}
          <h3 className={`font-semibold text-base leading-snug mb-2 transition-all duration-300 break-words hyphens-auto ${
            task.status === 'Done' ? 'line-through opacity-70' : ''
          }`} style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </h3>
          
          {/* Details - Clamp text */}
          <p className="text-sm leading-relaxed mb-4 line-clamp-2 break-words" style={{ color: 'var(--text-secondary)' }}>
            {task.details}
          </p>
          
          {/* Footer Metadata Row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            
            {/* Priority */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).split(' ')[1]}`} />
              <span className={getPriorityColor(task.priority).split(' ')[0]}>{task.priority}</span>
            </div>

            {/* Timer / Estimate */}
            <button 
              onClick={handleTimer}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all flex-shrink-0 ${
                task.timerRunning 
                  ? 'bg-white/10 border theme-text' 
                  : 'hover:bg-white/5'
              }`}
              style={{ borderColor: task.timerRunning ? 'var(--theme-primary)' : 'transparent' }}
            >
              {task.timerRunning ? (
                <Pause size={12} className="animate-pulse theme-text" />
              ) : (
                <Clock size={12} />
              )}
              <span>
                {Math.floor(task.actualMinutes)}/{task.estimateMinutes}m
              </span>
            </button>

            {/* Calendar */}
            <button 
              onClick={handleCalendar}
              className="p-1.5 rounded-md hover:bg-white/5 hover:text-white transition-colors ml-auto"
            >
              <CalendarIcon size={14} />
            </button>
          </div>
        </div>
        
        {/* Checkbox - Fixed width to prevent squishing */}
        <button
          onClick={toggleStatus}
          className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-1 ml-1 ${
            task.status === 'Done' ? 'scale-105 border-transparent' : 
            task.status === 'In progress' ? 'border-[var(--theme-primary)]' : 'border-gray-500 hover:border-gray-300'
          }`}
          style={{ background: task.status === 'Done' ? 'var(--theme-primary)' : 'transparent' }}
        >
          {task.status === 'Done' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
        </button>
      </div>
    </GlassCard>
  );
};
