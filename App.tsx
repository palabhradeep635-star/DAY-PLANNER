
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Target, BookOpen, TrendingUp, Plus, Settings as SettingsIcon, ChevronRight, User, LogIn, Sparkles, Cloud, RotateCw } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/modals/TaskModal';
import { AIModal } from './components/modals/AIModal';
import { CreationChoiceModal } from './components/modals/CreationChoiceModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { GlassCard } from './components/ui/GlassCard';
import { PHASES, Task } from './types';

const MainLayout = () => {
  const { tasks, loading, syncing, settings, user } = useApp();
  const [currentScreen, setCurrentScreen] = useState('today');
  
  // Modals state
  const [showCreationChoice, setShowCreationChoice] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  // Apply theme to body
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [settings.theme]);

  const getTodayTasks = () => tasks.filter(t => t.isToday);

  const getSubtitle = useMemo(() => {
    const today = getTodayTasks();
    const done = today.filter(t => t.status === 'Done').length;
    
    // Dynamic Motivational Quotes
    const quotes = [
        "Consistency is the key to mastery.",
        "Small progress is still progress.",
        "Focus on the process, not just the outcome.",
        "Your future self will thank you.",
        "One concept at a time.",
        "Deep work beats distracted hours."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    if (today.length === 0) return "Ready to plan your day?";
    
    const left = today.length - done;
    
    if (left === 0) return "All caught up! " + randomQuote;
    return `${left} task${left === 1 ? '' : 's'} left. ${randomQuote}`;
  }, [tasks]);

  if (loading) return (
     <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
           <p className="text-white/50 text-sm font-medium animate-pulse">Connecting to Cloud...</p>
        </div>
     </div>
  );

  const getUpcomingTasks = () => tasks.filter(t => !t.isToday && t.status !== 'Done').slice(0, 10);
  
  const getPhaseStats = (phase: string) => {
    const phaseTasks = tasks.filter(t => t.phase === phase);
    const completed = phaseTasks.filter(t => t.status === 'Done').length;
    const total = phaseTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center w-14 py-1 gap-1 transition-all duration-500 ease-expo group active:scale-95`}
    >
      <Icon 
        className={`w-6 h-6 transition-colors ${active ? 'fill-current opacity-20' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`} 
        style={{ color: active ? 'var(--theme-primary)' : undefined }}
        strokeWidth={active ? 2.5 : 2} 
      />
      <span 
        className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${active ? '' : 'text-gray-400'}`}
        style={{ color: active ? 'var(--theme-primary)' : undefined }}
      >
        {label}
      </span>
    </button>
  );

  const renderContent = () => {
    if (currentScreen === 'analytics') return <div key="analytics" className="animate-enter"><AnalyticsScreen /></div>;

    if (currentScreen === 'today') {
      const todayTasks = getTodayTasks();
      const completed = todayTasks.filter(t => t.status === 'Done').length;
      const progress = todayTasks.length > 0 ? (completed / todayTasks.length) * 100 : 0;

      return (
        <div key="today" className="animate-enter pb-32">
          {/* HEADER SECTION */}
          <div className="mb-8 pt-6 relative">
               {/* Title Area */}
               <div className="flex flex-col gap-1 mb-2">
                 <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                   {getGreeting()}, <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-400 dark:from-white dark:to-gray-400">{user ? user.name.split(' ')[0] : 'Guest'}</span>
                 </h1>
               </div>
               
               {/* Subtitle with dynamic quote */}
               <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-enter opacity-90 leading-relaxed max-w-[85%]">
                 {getSubtitle}
               </p>

               {/* DEMO BADGE */}
               {!user && (
                  <div className="absolute top-0 right-0 mt-20 flex justify-end pointer-events-none">
                     <div className="px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-md flex items-center gap-2 shadow-sm pointer-events-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Demo Mode</span>
                     </div>
                  </div>
               )}
          </div>
          
          <GlassCard className="mb-8 !p-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-500">
               <TrendingUp className="w-24 h-24 text-white" />
            </div>
            <div className="flex justify-between items-end mb-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Daily Progress</span>
              <span className="text-4xl font-extrabold text-transparent bg-clip-text theme-gradient-bg leading-none drop-shadow-sm">{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full h-3 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden mb-6 relative z-10">
               <div className="h-full shadow-[0_0_20px_var(--theme-primary)] transition-all duration-1000 ease-out theme-gradient-bg relative" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]" />
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-white/5 pt-5 relative z-10">
               <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{todayTasks.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">Total</div>
               </div>
               <div className="text-center">
                <div className="text-xl font-bold theme-text">{completed}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">Done</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold text-purple-500">{todayTasks.length - completed}</div>
                 <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">Left</div>
               </div>
            </div>
          </GlassCard>

          <div className="space-y-4">
            {todayTasks.map(task => <TaskCard key={task.id} task={task} onEdit={setEditingTask} />)}
          </div>
          
          {todayTasks.length === 0 && (
            <div className="text-center py-16 opacity-70">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/5 dark:bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_-10px_var(--theme-primary)]">
                 <Target className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No tasks scheduled</p>
              <div className="flex gap-3 justify-center mt-8">
                <button onClick={() => setShowCreationChoice(true)} className="px-8 py-3 bg-white/50 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-bold rounded-full transition-all border border-white/20 hover:scale-105 active:scale-95">Add Task</button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (currentScreen === 'phases') {
      return (
        <div key="phases" className="animate-enter pb-32">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-8 pt-6">Curriculum</h1>
          <div className="space-y-5">
            {Object.keys(PHASES).map(phase => {
              const stats = getPhaseStats(phase);
              const phaseTasks = tasks.filter(t => t.phase === phase);
              const hasTasks = stats.total > 0;
              const isSelected = selectedPhase === phase;

              if (isSelected) {
                 return (
                   <div key={phase} className="mb-6 animate-enter">
                     <button onClick={() => setSelectedPhase(null)} className="mb-6 text-sm flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium transition-colors">
                       <ChevronRight className="rotate-180 w-4 h-4" /> Back to Overview
                     </button>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{PHASES[phase as keyof typeof PHASES]}</h2>
                        {tasks.filter(t => t.phase === phase).length === 0 && (
                             <button onClick={() => setShowAIModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold theme-text transition-colors border border-white/10">
                                <Sparkles size={12} />
                                Auto-Generate
                             </button>
                        )}
                     </div>
                     <div className="space-y-4">
                        {phaseTasks.map(t => <TaskCard key={t.id} task={t} onEdit={setEditingTask} />)}
                        {!hasTasks && (
                           <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-white/5">
                             <p className="text-gray-400 mb-6">No tasks in this phase yet.</p>
                             <button onClick={() => { setShowAIModal(true); }} className="px-6 py-3 rounded-xl theme-bg text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                Generate with AI
                             </button>
                           </div>
                        )}
                     </div>
                   </div>
                 );
              }

              return (
                <GlassCard 
                  key={phase} 
                  onClick={() => setSelectedPhase(phase)} 
                  className={`
                    cursor-pointer group !p-6 relative overflow-hidden transition-all duration-500
                    ${isSelected ? 'neon-border-glow' : 'hover:border-white/20'}
                  `}
                >
                   {/* Selection Glow (if active or hover) */}
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   <div className="flex items-center justify-between w-full relative z-10">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:theme-text transition-colors truncate pr-2">
                             {phase} - {PHASES[phase as keyof typeof PHASES]}
                           </h3>
                        </div>
                        
                        {hasTasks ? (
                          <>
                            <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                              <div className="h-full theme-gradient-bg shadow-sm" style={{ width: `${stats.percentage}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                              <span>{stats.completed} / {stats.total} completed</span>
                              <span className="theme-text font-bold">{stats.percentage}%</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium bg-gray-100 dark:bg-white/5 py-1.5 px-3 rounded-lg w-fit">
                             <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                             <span>Not started</span>
                          </div>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:theme-bg group-hover:text-white transition-all shadow-sm group-hover:shadow-[0_0_20px_-5px_var(--theme-primary)]">
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                   </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentScreen === 'upcoming') {
      return (
        <div key="upcoming" className="animate-enter pb-32">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-8 pt-6">Upcoming</h1>
          {getUpcomingTasks().length > 0 ? (
            <div className="space-y-4">
               {getUpcomingTasks().map(task => <TaskCard key={task.id} task={task} onEdit={setEditingTask} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
               <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p>No upcoming tasks.</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      {/* Premium Orbs Background */}
      <div className="orb-container">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      {/* TOP LEFT SYNC INDICATOR */}
      <div className="absolute top-6 left-5 z-30 pointer-events-none">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/5 transition-all duration-500 ${syncing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
           <RotateCw size={12} className="text-gray-400 animate-spin" />
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Syncing Cloud...</span>
        </div>
      </div>
      
      {/* GLOBAL SETTINGS & PROFILE - REFINED LAYOUT */}
      <div className="absolute top-6 right-5 z-30 flex items-center gap-3">
        {!user && (
           <button 
             onClick={() => setShowSettings(true)}
             className="flex items-center gap-1.5 pl-4 pr-1.5 py-1.5 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/20 text-xs font-bold text-gray-800 dark:text-white hover:bg-white/60 transition-all shadow-lg group"
           >
             <span className="translate-y-[0.5px]">Sign In</span>
             <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
             </div>
           </button>
        )}
        
        <button 
          onClick={() => setShowSettings(true)} 
          className={`w-10 h-10 rounded-full bg-white/50 dark:bg-black/30 hover:bg-white/60 dark:hover:bg-white/30 flex items-center justify-center transition-all active:scale-95 shadow-lg border border-white/20 backdrop-blur-md hover:rotate-90 text-gray-800 dark:text-white overflow-hidden p-0`}
        >
          {user ? (
            <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-gray-900 text-white">
               {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center theme-bg">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
               )}
            </div>
          ) : (
            <SettingsIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      
      <div className="relative z-10 h-full overflow-y-auto no-scrollbar">
        <div className="max-w-2xl mx-auto px-5 py-6">
          {renderContent()}
        </div>
      </div>

      {/* APPLE GLASS BOTTOM NAV */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
        <div 
          className="flex justify-between items-center px-2 py-3 w-full rounded-[32px] shadow-2xl backdrop-blur-2xl border border-white/20 dark:border-white/10 transition-all"
          style={{ background: 'var(--glass-bg)' }}
        >
            <NavButton icon={Calendar} label="Today" active={currentScreen === 'today'} onClick={() => { setCurrentScreen('today'); setSelectedPhase(null); }} />
            <NavButton icon={Target} label="Phases" active={currentScreen === 'phases'} onClick={() => { setCurrentScreen('phases'); setSelectedPhase(null); }} />
            
            {/* LABELED CREATE BUTTON - Fixed Label */}
            <button 
              onClick={() => setShowCreationChoice(true)} 
              className="flex flex-col items-center justify-center w-16 -mt-8 gap-1 group relative z-10"
            >
               <div 
                 className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300 ring-4 ring-white dark:ring-[#1c1c1e] theme-gradient-bg"
                 style={{ boxShadow: '0 10px 25px -5px var(--theme-primary)' }}
               >
                 <Plus className="w-7 h-7" strokeWidth={2.5} />
               </div>
               <span className="text-[10px] font-bold theme-text opacity-100 absolute -bottom-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm px-1.5 rounded-full shadow-sm border border-white/10">Create</span>
            </button>

            <NavButton icon={TrendingUp} label="Next" active={currentScreen === 'upcoming'} onClick={() => { setCurrentScreen('upcoming'); setSelectedPhase(null); }} />
            <NavButton icon={BookOpen} label="Stats" active={currentScreen === 'analytics'} onClick={() => { setCurrentScreen('analytics'); setSelectedPhase(null); }} />
        </div>
      </div>

      {/* MODALS */}
      {showCreationChoice && (
        <CreationChoiceModal 
          onClose={() => setShowCreationChoice(false)}
          onManual={() => { setShowCreationChoice(false); setShowAddModal(true); }}
          onAI={() => { setShowCreationChoice(false); setShowAIModal(true); }}
        />
      )}

      {(showAddModal || editingTask) && (
        <TaskModal 
          key={editingTask ? editingTask.id : 'new-task'}
          task={editingTask} 
          onClose={() => { setShowAddModal(false); setEditingTask(null); }} 
        />
      )}
      
      {showAIModal && <AIModal onClose={() => setShowAIModal(false)} />}
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
