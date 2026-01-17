import React, { useState } from 'react';
import { X, Moon, Sun, Bell, Trash2, Bot, ChevronRight, Zap, Check, Sparkles, Cpu, Palette, Calendar, Database, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GradientTheme, Task, AIProvider } from '../../types';
import { requestNotificationPermission } from '../../utils/calendar';
import { EcosystemModal } from './EcosystemModal';

interface SettingsModalProps {
  onClose: () => void;
}

const CHASSIS_SKINS: { id: GradientTheme; name: string; gradient: string }[] = [
  { id: 'cosmic', name: 'Cosmic', gradient: 'linear-gradient(135deg, #818cf8, #c084fc)' },
  { id: 'emerald', name: 'Emerald', gradient: 'linear-gradient(135deg, #10b981, #3b82f6)' },
  { id: 'toxic', name: 'Toxic', gradient: 'linear-gradient(135deg, #bef264, #06b6d4)' },
  { id: 'nebula', name: 'Nebula', gradient: 'linear-gradient(135deg, #8b5cf6, #fb7185)' },
  { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { id: 'ocean', name: 'Ocean', gradient: 'linear-gradient(135deg, #22d3ee, #3b82f6)' },
  { id: 'rgb', name: 'Hyper', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)' },
  { id: 'midnight', name: 'Midnight', gradient: 'linear-gradient(135deg, #64748b, #1e293b)' },
  { id: 'monolith', name: 'Monolith', gradient: 'linear-gradient(135deg, #f8fafc, #475569)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings, clearCache, addTask, tasks } = useApp();
  const [showProviderSelect, setShowProviderSelect] = useState(false);
  const [showEcosystem, setShowEcosystem] = useState(false);

  const handleToggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) updateSettings({ notificationsEnabled: true });
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  const handleToggleIntegration = (key: keyof typeof settings.integrations) => {
    if (!settings.integrations[key]) {
      setShowEcosystem(true);
    } else {
      updateSettings({ integrations: { ...settings.integrations, [key]: false } });
    }
  };

  const runDiagnostic = () => {
    const testTasks: Partial<Task>[] = [
      { id: '1', title: 'Binary Search Mastery', phase: 'P1', day: 'D1', code: 'P1D1', type: 'Practice', priority: 'High', status: 'Done', estimateMinutes: 45, actualMinutes: 52, isToday: true },
      { id: '2', title: 'Dynamic Programming Patterns', phase: 'P3', day: 'D1', code: 'P3D1', type: 'Lecture', priority: 'High', status: 'In progress', estimateMinutes: 90, actualMinutes: 30, isToday: true, timerRunning: true, timerStartTime: Date.now() },
    ];
    
    testTasks.forEach(t => {
      if (!tasks.find(ex => ex.id === t.id)) {
        addTask({ ...t, lastEdited: Date.now() } as Task);
      }
    });
    onClose();
  };

  const SettingRow = ({ icon: Icon, label, subLabel, value, onClick, toggle = false, danger = false, rightElement, index = 0 }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-white/5 border-b border-white/5 last:border-0 active:bg-white/10 transition-colors cursor-pointer group animate-swift-enter ${danger ? 'text-red-400' : 'text-white'}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center swift-transition ${danger ? 'bg-red-500/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
          <Icon size={20} className={danger ? 'text-red-500' : 'theme-text'} />
        </div>
        <div>
           <div className="text-sm font-bold uppercase tracking-tight italic group-hover:translate-x-1 transition-transform duration-500">{label}</div>
           {subLabel && <div className="text-[10px] text-white/30 font-medium">{subLabel}</div>}
        </div>
      </div>
      {toggle ? (
        <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ease-in-out ${value ? 'theme-gradient-bg shadow-[0_0_15px_var(--theme-primary-glow)]' : 'bg-white/10'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${value ? 'translate-x-7 scale-110' : 'translate-x-1 scale-100'}`} />
        </div>
      ) : rightElement ? (
        rightElement
      ) : (
        <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />
      )}
    </div>
  );

  if (showProviderSelect) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-swift-enter" onClick={() => setShowProviderSelect(false)}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-700" />
        <div className="apple-glass w-full max-w-sm relative z-10 p-6 !rounded-[32px] border border-white/20 shadow-2xl animate-swift-zoom" onClick={e => e.stopPropagation()}>
           <h3 className="text-lg font-black text-white italic uppercase tracking-tight mb-6">Select Neural Engine</h3>
           <div className="space-y-3">
              {[
                { id: 'gemini', name: 'Apex Neural', model: 'Gemini 3 Flash', icon: Sparkles, color: 'text-indigo-400' },
                { id: 'chatgpt', name: 'GPT Forge', model: 'ChatGPT Protocol', icon: Bot, iconColor: 'text-emerald-400' }
              ].map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => { updateSettings({ aiProvider: p.id as AIProvider }); setShowProviderSelect(false); }}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-500 swift-hover animate-swift-enter ${
                    settings.aiProvider === p.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <p.icon size={20} className={p.id === 'gemini' ? 'text-indigo-400' : 'text-emerald-400'} />
                    <div className="text-left">
                       <p className="text-sm font-bold text-white uppercase italic">{p.name}</p>
                       <p className="text-[10px] text-white/30 font-mono tracking-tighter uppercase">{p.model}</p>
                    </div>
                  </div>
                  {settings.aiProvider === p.id && <Check size={18} className="text-white animate-swift-zoom" />}
                </button>
              ))}
           </div>
           <button onClick={() => setShowProviderSelect(false)} className="w-full mt-6 py-3 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] swift-press">Cancel_Handshake</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-swift-enter" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <div 
        className="apple-glass w-full max-w-md relative z-10 p-0 overflow-hidden !rounded-[40px] border border-white/20 max-h-[90vh] overflow-y-auto no-scrollbar shadow-3xl animate-swift-zoom" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <h2 className="text-xl font-black text-white italic uppercase tracking-tight">System_Control</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white swift-press transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="rounded-[28px] overflow-hidden border border-white/5 bg-black/20">
              <SettingRow 
                index={0}
                icon={Bot} 
                label="Neural Provider" 
                subLabel={settings.aiProvider === 'gemini' ? 'Apex Neural (Gemini)' : 'GPT Forge (ChatGPT)'} 
                onClick={() => setShowProviderSelect(true)} 
                rightElement={
                  <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-white/60 uppercase group-hover:bg-white/10 transition-colors">
                    Switch
                  </div>
                }
              />
              
              <div className="bg-white/5 p-5 border-b border-white/5 animate-swift-enter" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                    <Palette size={16} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] font-mono">Schedule Integrations</h3>
                    <p className="text-xs font-bold text-white italic">Cloud Productivity</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <SettingRow index={1} icon={Calendar} label="Google Calendar" value={settings.integrations.googleCalendar} toggle onClick={() => handleToggleIntegration('googleCalendar')} />
                  <SettingRow index={2} icon={Database} label="Notion Sync" value={settings.integrations.notion} toggle onClick={() => handleToggleIntegration('notion')} />
                  <SettingRow index={3} icon={Share2} label="Microsoft Tasks" value={settings.integrations.microsoftTasks} toggle onClick={() => handleToggleIntegration('microsoftTasks')} />
                </div>
              </div>

              <div className="bg-white/5 p-5 border-b border-white/5 animate-swift-enter" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                    <Palette size={16} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] font-mono">Chassis Identity</h3>
                    <p className="text-xs font-bold text-white italic">Atmospheric Skins</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {CHASSIS_SKINS.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ gradientTheme: t.id })}
                      className={`relative aspect-video rounded-xl overflow-hidden group transition-all duration-500 border-2 animate-swift-enter ${
                        settings.gradientTheme === t.id ? 'border-white ring-4 ring-white/10 scale-105' : 'border-transparent hover:border-white/20'
                      }`}
                      style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                    >
                      <div className="absolute inset-0 opacity-80" style={{ background: t.gradient }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 px-2 py-1 rounded backdrop-blur-md translate-y-2 group-hover:translate-y-0">
                          {t.name}
                        </span>
                        {settings.gradientTheme === t.id && (
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg animate-swift-zoom">
                            <Check size={12} className="text-black stroke-[4px]" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow index={4} icon={Zap} label="Diagnostic Mode" subLabel="Populate Test Logs" onClick={runDiagnostic} />
              <SettingRow index={5} icon={Bell} label="Reminders" value={settings.notificationsEnabled} toggle onClick={handleToggleNotifications} />
              <SettingRow index={6} icon={settings.theme === 'dark' ? Moon : Sun} label="Dark Protocol" value={settings.theme === 'dark'} toggle onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })} />
              <SettingRow index={7} icon={Trash2} label="Factory_Reset" danger onClick={() => { if(confirm('Wipe all neural logs?')) clearCache(); }} />
            </div>
          </div>
          
          <div className="mt-10 flex flex-col items-center gap-3 animate-swift-enter" style={{ animationDelay: '0.8s' }}>
             <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 swift-hover">
                <Cpu size={10} className="text-yellow-400 animate-pulse" />
                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] font-mono italic">Apex Engine v2.0.4</span>
             </div>
          </div>
        </div>
      </div>

      {showEcosystem && (
        <EcosystemModal 
          onConfirm={() => {
            updateSettings({ 
              integrations: { 
                ...settings.integrations, 
                googleCalendar: true, 
                notion: true,
                microsoftTasks: true
              } 
            });
            setShowEcosystem(false);
          }}
          onClose={() => setShowEcosystem(false)}
        />
      )}
    </div>
  );
};