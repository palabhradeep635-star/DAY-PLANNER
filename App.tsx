import React, { useState, useEffect, useMemo, memo } from 'react';
import { Settings as SettingsIcon, TrendingUp, Plus, Sparkles, Layers, Zap, Flame, Activity, Cpu, BrainCircuit, Rocket, Clock as ClockIcon, Loader2, Brain, Edit3, Check, AlertTriangle, Hexagon, Target, ChevronRight, Timer, Calendar, CalendarDays, ArrowUpRight, Wand2, Hash } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { TaskCard as TaskCardBase } from './components/TaskCard';
import { TaskModal } from './components/modals/TaskModal';
import { AIModal } from './components/modals/AIModal';
import { CreationChoiceModal } from './components/modals/CreationChoiceModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { Task } from './types';
import { generateNeuralGreeting, partitionNeuralSectors, prioritizeDailyTasks } from './services/aiService';

// Memoized Card for performance
const TaskCard = memo(TaskCardBase);

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

// Isolated Clock component to prevent full App re-renders every second
const RealtimeClock = memo(() => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-[10px] sm:text-xs font-black text-white italic tracking-widest font-mono">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
    </span>
  );
});

// Isolated System Status component
const SystemStatus = memo(({ optimizingFlow, isAutoSyncing }: { optimizingFlow: boolean, isAutoSyncing: boolean }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setIdx(p => (p + 1) % STATUS_STRINGS.length), 6000);
    return () => clearInterval(int);
  }, []);
  
  return (
    <div className="text-[8px] sm:text-[10px] text-white/30 font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase font-mono italic truncate max-w-[120px] sm:max-w-none">
      {optimizingFlow ? "SYNC_HANDSHAKE: VERIFYING_NEURAL_KEY" : isAutoSyncing ? "Neural: Contextualizing..." : STATUS_STRINGS[idx]}
    </div>
  );
});

