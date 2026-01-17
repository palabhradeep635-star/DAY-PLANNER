import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Settings as SettingsIcon, TrendingUp, Plus, Sparkles, Layers, Zap, Flame, Activity, Cpu, BrainCircuit, Rocket, Clock as ClockIcon, Loader2, Brain, Edit3, Check, AlertTriangle, Hexagon, Target, ChevronRight, Timer, Calendar, CalendarDays, ArrowUpRight } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/modals/TaskModal';
import { AIModal } from './components/modals/AIModal';
import { CreationChoiceModal } from './components/modals/CreationChoiceModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { Task } from './types';
import { generateNeuralGreeting, partitionNeuralSectors } from './services/aiService';

const STATUS_STRINGS = [
  "Neural Link: Optimal", 
  "Engine: Apex v5.6", 
  "State: Synchronized", 
  "Focus Protocol: Active"
];

const STANDBY_SEQUENCE = [
  { p: "NEURAL_LINK", s: "AWAITING_SYNC", sub: "Establishing handshake...", icon: "activity" },
  { p: "APEX_CORE", s: "IGNITING_ENGINE", sub: "Calibrating neural sectors...", icon: "zap" },
  { p: "LOGIC_GRID", s: "RECONSTRUCTING", sub: "Mapping active directives...", icon: "brain" },
  { p: "SYSTEM_IDLE", s: "STANDBY_MODE", sub: "Nexus ready for injection.", icon: "activity" }
];

