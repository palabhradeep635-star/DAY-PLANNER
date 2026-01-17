import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { PHASES } from '../types';

const THEME_COLORS = {
  iris: '#818cf8',
  violet: '#c084fc',
  muted: 'rgba(255, 255, 255, 0.04)',
  label: 'rgba(255, 255, 255, 0.3)'
};

export const AnalyticsScreen: React.FC = () => {
  const { tasks } = useApp();
  
  const total = tasks.length || 1;
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const inProgressCount = tasks.filter(t => t.status === 'In progress').length;
  const todoCount = tasks.filter(t => t.status === 'Not started').length;

  const statusData = [
    { name: 'Synced', value: doneCount, color: THEME_COLORS.iris }, 
    { name: 'Active', value: inProgressCount, color: THEME_COLORS.violet }, 
    { name: 'Pending', value: todoCount, color: THEME_COLORS.muted },
  ].filter(d => d.value > 0 || d.name === 'Pending');

  const timeData = Object.keys(PHASES).map(phaseKey => {
    const phaseTasks = tasks.filter(t => t.phase === phaseKey);
    return {
      name: phaseKey,
      minutes: phaseTasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0)
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl shadow-2xl text-[10px] text-white font-mono">
          <p className="font-black opacity-40 mb-1 tracking-widest uppercase">{payload[0].name}</p>
          <p className="font-bold text-xs">{payload[0].value} Items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-enter pb-32 pt-4">
      <div className="space-y-6">
        <div className="apple-glass p-8 border-white/5">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest font-mono mb-1">Insights</div>
              <h3 className="text-xl font-bold italic text-white uppercase tracking-tighter">Status Metric</h3>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black italic">{total}</span>
              <div className="text-[8px] opacity-20 font-mono tracking-widest">LOGS</div>
            </div>
          </div>
          
          <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={95} 
                  paddingAngle={12} 
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white italic">{Math.round((doneCount / total) * 100)}%</span>
              <span className="text-[8px] text-white/20 uppercase tracking-widest font-mono">Completion</span>
            </div>
          </div>

          <div className="flex justify-between px-4 mt-8">
            {statusData.map(d => (
              <div key={d.name} className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white/20 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </div>
                <div className="text-sm font-bold text-white italic">{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="apple-glass p-8 border-white/5">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest font-mono mb-6">Load Distribution</div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} barSize={32}>
                <XAxis 
                  dataKey="name" 
                  stroke="none" 
                  fontSize={10} 
                  tickMargin={12}
                  fontFamily="JetBrains Mono"
                  tick={{ fill: THEME_COLORS.label }}
                />
                <YAxis hide />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                <Bar 
                  dataKey="minutes" 
                  fill={THEME_COLORS.iris} 
                  radius={[8, 8, 8, 8]}
                  className="transition-all duration-500"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
             <span className="text-[9px] font-black uppercase tracking-widest text-white/10 italic">Performance per Module Chapter</span>
          </div>
        </div>
      </div>
    </div>
  );
};