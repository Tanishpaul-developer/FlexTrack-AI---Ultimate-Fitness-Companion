
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutSession, UserStats, ViewState } from '../types';
// Added Trophy to the imports from lucide-react
import { Activity, Flame, Calendar, Dumbbell, Sparkles, ChevronRight, ListChecks, Heart, Brain, Trophy } from 'lucide-react';
// Fix: Import getNutritionTips instead of non-existent getHealthInsights
import { getMotivationalQuote, getNutritionTips } from '../services/geminiService';
import { EXERCISES } from '../constants';

interface DashboardProps {
  workouts: WorkoutSession[];
  stats: UserStats;
  setActiveView: (view: ViewState) => void;
  onViewPR: (id: string) => void;
}

const DashboardView: React.FC<DashboardProps> = ({ workouts = [], stats, setActiveView, onViewPR }) => {
  const [quote, setQuote] = useState<string>('Success doesn\'t start in the gym. It starts in your mind.');
  const [healthTips, setHealthTips] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    getMotivationalQuote(stats?.streak || 0).then(setQuote);
    if (stats?.profile) {
      setLoadingTips(true);
      // Fix: Call getNutritionTips which is the correct exported function
      getNutritionTips(stats.profile).then(tips => {
        setHealthTips(tips);
        setLoadingTips(false);
      });
    }
  }, [stats?.streak, stats?.profile]);

  const chartData = useMemo(() => {
    return (workouts || []).slice(0, 7).reverse().map(w => ({
      name: new Date(w.date).toLocaleDateString(undefined, { weekday: 'short' }),
      duration: w.duration,
      volume: (w.logs || []).reduce((acc, log) => acc + (log.sets || []).reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0), 0)
    }));
  }, [workouts]);

  const recentPRs = useMemo(() => {
    return Object.entries(stats?.personalRecords || {}).map(([id, weight]) => ({
      id,
      weight,
      name: EXERCISES.find(e => e.id === id)?.name || `Exercise #${id}`
    })).slice(0, 3);
  }, [stats?.personalRecords]);

  return (
    <div className="p-6 space-y-12 animate-in fade-in duration-1000">
      {/* Hero AI Section */}
      <div className="relative group rounded-[3rem] overflow-hidden p-10 bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-violet-600/10 opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform duration-1000">
          <Brain size={300} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/20">
                 <Sparkles size={18} className="text-blue-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/80">Neural Fitness Core</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black italic tracking-tight leading-tight">
              "{quote}"
            </h2>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setActiveView('log')}
                className="px-8 py-4 bg-white text-slate-950 font-black rounded-3xl shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all duration-300 tracking-widest text-xs"
              >
                START SESSION
              </button>
              <button 
                onClick={() => setActiveView('planner')}
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-xl border border-white/5 text-white font-black rounded-3xl hover:bg-slate-800 transition-all duration-300 tracking-widest text-xs"
              >
                AI PLANNER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Insight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] p-8 relative overflow-hidden">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black">AI Health Insights</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized for {stats?.profile?.bloodGroup || 'User'}</p>
              </div>
           </div>
           {loadingTips ? (
             <div className="space-y-4">
                <div className="h-4 w-3/4 bg-slate-800 rounded-full animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-800 rounded-full animate-pulse" />
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {healthTips.split('\n').filter(t => t.trim()).slice(0, 3).map((tip, i) => (
                  <div key={i} className="bg-slate-800/30 p-5 rounded-3xl border border-slate-700/30 group hover:border-blue-500/30 transition-all">
                     <p className="text-xs text-slate-300 font-medium leading-relaxed italic">"{tip.replace(/^\d+\.\s*/, '')}"</p>
                  </div>
                ))}
             </div>
           )}
        </div>

        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
           <Flame size={48} className="text-orange-500 mb-4 animate-pulse" />
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Consistency</p>
           <h4 className="text-5xl font-black text-white">{stats?.streak || 0}</h4>
           <p className="text-xs font-bold text-slate-500 mt-2">DAY STREAK</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-lg tracking-widest uppercase text-slate-400">Activity Evolution</h3>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Training Volume</span>
              </div>
            </div>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 8" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                    <Tooltip 
                      cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 900 }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                   <Activity size={40} className="mb-4 opacity-20" />
                   <p className="text-sm font-bold uppercase tracking-widest">Awaiting Neural Data</p>
                </div>
              )}
            </div>
          </div>

          {stats?.activePlan && (
            <div 
              className="group bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] relative overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all duration-500" 
              onClick={() => setActiveView('planner')}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <ListChecks size={20} className="text-blue-400" />
                     <h3 className="font-black text-xl tracking-tight">{stats.activePlan.routineName}</h3>
                   </div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active AI Protocol</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {(stats.activePlan.weeklySchedule || []).map((day, i) => (
                  <div key={i} className="flex-shrink-0 bg-slate-800/40 p-5 rounded-3xl border border-slate-700/30 min-w-[140px] group-hover:scale-105 transition-transform">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{day.day}</p>
                    <p className="text-xs font-bold truncate text-slate-200">{day.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-6">Personal Benchmarks</h3>
              <div className="space-y-4">
                 {recentPRs.length > 0 ? recentPRs.map((pr) => (
                    <button 
                      key={pr.id} 
                      onClick={() => onViewPR(pr.id)}
                      className="w-full flex justify-between items-center p-5 bg-slate-800/30 rounded-3xl border border-slate-700/30 hover:border-blue-500/50 hover:bg-slate-800 transition-all text-left group"
                    >
                       <span className="text-sm font-bold text-slate-200">{pr.name}</span>
                       <div className="flex items-center gap-3">
                         <span className="text-lg font-black text-blue-400">{pr.weight} <span className="text-[10px]">KG</span></span>
                         <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </button>
                 )) : (
                    <div className="p-8 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700/50">
                      <Trophy size={24} className="mx-auto text-slate-700 mb-2" />
                      <p className="text-[10px] font-black text-slate-600 uppercase">No PRs Registered</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-600/20 to-indigo-900/20 border border-blue-500/20 p-8 rounded-[3rem] text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform">
                <Trophy size={100} />
              </div>
              <h3 className="font-black text-xs uppercase tracking-widest text-blue-400 mb-6">Latest Badge</h3>
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-blue-500/40 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                🏆
              </div>
              <div className="mt-6">
                <p className="text-lg font-black tracking-tight">First Steps</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Neural account initiated</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