const FluidGreeting = ({ primary, secondary, subtitle, iconKey }: { primary: string, secondary: string, subtitle: string, iconKey: string }) => {
  const [display, setDisplay] = useState({ primary, secondary, subtitle, iconKey });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const IconMap: Record<string, any> = { zap: Zap, flame: Flame, rocket: Rocket, activity: Activity, brain: BrainCircuit, calendar: CalendarDays };

  useEffect(() => {
    if (primary !== display.primary || secondary !== display.secondary) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplay({ primary, secondary, subtitle, iconKey });
        setIsTransitioning(false);
      }, 700); 
      return () => clearTimeout(timer);
    }
  }, [primary, secondary, subtitle, iconKey]);

  const Icon = IconMap[display.iconKey] || BrainCircuit;

  return (
    <div className={`mb-6 sm:mb-10 pt-4 sm:pt-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isTransitioning ? 'opacity-0 -translate-y-12 blur-2xl scale-95' : 'opacity-100 translate-y-0 blur-0 scale-100'}`}>
      <h1 className="fluid-h1 opacity-20 text-white tracking-widest leading-none">{display.primary}</h1>
      <h2 className="fluid-h1 theme-text flex items-center gap-4 leading-none mt-1">{display.secondary}</h2>
      <div className="mt-4 sm:mt-6 flex items-center gap-4 opacity-60">
        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shadow-lg">
          <Icon size={14} className="theme-text animate-pulse" />
        </div>
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] font-mono italic truncate">{display.subtitle}</p>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { tasks, updateTask, bulkUpdateTasks, loading, settings, user } = useApp();
  const [currentScreen, setCurrentScreen] = useState('today');
  const [cycleIdx, setCycleIdx] = useState(0);
  const [standbyIdx, setStandbyIdx] = useState(0);
  const [showCreationChoice, setShowCreationChoice] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [partitioning, setPartitioning] = useState(false);
  const [renamingTopic, setRenamingTopic] = useState<string | null>(null);
  const [tempTopicName, setTempTopicName] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [neuralGreeting, setNeuralGreeting] = useState(STANDBY_SEQUENCE[0]);

  const todayTasks = useMemo(() => tasks.filter(t => t.isToday), [tasks]);
  const upcomingTasks = useMemo(() => tasks.filter(t => !t.isToday), [tasks]);
  
  const activeTasks = useMemo(() => todayTasks.filter(t => t.timerRunning || t.status === 'In progress'), [todayTasks]);
  const remainingTasksRaw = useMemo(() => todayTasks.filter(t => !t.timerRunning && t.status !== 'In progress' && t.status !== 'Done'), [todayTasks]);
  
  const scheduledQueue = useMemo(() => {
    let currentOffset = 0;
    const baseTime = new Date();
    
    return remainingTasksRaw.map(task => {
      const startTime = new Date(baseTime.getTime() + currentOffset * 60000);
      currentOffset += task.estimateMinutes;
      const endTime = new Date(baseTime.getTime() + currentOffset * 60000);
      
      return {
        ...task,
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      };
    });
  }, [remainingTasksRaw]);

  const tasksDoneCount = useMemo(() => todayTasks.filter(t => t.status === 'Done').length, [todayTasks]);
  const isAnyTimerRunning = useMemo(() => tasks.some(t => t.timerRunning), [tasks]);

  const groupedUpcomingTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    upcomingTasks.forEach(task => {
      const groupKey = task.day || "Cycle Unknown";
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
    });
    return groups;
  }, [upcomingTasks]);

  const groupedTasksByTopic = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const groupKey = task.topic || "Unassigned Sectors";
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
    });
    return groups;
  }, [tasks]);

  const fetchGreeting = async () => {
    if (!user?.name || loading) return;
    try {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const left = todayTasks.length - tasksDoneCount;
      const data = await generateNeuralGreeting(user.name, timeStr, left, todayTasks.length);
      setNeuralGreeting(data);
      setHasFetchedInitial(true);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    const int = setInterval(() => setCycleIdx(p => (p + 1) % STATUS_STRINGS.length), 6000);
    const greetingCycle = setInterval(fetchGreeting, 25000);
    
    const standbyInterval = setInterval(() => {
      if (!hasFetchedInitial) {
        setStandbyIdx(p => (p + 1) % STANDBY_SEQUENCE.length);
      }
    }, 4000);

    return () => { 
      clearInterval(t); 
      clearInterval(int); 
      clearInterval(greetingCycle);
      clearInterval(standbyInterval);
    };
  }, [user?.name, todayTasks.length, tasksDoneCount, loading, hasFetchedInitial]);

  useEffect(() => {
    if (!hasFetchedInitial) {
      setNeuralGreeting(STANDBY_SEQUENCE[standbyIdx]);
    }
  }, [standbyIdx, hasFetchedInitial]);

  useEffect(() => {
    if (loading || tasks.length === 0 || partitioning) return;
    const unassignedTasks = tasks.filter(t => !t.topic || t.topic === "Unassigned Sectors");
    if (unassignedTasks.length > 0) {
      const timer = setTimeout(() => {
        handleNeuralPartition(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [tasks, loading]);

  useEffect(() => {
    fetchGreeting();
  }, [loading, user?.name]);

  const handleNeuralPartition = async (isAuto = false) => {
    if (tasks.length === 0 || partitioning) return;
    if (isAuto) setIsAutoSyncing(true);
    setPartitioning(true);
    setErrorStatus(null);
    try {
      const mapping = await partitionNeuralSectors(tasks);
      const updates: Record<string, Partial<Task>> = {};
      Object.entries(mapping).forEach(([id, topic]) => {
        updates[id] = { topic: topic as string };
      });
      bulkUpdateTasks(updates);
    } catch (e: any) { 
      console.error(e);
      if (!isAuto) {
        setErrorStatus("Link severed. Verify key.");
        setTimeout(() => setErrorStatus(null), 5000);
      }
    } finally { 
      setPartitioning(false); 
      setIsAutoSyncing(false);
    }
  };

  const handleRenameSector = (oldTopic: string) => {
    if (!tempTopicName.trim() || tempTopicName === oldTopic) {
      setRenamingTopic(null);
      return;
    }
    const tasksInSector = tasks.filter(t => (t.topic || "Unassigned Sectors") === oldTopic);
    const updates: Record<string, Partial<Task>> = {};
    tasksInSector.forEach(t => {
      updates[t.id] = { topic: tempTopicName.trim() };
    });
    bulkUpdateTasks(updates);
    setRenamingTopic(null);
  };

  const handlePromoteTask = (taskId: string) => {
    updateTask(taskId, { isToday: true });
  };

  const completionPct = todayTasks.length === 0 ? 0 : Math.round((tasksDoneCount / todayTasks.length) * 100);

  const screenToGridIndex: Record<string, number> = {
    'today': 0,
    'registry': 1,
    'upcoming': 3,
    'analytics': 4
  };

  if (loading) return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-8 animate-pulse">
        <div className="w-20 h-20 rounded-[32px] theme-gradient-bg flex items-center justify-center shadow-2xl relative overflow-hidden">
           <Cpu size={40} className="text-white relative z-10" />
           <div className="absolute inset-0 bg-white/20 animate-ping" />
        </div>
        <div className="text-[11px] text-white/20 font-mono uppercase tracking-[0.6em] italic">Nexus_Syncing...</div>
      </div>
    </div>
  );

  if (!settings?.onboardingCompleted) return <OnboardingScreen />;

  const NavButton = ({ icon: Icon, label, active, onClick }: any) => {
    return (
      <button 
        onClick={onClick} 
        className="flex flex-col items-center justify-center relative z-20 group outline-none h-full w-full swift-transition"
      >
        <div className={`p-1.5 sm:p-2.5 rounded-2xl transition-all duration-700 relative ${
          active ? 'text-white scale-110 translate-y-[-2px]' : 'text-white/20 hover:text-white/40'
        }`}>
          <Icon size={20} className={`sm:w-[22px] sm:h-[22px] transition-all duration-700 ${active ? 'theme-text drop-shadow-[0_0_12px_var(--theme-primary-glow)]' : ''}`} strokeWidth={active ? 2.5 : 2} />
        </div>
        <div className={`text-[6px] sm:text-[7px] font-bold uppercase tracking-[0.3em] font-outfit transition-all duration-700 ${
          active ? 'opacity-100 max-h-4 translate-y-0 mt-1 text-white' : 'opacity-0 max-h-0 -translate-y-2'
        }`}>
          {label}
        </div>
      </button>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-black" style={{ paddingTop: 'var(--sat)' }}>
      <div className="mesh-container">
        <div className={`blob blob-1 transition-all duration-[3000ms] ${isAnyTimerRunning ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`} />
        <div className={`blob blob-2 transition-all duration-[3000ms] ${isAnyTimerRunning ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`} />
      </div>
      
      <div className="relative z-30 flex items-center justify-between px-4 sm:px-8 lg:px-14 pt-6 sm:pt-10 pb-4">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full theme-gradient-bg shadow-[0_0_20px_var(--theme-primary-glow)] animate-pulse" />
          <div className="text-[8px] sm:text-[10px] text-white/30 font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase font-mono italic truncate max-w-[120px] sm:max-w-none">
            {isAutoSyncing ? "Neural: Contextualizing..." : STATUS_STRINGS[cycleIdx]}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl apple-glass flex items-center gap-2 sm:gap-3 shadow-3xl">
             <ClockIcon size={12} className="text-white/30 theme-text sm:w-[14px] sm:h-[14px]" />
             <span className="text-[10px] sm:text-xs font-black text-white italic tracking-widest font-mono">
               {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
             </span>
          </div>
          <button onClick={() => setShowSettings(true)} className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-[18px] apple-glass flex items-center justify-center swift-press swift-hover shadow-3xl transition-all overflow-hidden border border-white/10">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <SettingsIcon size={18} className="text-white/30 sm:w-[20px] sm:h-[20px]" />}
          </button>
        </div>
      </div>
      
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 sm:px-8 lg:px-14">
        <div className="max-w-4xl mx-auto pb-64">
          {currentScreen === 'analytics' ? <div className="animate-swift-zoom"><AnalyticsScreen /></div> : (
            <div className="animate-swift-enter">
              <FluidGreeting 
                primary={currentScreen === 'upcoming' ? "NEURAL_VECTORS" : neuralGreeting.p} 
                secondary={currentScreen === 'upcoming' ? "UPCOMING_DIRECTIVES" : neuralGreeting.s} 
                subtitle={currentScreen === 'upcoming' ? "Projecting future execution cycles..." : neuralGreeting.sub} 
                iconKey={currentScreen === 'upcoming' ? "calendar" : neuralGreeting.icon} 
              />
              
              {currentScreen === 'today' ? (
                <>
                  <div className={`apple-glass p-6 sm:p-10 lg:p-14 mb-10 sm:mb-14 flex flex-col sm:flex-row items-center justify-between group shadow-[0_40px_100px_rgba(0,0,0,0.6)] swift-press transition-all duration-700 relative overflow-hidden ${isAnyTimerRunning ? 'border-[var(--theme-primary)]/40 ring-4 sm:ring-8 ring-[var(--theme-primary)]/5' : 'border-white/5'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                    <div className="absolute left-0 bottom-0 h-1 sm:h-2 theme-gradient-bg transition-all duration-1000 ease-out shadow-[0_0_30px_var(--theme-primary-glow)]" style={{ width: `${completionPct}%` }} />
                    
                    <div className="relative z-10 mb-8 sm:mb-0 w-full sm:w-auto flex flex-col items-center sm:items-start text-center sm:text-left">
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 justify-center sm:justify-start">
                        <div className={`w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full shadow-2xl transition-all duration-500 ${isAnyTimerRunning ? 'bg-emerald-400 shadow-emerald-400/50 animate-pulse' : 'bg-white/20'}`} />
                        <span className="text-[10px] sm:text-[14px] text-white/50 font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] font-mono italic">SYNC_VELOCITY</span>
                      </div>
                      
                      <div className="flex items-baseline gap-2 sm:gap-4 justify-center sm:justify-start">
                        <span className="text-6xl sm:text-8xl lg:text-9xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                          {completionPct}
                        </span>
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black theme-text italic drop-shadow-[0_0_15px_var(--theme-primary-glow)] animate-pulse">%</span>
                      </div>
                      <div className="text-[9px] sm:text-[11px] font-black text-white/20 uppercase tracking-[0.3em] sm:tracking-[0.4em] font-mono mt-3 sm:mt-4 italic">Neural_Commit_Success_Protocol</div>
                    </div>

                    <div className="relative z-10 w-full sm:w-auto flex flex-col items-center sm:items-end justify-center">
                      <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="text-right hidden md:block">
                           <div className="text-lg font-black text-white italic tracking-tight">{tasksDoneCount} / {todayTasks.length}</div>
                           <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] font-mono">Synchronized_Units</div>
                        </div>
                        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all duration-500">
                           <Activity size={28} className={isAnyTimerRunning ? "theme-text animate-pulse sm:w-[32px] sm:h-[32px]" : "text-white/10 sm:w-[32px] sm:h-[32px]"} />
                           <div className="absolute inset-0 theme-gradient-bg opacity-0 group-hover:opacity-5 transition-opacity" />
                        </div>
                      </div>
                      <div className="px-5 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-[9px] sm:text-[11px] text-white/80 font-black uppercase tracking-[0.3em] flex items-center gap-3 sm:gap-4 shadow-xl">
                         {isAnyTimerRunning ? (
                           <>
                             <Timer size={14} className="theme-text animate-spin-slow sm:w-[16px] sm:h-[16px]" />
                             FLOW_ACTIVE
                           </>
                         ) : (
                           <>
                             <BrainCircuit size={14} className="text-white/20 sm:w-[16px] sm:h-[16px]" />
                             IDLE_STATE
                           </>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10 sm:space-y-16">
                    {todayTasks.length > 0 ? (
                      <>
                        {activeTasks.length > 0 && (
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center justify-between px-2">
                              <h3 className="flex items-center gap-3 text-[9px] sm:text-[11px] font-black text-[var(--theme-primary)] uppercase tracking-[0.4em] sm:tracking-[0.6em] font-mono">
                                <Flame size={14} className="animate-pulse sm:w-[16px] sm:h-[16px]" /> ACTIVE_LOGS
                              </h3>
                              <span className="text-[8px] sm:text-[9px] font-bold text-white/10 uppercase tracking-widest font-mono">Processing...</span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                              {activeTasks.map((task, i) => (
                                <div key={task.id} className="animate-swift-enter" style={{ animationDelay: `${i * 0.1}s` }}>
                                  <TaskCard task={task} onEdit={(t) => setEditingTask(t)} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {scheduledQueue.length > 0 && (
                          <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center justify-between px-2">
                              <h3 className="flex items-center gap-3 text-[9px] sm:text-[11px] font-black text-white/30 uppercase tracking-[0.4em] sm:tracking-[0.6em] font-mono">
                                <Target size={14} className="sm:w-[16px] sm:h-[16px]" /> NEURAL_QUEUE
                              </h3>
                              <span className="text-[8px] sm:text-[9px] font-bold text-white/10 uppercase tracking-widest font-mono italic">Projected sequence</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                              {scheduledQueue.map((task, i) => (
                                <div key={task.id} className="animate-swift-enter" style={{ animationDelay: `${(activeTasks.length + i) * 0.1}s` }}>
                                  <TaskCard 
                                    task={task} 
                                    onEdit={(t) => setEditingTask(t)} 
                                    startTime={task.startTime} 
                                    endTime={task.endTime} 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {todayTasks.length === tasksDoneCount && todayTasks.length > 0 && (
                           <div className="py-20 sm:py-24 flex flex-col items-center text-center animate-swift-enter">
                              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 sm:mb-8 shadow-3xl">
                                <Check size={32} strokeWidth={3} className="sm:w-[40px] sm:h-[40px]" />
                              </div>
                              <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter mb-2 sm:mb-3">Sync Complete</h3>
                              <p className="text-[9px] sm:text-[11px] font-black text-white/20 uppercase tracking-[0.4em] sm:tracking-[0.5em] font-mono italic">Directive array successfully committed.</p>
                           </div>
                        )}
                      </>
                    ) : (
                      <div className="py-32 sm:py-40 flex flex-col items-center text-center opacity-20 transition-opacity">
                        <Sparkles size={48} className="theme-text animate-spin-slow sm:w-[56px] sm:h-[56px]" />
                        <p className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] leading-relaxed font-mono mt-8 sm:mt-10 italic max-w-[280px] sm:max-w-none mx-auto">Initialization required. Forge directives to begin.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : currentScreen === 'upcoming' ? (
                <div className="space-y-8 sm:space-y-12">
                   <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 gap-6 sm:gap-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center shadow-lg border border-white/10">
                           <Calendar size={18} className="theme-text sm:w-[20px] sm:h-[20px]" />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-[9px] sm:text-[11px] font-black text-white/30 uppercase tracking-[0.4em] sm:tracking-[0.6em] font-mono italic leading-none">Future_Vectors</h3>
                          <div className="text-[10px] sm:text-xs font-bold text-white italic mt-1">{upcomingTasks.length} pending directives</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowAIModal(true)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-2xl theme-gradient-bg text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl swift-hover active:scale-95 transition-all"
                      >
                         <Sparkles size={14} />
                         <span>Neural Projection</span>
                      </button>
                   </div>

                   {Object.entries(groupedUpcomingTasks).length > 0 ? (
                      (Object.entries(groupedUpcomingTasks) as [string, Task[]][]).sort().map(([day, dayTasks], idx) => (
                        <div key={day} className="animate-swift-enter" style={{ animationDelay: `${idx * 0.1}s` }}>
                           <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                              <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-black theme-text uppercase tracking-[0.3em] sm:tracking-[0.4em] font-mono italic">Cycle_{day}</div>
                              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                           </div>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                             {dayTasks.map((task, taskIdx) => (
                               <div key={task.id} className="relative group animate-swift-enter" style={{ animationDelay: `${taskIdx * 0.08}s` }}>
                                  <TaskCard task={task} onEdit={(t) => setEditingTask(t)} />
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handlePromoteTask(task.id); }}
                                    className="absolute top-4 right-14 sm:right-16 w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all opacity-0 group-hover:opacity-100 z-20"
                                    title="Promote to Today"
                                  >
                                    <ArrowUpRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                                  </button>
                               </div>
                             ))}
                           </div>
                        </div>
                      ))
                   ) : (
                      <div className="py-32 sm:py-48 flex flex-col items-center text-center opacity-10">
                         <CalendarDays size={56} strokeWidth={1} className="mb-4 sm:mb-6 animate-pulse sm:w-[64px] sm:h-[64px]" />
                         <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] font-mono italic">Future buffer empty. Plan ahead.</p>
                      </div>
                   )}
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                    <h3 className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-[0.4em] sm:tracking-[0.5em] font-mono italic text-center sm:text-left">Sector_Archive</h3>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {isAutoSyncing && (
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 animate-pulse">
                           <Brain size={12} className="theme-text" />
                           <span className="text-[8px] sm:text-[9px] font-black theme-text uppercase tracking-widest font-mono italic">Contextualizing...</span>
                        </div>
                      )}
                      {errorStatus && (
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-500/10 border border-red-500/20 animate-swift-enter">
                           <AlertTriangle size={12} className="text-red-500" />
                           <span className="text-[8px] sm:text-[9px] font-black text-red-500 uppercase tracking-widest font-mono">{errorStatus}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => handleNeuralPartition(false)}
                        disabled={partitioning || tasks.length === 0}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl apple-glass text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 sm:gap-3 transition-all swift-hover active:scale-95 disabled:opacity-30 border shadow-lg relative overflow-hidden ${errorStatus ? 'border-red-500/50 text-red-500' : 'border-[var(--theme-primary)]/20 theme-text hover:bg-white/10'}`}
                      >
                        {partitioning && !isAutoSyncing ? (
                          <>
                            <Loader2 size={12} className="animate-spin sm:w-[14px] sm:h-[14px]" />
                            <span>Neural Scan...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} className="sm:w-[14px] chromium:text-[var(--theme-primary)] sm:h-[14px]" />
                            <span>Re-Sync Context</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {Object.entries(groupedTasksByTopic).length > 0 ? (
                    (Object.entries(groupedTasksByTopic) as [string, Task[]][]).map(([topic, topicTasks], groupIdx) => {
                      const doneInTopic = topicTasks.filter(t => t.status === 'Done').length;
                      const progressInTopic = Math.round((doneInTopic / topicTasks.length) * 100);
                      
                      return (
                        <div key={topic} className="animate-swift-enter" style={{ animationDelay: `${groupIdx * 0.1}s` }}>
                          <div className="apple-glass p-6 sm:p-10 group mb-6 sm:mb-8 relative overflow-hidden border border-white/5 shadow-4xl transition-all hover:border-white/10 duration-700">
                             <div className="flex flex-col sm:flex-row items-start justify-between mb-8 sm:mb-12 relative gap-6 sm:gap-0">
                                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                   <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-700 group-hover:theme-gradient-bg group-hover:shadow-[0_0_20px_var(--theme-primary-glow)] shrink-0 border border-white/10`}>
                                      <Hexagon size={20} className="text-white/20 group-hover:text-white transition-colors sm:w-[24px] sm:h-[24px]" />
                                   </div>
                                   <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                        <span className="text-[8px] sm:text-[9px] font-black theme-text uppercase tracking-[0.3em] sm:tracking-[0.4em] font-mono">Sector_{groupIdx + 1}</span>
                                        <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-white/20" />
                                        <span className="text-[8px] sm:text-[9px] font-bold text-white/30 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{topicTasks.length} Directives</span>
                                      </div>
                                      {renamingTopic === topic ? (
                                        <input 
                                          autoFocus
                                          type="text"
                                          value={tempTopicName}
                                          onChange={e => setTempTopicName(e.target.value)}
                                          onBlur={() => handleRenameSector(topic)}
                                          onKeyDown={e => e.key === 'Enter' && handleRenameSector(topic)}
                                          className="bg-white/5 border border-white/20 rounded-lg px-2 sm:px-3 py-1 text-xl sm:text-2xl font-black text-white italic tracking-tight uppercase outline-none w-full swift-transition"
                                        />
                                      ) : (
                                        <div 
                                          className="flex items-center gap-2 sm:gap-3 cursor-pointer group/title"
                                          onClick={() => { setRenamingTopic(topic); setTempTopicName(topic); }}
                                        >
                                          <h2 className="text-xl sm:text-3xl font-black text-white italic tracking-tighter uppercase group-hover/title:theme-text transition-all leading-tight truncate">{topic}</h2>
                                          <Edit3 size={14} className="text-white/10 opacity-0 group-hover/title:opacity-100 transition-opacity sm:w-[16px] sm:h-[16px]" />
                                        </div>
                                      )}
                                   </div>
                                </div>
                                <div className="w-full sm:w-auto text-right flex flex-col items-end">
                                   <div className="text-3xl sm:text-4xl font-black italic text-white/10 group-hover:text-white/20 transition-all font-mono leading-none duration-700">{progressInTopic}%</div>
                                   <div className="w-full sm:w-24 h-1 bg-white/5 rounded-full mt-2 sm:mt-3 overflow-hidden">
                                      <div className="h-full theme-gradient-bg transition-all duration-1000" style={{ width: `${progressInTopic}%` }} />
                                   </div>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-1 gap-3 sm:gap-4">
                               {topicTasks.map((task, i) => (
                                 <div key={task.id} className="animate-swift-enter" style={{ animationDelay: `${i * 0.05}s` }}>
                                   <TaskCard task={task} onEdit={(t) => setEditingTask(t)} />
                                 </div>
                               ))}
                             </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-32 sm:py-48 flex flex-col items-center text-center opacity-10">
                       <BrainCircuit size={48} strokeWidth={1} className="mb-4 sm:mb-6 sm:w-[60px] sm:h-[60px]" />
                       <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] font-mono italic">Sector array empty. Neural sync pending.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 sm:px-6 pb-6 sm:pb-12 flex justify-center pointer-events-none" style={{ paddingBottom: 'calc(1.5rem + var(--sab))' }}>
        <div className="nav-island w-full max-w-xl p-1.5 sm:p-2 grid grid-cols-5 items-center pointer-events-auto relative h-16 sm:h-20 border border-white/10 shadow-4xl">
          
          <div 
            className="plasma-indicator h-12 sm:h-14 w-[20%]" 
            style={{ 
              left: `${screenToGridIndex[currentScreen] * 20}%` 
            }} 
          />

          <NavButton icon={Zap} label="FLOW" active={currentScreen === 'today'} onClick={() => setCurrentScreen('today')} />
          <NavButton icon={Layers} label="CORE" active={currentScreen === 'registry'} onClick={() => setCurrentScreen('registry')} />
          
          <div className="flex items-center justify-center relative z-20 group">
            <button 
              onClick={() => setShowCreationChoice(true)}
              className="w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] -mt-8 sm:-mt-10 rounded-full theme-gradient-bg text-white flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_var(--theme-primary-glow)] hover:scale-110 active:scale-95 transition-all duration-500 border-[4px] sm:border-[6px] border-black/80 relative overflow-visible"
            >
              <div className="ignite-inner-ring" />
              <div className="ignite-outer-ring" />
              <div className="ignite-pulse-glow" />
              <Plus size={24} strokeWidth={3} className="sm:w-[30px] sm:h-[30px] group-hover:rotate-180 transition-all duration-1000 relative z-10" />
            </button>
          </div>

          <NavButton icon={Calendar} label="VECTORS" active={currentScreen === 'upcoming'} onClick={() => setCurrentScreen('upcoming')} />
          <NavButton icon={TrendingUp} label="DATA" active={currentScreen === 'analytics'} onClick={() => setCurrentScreen('analytics')} />
        </div>
      </div>

      {showCreationChoice && <CreationChoiceModal onClose={() => setShowCreationChoice(false)} onManual={() => { setShowCreationChoice(false); setShowAddModal(true); }} onAI={() => { setShowCreationChoice(false); setShowAIModal(true); }} />}
      {showAddModal && <TaskModal onClose={() => setShowAddModal(false)} />}
      {showAIModal && <AIModal onClose={() => setShowAIModal(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {editingTask && <TaskModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;