const FluidGreeting = memo(({ primary, secondary, subtitle, iconKey }: { primary: string, secondary: string, subtitle: string, iconKey: string }) => {
  const [display, setDisplay] = useState({ primary, secondary, subtitle, iconKey });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const IconMap: Record<string, any> = { zap: Zap, flame: Flame, rocket: Rocket, activity: Activity, brain: BrainCircuit, calendar: CalendarDays };

  useEffect(() => {
    if (primary !== display.primary || secondary !== display.secondary) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplay({ primary, secondary, subtitle, iconKey });
        setIsTransitioning(false);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [primary, secondary, subtitle, iconKey]);

  const Icon = IconMap[display.iconKey] || BrainCircuit;

  return (
    <div className={`mb-12 sm:mb-16 pt-4 sm:pt-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
      <div className="greeting-nexus">
        <span className="greeting-label">{display.primary.replace(/_/g, ' ')}</span>
        <h2 className="fluid-h1">{display.secondary.replace(/_/g, ' ')}</h2>
      </div>
      
      <div className="mt-5 sm:mt-8 flex items-center gap-4 opacity-40">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shadow-lg border border-white/5">
          <Icon size={14} className="theme-text animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] font-mono italic truncate">{display.subtitle}</p>
      </div>
    </div>
  );
});

const NavButton = memo(({ icon: Icon, label, active, onClick, count }: any) => {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center relative z-20 group outline-none h-full w-full">
      <div className={`p-1.5 sm:p-2.5 rounded-2xl transition-all duration-700 relative ${active ? 'text-white scale-110 translate-y-[-2px]' : 'text-white/20 hover:text-white/40'}`}>
        <Icon size={20} className={`sm:w-[22px] sm:h-[22px] transition-all duration-700 ${active ? 'theme-text drop-shadow-[0_0_12px_var(--theme-primary-glow)]' : ''}`} strokeWidth={active ? 2.5 : 2} />
        {count > 0 && !active && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
            <span className="text-[7px] font-black text-white/40">{count}</span>
          </div>
        )}
      </div>
      <div className={`text-[6px] sm:text-[7px] font-bold uppercase tracking-[0.3em] font-outfit transition-all duration-700 ${active ? 'opacity-100 max-h-4 translate-y-0 mt-1 text-white' : 'opacity-0 max-h-0 -translate-y-2'}`}>
        {label}
      </div>
    </button>
  );
});

const AppContent = () => {
  const { tasks, updateTask, bulkUpdateTasks, loading, settings, user } = useApp();
  const [currentScreen, setCurrentScreen] = useState('today');
  const [standbyIdx, setStandbyIdx] = useState(0);
  const [showCreationChoice, setShowCreationChoice] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [partitioning, setPartitioning] = useState(false);
  const [optimizingFlow, setOptimizingFlow] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  
  const [neuralGreeting, setNeuralGreeting] = useState(STANDBY_SEQUENCE[0]);
  const [taskOrder, setTaskOrder] = useState<string[]>([]);

  const sortedTasks = useMemo<Task[]>(() => {
    if (!taskOrder.length) return tasks;
    return [...tasks].sort((a, b) => {
      const indexA = taskOrder.indexOf(a.id);
      const indexB = taskOrder.indexOf(b.id);
      return (indexA === -1 ? 1 : indexA) - (indexB === -1 ? 1 : indexB);
    });
  }, [tasks, taskOrder]);

  const todayTasks = useMemo<Task[]>(() => sortedTasks.filter(t => t.isToday), [sortedTasks]);
  const upcomingTasks = useMemo<Task[]>(() => sortedTasks.filter(t => !t.isToday), [sortedTasks]);
  const activeTasks = useMemo<Task[]>(() => todayTasks.filter(t => t.timerRunning || t.status === 'In progress'), [todayTasks]);
  const remainingTasksRaw = useMemo<Task[]>(() => todayTasks.filter(t => !t.timerRunning && t.status !== 'In progress' && t.status !== 'Done'), [todayTasks]);
  const tasksDoneCount = useMemo(() => todayTasks.filter(t => t.status === 'Done').length, [todayTasks]);
  const isAnyTimerRunning = useMemo(() => tasks.some(t => t.timerRunning), [tasks]);

  const tasksByTopic = useMemo<Record<string, Task[]>>(() => {
    const groups: Record<string, Task[]> = {};
    sortedTasks.forEach(task => {
      const topic = task.topic || "UNASSIGNED_SECTORS";
      if (!groups[topic]) groups[topic] = [];
      groups[topic].push(task);
    });
    return groups;
  }, [sortedTasks]);

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

  const fetchGreeting = async () => {
    if (!user?.name || loading || document.hidden) return;
    try {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const left = todayTasks.length - tasksDoneCount;
      const activeTaskName = activeTasks[0]?.title;
      const data = await generateNeuralGreeting(user.name, timeStr, left, todayTasks.length, activeTaskName, currentScreen);
      setNeuralGreeting(data);
      setHasFetchedInitial(true);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const greetingCycle = setInterval(fetchGreeting, 10000); 
    const standbyInterval = setInterval(() => {
      if (!hasFetchedInitial) setStandbyIdx(p => (p + 1) % STANDBY_SEQUENCE.length);
    }, 4000);
    return () => { 
      clearInterval(greetingCycle);
      clearInterval(standbyInterval);
    };
  }, [user?.name, todayTasks.length, tasksDoneCount, loading, hasFetchedInitial, activeTasks, currentScreen]);

  useEffect(() => {
    if (!hasFetchedInitial) setNeuralGreeting(STANDBY_SEQUENCE[standbyIdx]);
  }, [standbyIdx, hasFetchedInitial]);

  useEffect(() => {
    if (loading || tasks.length === 0 || partitioning) return;
    const unassignedTasks = tasks.filter(t => !t.topic || t.topic === "Unassigned Sectors");
    if (unassignedTasks.length > 0) {
      const timer = setTimeout(() => handleNeuralPartition(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [tasks, loading]);

  useEffect(() => { fetchGreeting(); }, [loading, user?.name, currentScreen]);

  const handleNeuralPartition = async (isAuto = false) => {
    if (tasks.length === 0 || partitioning) return;
    if (isAuto) setIsAutoSyncing(true);
    setPartitioning(true);
    try {
      const mapping = await partitionNeuralSectors(tasks);
      const updates: Record<string, Partial<Task>> = {};
      Object.entries(mapping).forEach(([id, topic]) => { updates[id] = { topic: topic as string }; });
      bulkUpdateTasks(updates);
    } catch (e: any) { console.error(e); } 
    finally { 
      setPartitioning(false); 
      setIsAutoSyncing(false);
    }
  };

  const handleOptimizeDailyFlow = async () => {
    if (todayTasks.length < 2 || optimizingFlow) return;
    setOptimizingFlow(true);
    try {
      const orderedIds = await prioritizeDailyTasks(todayTasks);
      if (orderedIds && orderedIds.length > 0) setTaskOrder(orderedIds);
    } catch (e: any) { console.error(e); } 
    finally { setOptimizingFlow(false); }
  };

  const completionPct = todayTasks.length === 0 ? 0 : Math.round((tasksDoneCount / todayTasks.length) * 100);
  const screenToGridIndex: Record<string, number> = { 'today': 0, 'registry': 1, 'upcoming': 3, 'analytics': 4 };

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

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-black" style={{ paddingTop: 'var(--sat)' }}>
      <div className="mesh-container">
        <div className={`blob blob-1 transition-all duration-[3000ms] ${isAnyTimerRunning ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`} />
        <div className={`blob blob-2 transition-all duration-[3000ms] ${isAnyTimerRunning ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`} />
      </div>
      
      <div className="relative z-30 flex items-center justify-between px-4 sm:px-8 lg:px-14 pt-6 sm:pt-10 pb-4">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full theme-gradient-bg shadow-[0_0_20px_var(--theme-primary-glow)] animate-pulse" />
          <SystemStatus optimizingFlow={optimizingFlow} isAutoSyncing={isAutoSyncing} />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl apple-glass flex items-center gap-2 sm:gap-3 shadow-3xl">
             <ClockIcon size={12} className="text-white/30 theme-text sm:w-[14px] sm:h-[14px]" />
             <RealtimeClock />
          </div>
          <button onClick={() => setShowSettings(true)} className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-[18px] apple-glass flex items-center justify-center swift-press shadow-3xl overflow-hidden border border-white/10">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <SettingsIcon size={18} className="text-white/30 sm:w-[20px] sm:h-[20px]" />}
          </button>
        </div>
      </div>
      
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 sm:px-8 lg:px-14">
        <div className="max-w-4xl mx-auto pb-64">
          {currentScreen === 'analytics' ? <div className="animate-swift-zoom"><AnalyticsScreen /></div> : (
            <div className="animate-swift-enter">
              <FluidGreeting 
                primary={currentScreen === 'upcoming' ? "NEURAL VECTORS" : currentScreen === 'registry' ? "LOGIC CORE" : neuralGreeting.p} 
                secondary={currentScreen === 'upcoming' ? "UPCOMING DIRECTIVES" : currentScreen === 'registry' ? "TASK REGISTRY" : neuralGreeting.s} 
                subtitle={currentScreen === 'upcoming' ? "Projecting future execution cycles..." : currentScreen === 'registry' ? "System-wide directive library..." : neuralGreeting.sub} 
                iconKey={currentScreen === 'upcoming' ? "calendar" : currentScreen === 'registry' ? "brain" : neuralGreeting.icon} 
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
                        <span className="text-6xl sm:text-8xl lg:text-9xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">{completionPct}</span>
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
                        </div>
                      </div>
                      <div className="px-5 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-[9px] sm:text-[11px] text-white/80 font-black uppercase tracking-[0.3em] flex items-center gap-3 sm:gap-4 shadow-xl">
                         {isAnyTimerRunning ? <><Timer size={14} className="theme-text animate-spin-slow sm:w-[16px] sm:h-[16px]" /> FLOW_ACTIVE</> : <><BrainCircuit size={14} className="text-white/20 sm:w-[16px] sm:h-[16px]" /> IDLE_STATE</>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10 sm:space-y-16">
                    {todayTasks.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                           <h3 className="flex items-center gap-3 text-[9px] sm:text-[11px] font-black text-white/30 uppercase tracking-[0.4em] sm:tracking-[0.6em] font-mono">DIRECTIVE_BLOCKS</h3>
                           <button onClick={handleOptimizeDailyFlow} disabled={optimizingFlow || todayTasks.length < 2} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-700 relative overflow-hidden shadow-xl ${optimizingFlow ? 'text-white scale-105 opacity-50' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}>
                              {optimizingFlow ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} className="theme-text" />}
                              <span>{optimizingFlow ? 'Optimizing' : 'Optimize Flow'}</span>
                           </button>
                        </div>
                        {activeTasks.length > 0 && (
                          <div className="space-y-4 sm:space-y-6">
                            <h3 className="flex items-center gap-3 text-[9px] sm:text-[11px] font-black text-[var(--theme-primary)] uppercase tracking-[0.4em] sm:tracking-[0.6em] font-mono px-2"><Flame size={14} className="animate-pulse" /> ACTIVE_LOGS</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                              {(activeTasks as Task[]).map((task) => <TaskCard key={task.id} task={task} onEdit={setEditingTask} />)}
                            </div>
                          </div>
                        )}
                        {scheduledQueue.length > 0 && (
                          <div className="space-y-4 sm:space-y-6">
                            <h3 className="flex items-center gap-3 text-[9px] sm:text-[11px] font-black text-white/30 uppercase tracking-[0.4em] sm:tracking-[0.6em] font-mono px-2"><Target size={14} /> NEURAL_QUEUE</h3>
                            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                              {(scheduledQueue as any[]).map((task) => <TaskCard key={task.id} task={task} onEdit={setEditingTask} startTime={task.startTime} endTime={task.endTime} />)}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-32 sm:py-40 flex flex-col items-center text-center opacity-20">
                        <Sparkles size={48} className="theme-text animate-spin-slow" />
                        <p className="text-[11px] font-black uppercase tracking-[0.6em] leading-relaxed font-mono mt-8 italic">Initialization required.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : currentScreen === 'registry' ? (
                <div className="space-y-12 sm:space-y-16">
                  {Object.entries(tasksByTopic).length > 0 ? (
                    Object.entries(tasksByTopic).map(([topic, topicTasks]) => (
                      <div key={topic} className="space-y-6">
                        <h3 className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.5em] font-mono px-2 italic"><Hash size={14} className="theme-text" /> {topic.replace(/_/g, ' ')}</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          {(topicTasks as Task[]).map((task) => <TaskCard key={task.id} task={task} onEdit={setEditingTask} />)}
                        </div>
                      </div>
                    ))
                  ) : <div className="py-40 flex items-center justify-center opacity-20 italic">DIRECTIVE_EMPTY</div>}
                </div>
              ) : currentScreen === 'upcoming' ? (
                <div className="space-y-8 sm:space-y-12">
                   <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6 sm:gap-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center shadow-lg border border-white/10"><Calendar size={18} className="theme-text" /></div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] font-mono leading-none">Future_Vectors</h3>
                          <div className="text-[10px] font-bold text-white mt-1">{upcomingTasks.length} pending units</div>
                        </div>
                      </div>
                      <button onClick={() => setShowAIModal(true)} className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-2xl theme-gradient-bg text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl swift-hover">
                         <Sparkles size={14} /><span>Neural Projection</span>
                      </button>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {(upcomingTasks as Task[]).map((task) => <TaskCard key={task.id} task={task} onEdit={setEditingTask} />)}
                   </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 sm:px-6 pb-6 sm:pb-10 flex justify-center pointer-events-none" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
        <div className="nav-island w-full max-w-xl p-1.5 sm:p-2 grid grid-cols-5 items-center pointer-events-auto relative h-16 sm:h-20 border border-white/10 shadow-4xl backdrop-blur-3xl bg-white/[0.03]">
          <div className="plasma-indicator h-12 sm:h-14 w-[18%] opacity-30 shadow-[0_0_40px_var(--theme-primary-glow)] rounded-[24px]" 
               style={{ left: `calc(${screenToGridIndex[currentScreen] * 20}% + 1%)`, transform: `translate3d(0, -50%, 0) ${isAnyTimerRunning ? 'scale(1.1)' : 'scale(1)'}` }} />
          <NavButton icon={Zap} label="FLOW" active={currentScreen === 'today'} onClick={() => setCurrentScreen('today')} count={todayTasks.length - tasksDoneCount} />
          <NavButton icon={Layers} label="CORE" active={currentScreen === 'registry'} onClick={() => setCurrentScreen('registry')} count={tasks.length} />
          <div className="flex items-center justify-center relative z-20 group">
            <button onClick={() => setShowCreationChoice(true)} className="w-[58px] h-[58px] sm:w-[72px] sm:h-[72px] -mt-10 sm:-mt-12 rounded-full theme-gradient-bg text-white flex items-center justify-center shadow-3xl hover:scale-110 transition-all duration-700 border-[4px] sm:border-[6px] border-black relative">
              <Plus size={26} strokeWidth={3} className="group-hover:rotate-180 transition-all duration-700" />
            </button>
          </div>
          <NavButton icon={Calendar} label="VECTORS" active={currentScreen === 'upcoming'} onClick={() => setCurrentScreen('upcoming')} count={upcomingTasks.length} />
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

const App = () => (<AppProvider><AppContent /></AppProvider>);
export default App;