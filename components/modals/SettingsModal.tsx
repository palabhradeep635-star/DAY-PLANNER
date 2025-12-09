
import React, { useState } from 'react';
import { X, Moon, Sun, Bell, Trash2, Calendar, Database, User, Bot, Info, ChevronRight, LogOut, Loader2, Check, ShieldCheck, Zap, Brain, AppWindow, ArrowRight, Mail, Lock, Cloud, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EcosystemModal } from './EcosystemModal';
import { GradientTheme } from '../../types';
import { requestNotificationPermission, sendNotification } from '../../utils/calendar';

interface SettingsModalProps {
  onClose: () => void;
}

// Brand Icons Components
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" style={{fill: '#4285F4'}} />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{fill: '#34A853'}} />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" style={{fill: '#FBBC05'}} />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" style={{fill: '#EA4335'}} />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 dark:text-white text-black" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 23 23">
    <path fill="#f25022" d="M1 1h10v10H1z"/>
    <path fill="#00a4ef" d="M1 12h10v10H1z"/>
    <path fill="#7fba00" d="M12 1h10v10H12z"/>
    <path fill="#ffb900" d="M12 12h10v10H12z"/>
  </svg>
);

// Helper for Initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings, clearCache, user, login, signup, logout } = useApp();
  const [view, setView] = useState<'settings' | 'auth'>('settings');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showEcosystem, setShowEcosystem] = useState(false);
  
  // Auth State
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  // --- ACTIONS ---

  const handleProviderLogin = async (provider: 'google' | 'x' | 'microsoft') => {
    setLoadingProvider(provider);
    setError(null);
    
    try {
      await login("", "", true, provider);
      setLoadingProvider(null);
      if (provider === 'google') {
        setShowEcosystem(true);
      } else {
        setView('settings');
      }
    } catch (e: any) {
      setError(e.message || "Login failed. Please try again.");
      setLoadingProvider(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingProvider('email');

    // Basic Validation
    if (!emailForm.email || !emailForm.password) {
      setError("Please fill in all fields.");
      setLoadingProvider(null);
      return;
    }
    if (authMode === 'signup' && !emailForm.name) {
      setError("Name is required for sign up.");
      setLoadingProvider(null);
      return;
    }

    try {
      if (authMode === 'signup') {
        await signup(emailForm.name, emailForm.email, emailForm.password);
      } else {
        await login(emailForm.email, emailForm.password, false, 'email');
      }
      setLoadingProvider(null);
      setView('settings');
    } catch (e: any) {
      setError(e.message || "Authentication failed");
      setLoadingProvider(null);
    }
  };

  const toggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updateSettings({ notificationsEnabled: true });
        sendNotification("Notifications Active", "You'll now receive smart study reminders!");
      } else {
        alert("Permission denied. Please enable notifications in your browser settings.");
      }
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  const finalizeGoogleLogin = () => {
    setShowEcosystem(false);
    setView('settings');
  };

  // --- SUB-COMPONENTS ---

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 px-3 mt-8 first:mt-2">
      {title}
    </h3>
  );

  const ThemeOption = ({ theme, color, label }: { theme: GradientTheme, color: string, label: string }) => (
    <button
      onClick={() => updateSettings({ gradientTheme: theme })}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${
        settings.gradientTheme === theme 
          ? 'border-[var(--theme-primary)] scale-100 shadow-[0_0_20px_-5px_var(--theme-primary)]' 
          : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100 hover:border-white/20'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-sm drop-shadow-md group-hover:scale-110 transition-transform">{label}</span>
      </div>
      {settings.gradientTheme === theme && (
        <div className="absolute top-2 right-2 bg-white text-[var(--theme-primary)] rounded-full p-0.5">
          <Check size={12} strokeWidth={3} />
        </div>
      )}
    </button>
  );

  const SettingRow = ({ icon: Icon, label, subLabel, value, onClick, toggle = false, danger = false, loading = false, disabled = false }: any) => (
    <div 
      onClick={!loading && !disabled ? onClick : undefined}
      className={`flex items-center justify-between p-4 bg-white dark:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0 active:bg-gray-50 dark:active:bg-white/10 transition-colors first:rounded-t-3xl last:rounded-b-3xl group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${danger ? 'bg-red-500/10' : `bg-gray-100 dark:bg-white/5`}`}>
          {loading ? <Loader2 size={22} className={`animate-spin ${danger ? 'text-red-500' : `theme-text`}`} /> : <Icon size={22} className={danger ? 'text-red-500' : `theme-text`} />}
        </div>
        <div>
           <div className={`text-base font-bold ${danger ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{label}</div>
           {subLabel && <div className="text-xs text-gray-400 mt-0.5 font-medium">{subLabel}</div>}
        </div>
      </div>
      {toggle ? (
        <div className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${value ? 'theme-bg shadow-[0_0_15px_-5px_var(--theme-primary)]' : 'bg-gray-200 dark:bg-white/10'}`}>
          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${value ? 'translate-x-7' : 'translate-x-1'}`} />
        </div>
      ) : (
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-400 font-medium">{typeof value === 'string' ? value : ''}</span>
           {!danger && <ChevronRight size={20} className="text-gray-400/50 group-hover:translate-x-1 transition-transform" />}
        </div>
      )}
    </div>
  );

  // --- VIEWS ---

  if (view === 'auth') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity" />
        <div 
          className="glass-card w-full max-w-md modal-slide-up relative z-10 !p-8 overflow-hidden !rounded-[36px]" 
          onClick={e => e.stopPropagation()}
          style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(50px)' }}
        >
          <button onClick={() => setView('settings')} className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 transition-colors group">
            <ArrowRight className="rotate-180 w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
          </button>

          <div className="text-center mb-8 mt-2">
             <div className="w-16 h-16 rounded-2xl theme-gradient-bg mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[var(--theme-primary)]/40">
                <User className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
               {authMode === 'signin' ? 'Welcome back' : 'Create account'}
             </h2>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
               {authMode === 'signin' ? 'Sign in to access your ecosystem.' : 'Start your journey to mastery.'}
             </p>
          </div>

          <div className="space-y-3 mb-8">
            <button 
              onClick={() => handleProviderLogin('google')}
              disabled={!!loadingProvider}
              className="w-full py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-semibold text-gray-900 dark:text-white relative overflow-hidden group"
            >
              {loadingProvider === 'google' ? <Loader2 className="animate-spin text-gray-400" /> : (
                <>
                  <div className="absolute inset-0 bg-blue-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  <GoogleIcon />
                  <span className="relative z-10">Continue with Google</span>
                </>
              )}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleProviderLogin('x')}
                disabled={!!loadingProvider}
                className="w-full py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-semibold text-gray-900 dark:text-white"
              >
                {loadingProvider === 'x' ? <Loader2 className="animate-spin text-gray-400" /> : <><XIcon /> <span>X</span></>}
              </button>
              <button 
                onClick={() => handleProviderLogin('microsoft')}
                disabled={!!loadingProvider}
                className="w-full py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-semibold text-gray-900 dark:text-white"
              >
                {loadingProvider === 'microsoft' ? <Loader2 className="animate-spin text-gray-400" /> : <><MicrosoftIcon /> <span>Microsoft</span></>}
              </button>
            </div>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#18181b] px-2 text-gray-500 font-bold tracking-widest">Or with email</span></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1 animate-enter">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Name</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     value={emailForm.name}
                     onChange={e => setEmailForm({...emailForm, name: e.target.value})}
                     className="input-field pl-11 !bg-white/50 dark:!bg-black/20 text-sm" 
                     placeholder="Your Name" 
                   />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="email" 
                   value={emailForm.email}
                   onChange={e => setEmailForm({...emailForm, email: e.target.value})}
                   className="input-field pl-11 !bg-white/50 dark:!bg-black/20 text-sm" 
                   placeholder="name@example.com" 
                 />
              </div>
            </div>

            <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="password" 
                   value={emailForm.password}
                   onChange={e => setEmailForm({...emailForm, password: e.target.value})}
                   className="input-field pl-11 !bg-white/50 dark:!bg-black/20 text-sm" 
                   placeholder="••••••••" 
                 />
               </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-500/10 p-3 rounded-lg animate-enter">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={!!loadingProvider}
              className="w-full py-4 mt-2 rounded-xl theme-gradient-bg text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loadingProvider === 'email' ? <Loader2 className="animate-spin" /> : (
                <>
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                className="theme-text font-bold hover:underline"
              >
                {authMode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- SETTINGS VIEW ---
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity" />
        <div 
          className="glass-card w-full max-w-md modal-slide-up relative z-10 p-0 overflow-hidden !rounded-[36px] max-h-[90vh] overflow-y-auto" 
          onClick={e => e.stopPropagation()}
          style={{ 
            background: 'var(--glass-bg)', 
            backdropFilter: 'blur(50px)',
            border: '1px solid var(--glass-border)'
          }}
        >
          {/* Header */}
          <div className="p-5 flex justify-between items-center border-b border-white/10 sticky top-0 bg-white/80 dark:bg-black/40 backdrop-blur-xl z-20">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 pt-4 pb-10">
            {/* Account Card */}
            <div className="mb-8">
              {user ? (
                 <div className="p-1 rounded-[32px] theme-gradient-bg shadow-2xl shadow-[var(--theme-primary)]/20">
                   <div className="bg-white dark:bg-[#151517] rounded-[28px] p-6 relative overflow-hidden">
                     {/* Eco Badge */}
                     <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-wide">Active</span>
                     </div>

                     <div className="flex items-center gap-4 mb-6">
                       {/* INITALS AVATAR */}
                       <div className="w-16 h-16 rounded-full border-4 border-white/10 shadow-lg flex items-center justify-center bg-gray-900 text-white text-2xl font-bold">
                          {getInitials(user.name)}
                       </div>
                       <div>
                         <div className="font-bold text-2xl text-gray-900 dark:text-white">{user.name}</div>
                         <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                             <Calendar size={16} />
                           </div>
                           <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Sync On</span>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                             <Sparkles size={16} />
                           </div>
                           <span className="text-xs font-bold text-gray-600 dark:text-gray-300">AI Linked</span>
                        </div>
                     </div>

                     <button onClick={logout} className="w-full mt-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                       <LogOut size={16} /> Sign Out
                     </button>
                   </div>
                 </div>
              ) : (
                <div className="p-6 rounded-[32px] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-xl text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg relative z-10">
                     <Cloud className="w-8 h-8 theme-text" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">Connect Workspace</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-4 relative z-10">
                    Enable cross-device sync with Google Calendar, Notion, and Gemini.
                  </p>
                  <button 
                    onClick={() => { setView('auth'); setAuthMode('signin'); }}
                    className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative z-10 border border-gray-100"
                  >
                     <span>Sign In / Sign Up</span>
                     <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <SectionHeader title="Preferences" />
            <div className="flex flex-col rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
               <SettingRow 
                 icon={Bell} 
                 label="Push Notifications" 
                 subLabel={settings.notificationsEnabled ? "Smart reminders active" : "Enable for daily alerts"} 
                 value={settings.notificationsEnabled} 
                 toggle={true} 
                 onClick={toggleNotifications} 
               />
            </div>
            
            {/* Other Settings */}
            <SectionHeader title="Appearance" />
            <div className="grid grid-cols-2 gap-3 mb-4">
               <ThemeOption theme="cosmic" label="Cosmic" color="from-indigo-500 to-purple-600" />
               <ThemeOption theme="emerald" label="Emerald" color="from-emerald-500 to-teal-600" />
               <ThemeOption theme="rgb" label="RGB Chroma" color="from-pink-500 via-cyan-400 to-lime-400" />
               <ThemeOption theme="sunset" label="Sunset" color="from-orange-500 to-rose-600" />
               <ThemeOption theme="ocean" label="Ocean" color="from-blue-500 to-cyan-600" />
               <ThemeOption theme="midnight" label="Midnight" color="from-slate-700 to-gray-900" />
            </div>
            <div className="flex flex-col rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
              <SettingRow icon={settings.theme === 'dark' ? Moon : Sun} label="Dark Mode" value={settings.theme === 'dark'} toggle={true} onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })} />
            </div>

            <SectionHeader title="Ecosystem" />
            <div className="flex flex-col rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
               <SettingRow icon={Calendar} label="Google Calendar" subLabel={user ? "Auto-sync enabled" : "Sign in to enable"} value={user ? true : false} toggle={true} disabled={!user} onClick={() => {}} />
               <SettingRow icon={Bot} label="ChatGPT 4.0" subLabel="Advanced reasoning" value={settings.aiProvider === 'chatgpt'} toggle={true} onClick={() => updateSettings({ aiProvider: settings.aiProvider === 'chatgpt' ? 'gemini' : 'chatgpt' })} />
               <SettingRow icon={Database} label="Notion Sync" subLabel="Export daily summaries" value={settings.integrations.notion} toggle={true} onClick={() => updateSettings({ integrations: { ...settings.integrations, notion: !settings.integrations.notion } })} />
            </div>

            <SectionHeader title="System" />
            <div className="flex flex-col rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
              <SettingRow icon={Trash2} label="Reset App" subLabel="Clear all local data" danger={true} onClick={() => { if(confirm('Factory Reset: Delete all data?')) clearCache(); }} />
            </div>
            
            <div className="mt-8 text-center pb-4">
               <div className="flex justify-center items-center gap-2 text-xs text-gray-500 dark:text-gray-500 font-medium">
                  <Zap size={12} className="text-yellow-500" fill="currentColor" />
                  <span>Powered by Gemini 2.5 Flash</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {showEcosystem && (
        <EcosystemModal onConfirm={finalizeGoogleLogin} onClose={() => setShowEcosystem(false)} />
      )}
    </>
  );
};
