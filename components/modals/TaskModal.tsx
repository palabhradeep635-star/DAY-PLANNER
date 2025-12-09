import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Calendar, Clock, AlignLeft, ExternalLink, Cloud } from 'lucide-react';
import { Task, PHASES, TASK_TYPES, PRIORITIES, STATUSES, Phase } from '../../types';
import { useApp } from '../../context/AppContext';
import { createGoogleCalendarUrl } from '../../utils/calendar';

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
}

const DEFAULT_TASK: Partial<Task> = {
  phase: 'P1',
  day: 'D1',
  title: '',
  details: '',
  type: 'Lecture',
  priority: 'Medium',
  status: 'Not started',
  estimateMinutes: 60,
  actualMinutes: 0,
  isToday: false
};

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const { addTask, updateTask, deleteTask, user } = useApp();
  const [formData, setFormData] = useState<Partial<Task>>(task || DEFAULT_TASK);

  // Sync state when prop changes - Critical for re-opening modal with different tasks
  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData(DEFAULT_TASK);
    }
  }, [task]);

  const handleSubmit = () => {
    if (!formData.title) return;
    const taskData = { ...formData, code: `${formData.phase}${formData.day}` } as Task;
    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask({ ...taskData, id: Date.now().toString(), actualMinutes: 0, lastEdited: Date.now() });
    }
    onClose();
  };

  const handleAddToCalendar = () => {
    if (!formData.title) return;
    const tempTask = { ...formData, code: `${formData.phase}${formData.day}` } as Task;
    const url = createGoogleCalendarUrl(tempTask);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" />
      <div 
        className="glass-card w-full max-w-lg modal-slide-up relative z-10 !p-0 overflow-hidden !rounded-[32px] shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(40px)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/50 dark:bg-black/20">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Title Input */}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block ml-1">Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="input-field text-lg font-semibold !bg-white/50 dark:!bg-black/20 focus:!bg-white dark:focus:!bg-black/40" 
              placeholder="e.g. Dynamic Programming Intro" 
              autoFocus
            />
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 block ml-1">Phase</label>
             <div className="grid grid-cols-2 gap-2">
                {Object.keys(PHASES).map((pKey) => {
                   const isSelected = formData.phase === pKey;
                   return (
                     <button
                       key={pKey}
                       onClick={() => setFormData({...formData, phase: pKey as Phase})}
                       className={`
                         relative p-3 rounded-xl border transition-all duration-300 text-left overflow-hidden group
                         ${isSelected 
                           ? 'theme-gradient-bg border-transparent text-white shadow-lg' 
                           : 'bg-white/5 dark:bg-white/5 border-white/10 text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:border-white/20'
                         }
                       `}
                     >
                        {/* Dynamic Background Animation for Selected */}
                        {isSelected && (
                           <div className="absolute inset-0 bg-white/20 animate-pulse-slow mix-blend-overlay" />
                        )}

                        <div className="relative z-10">
                           <div className={`text-xs font-bold mb-0.5 ${isSelected ? 'text-white/80' : 'theme-text'}`}>
                             {pKey}
                           </div>
                           <div className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                             {PHASES[pKey as Phase]}
                           </div>
                        </div>
                     </button>
                   )
                })}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Day Code */}
             <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block ml-1">Day Code</label>
              <input 
                type="text" 
                value={formData.day} 
                onChange={(e) => setFormData({...formData, day: e.target.value})} 
                className="input-field !bg-white/50 dark:!bg-black/20" 
                placeholder="D1" 
              />
            </div>

            {/* Time (Min) */}
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block ml-1">Time (Min)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.estimateMinutes} 
                  onChange={(e) => setFormData({...formData, estimateMinutes: parseInt(e.target.value) || 0})} 
                  className="input-field pl-10 !bg-white/50 dark:!bg-black/20" 
                />
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block ml-1">Details</label>
            <textarea 
              value={formData.details} 
              onChange={(e) => setFormData({...formData, details: e.target.value})} 
              className="input-field min-h-[100px] !bg-white/50 dark:!bg-black/20 resize-none" 
              placeholder="Add details, notes or links..." 
            />
          </div>

          <div className="flex items-end pb-1">
             <label className="flex items-center gap-3 cursor-pointer w-full p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-transparent hover:border-white/10 transition-colors">
               <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.isToday ? 'theme-bg border-transparent' : 'border-gray-400'}`}>
                  {formData.isToday && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
               </div>
               <input type="checkbox" checked={formData.isToday} onChange={(e) => setFormData({...formData, isToday: e.target.checked})} className="hidden" />
               <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Do Today</span>
             </label>
          </div>

          {/* ADD TO CALENDAR BUTTON */}
          <button 
             onClick={handleAddToCalendar}
             className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors border ${
               user 
                ? 'bg-blue-500 text-white border-blue-600 shadow-md hover:shadow-lg' 
                : 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
             }`}
          >
             {user ? <Cloud size={16} /> : <Calendar className="w-4 h-4" />}
             {user ? 'Sync to Google Calendar' : 'Add to Google Calendar'}
             {!user && <ExternalLink className="w-3 h-3 opacity-50" />}
          </button>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            {task && (
              <button 
                onClick={() => { if(confirm('Delete task?')) { deleteTask(task.id); onClose(); } }} 
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={handleSubmit} 
              className="flex-1 py-3 theme-gradient-bg text-white font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_-5px_var(--theme-primary)] hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden"
            >
               <span className="relative z-10">{task ? 'Save Changes' : 'Create Task'}</span>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shine pointer-events-none" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};