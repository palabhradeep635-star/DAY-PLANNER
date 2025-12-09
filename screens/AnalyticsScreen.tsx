import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { PHASES } from '../types';
import { GlassCard } from '../components/ui/GlassCard';

export const AnalyticsScreen: React.FC = () => {
  const { tasks } = useApp();
  
  // Calculate stats
  const total = tasks.length || 1; // Avoid divide by zero
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const inProgressCount = tasks.filter(t => t.status === 'In progress').length;
  const todoCount = tasks.filter(t => t.status === 'Not started').length;

  const statusData = [
    { name: 'Completed', value: doneCount, color: 'var(--theme-primary)' }, 
    { name: 'In Progress', value: inProgressCount, color: '#fbbf24' }, // Amber
    { name: 'To Do', value: todoCount, color: '#64748b' }, // Slate
  ].filter(d => d.value > 0);

  const timeData = Object.keys(PHASES).map(phaseKey => {
    const phaseTasks = tasks.filter(t => t.phase === phaseKey);
    return {
      name: phaseKey,
      actual: Math.round(phaseTasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0) / 60 * 10) / 10
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-lg shadow-xl text-xs text-white">
          <p className="font-semibold">{data.name}</p>
          <p>{data.value} tasks ({Math.round((data.value / total) * 100)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-enter pb-32">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-8 pt-2">Analytics</h1>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <GlassCard className="!p-6">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            Task Distribution
            <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">{total} total</span>
          </h3>
          
          <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={85} 
                  paddingAngle={6} 
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                >
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round((doneCount / total) * 100)}%</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Done</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-6">
            {statusData.map(d => (
              <div key={d.name} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {Math.round((d.value / total) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="!p-6">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Study Hours</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} barSize={32}>
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10}
                />
                <YAxis hide />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="actual" 
                  fill="var(--theme-primary)" 
                  radius={[6, 6, 6, 6]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
