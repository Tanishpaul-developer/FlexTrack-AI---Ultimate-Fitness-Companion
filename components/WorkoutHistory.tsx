
import React, { useState } from 'react';
import { WorkoutSession } from '../types';
import { Calendar as CalendarIcon, List, Clock, Weight, ChevronRight, FileDown, Trophy } from 'lucide-react';

interface HistoryProps {
  workouts: WorkoutSession[];
}

const WorkoutHistory: React.FC<HistoryProps> = ({ workouts = [] }) => {
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');

  const exportCSV = () => {
    const headers = ['Date', 'Session Name', 'Duration(min)', 'Exercises'];
    const rows = (workouts || []).map(w => [
      new Date(w.date).toLocaleDateString(),
      w.name,
      w.duration,
      (w.logs || []).map(l => l.exerciseName).join(', ')
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "flextrack_history.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-6 pb-24 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Timeline</h2>
          <p className="text-slate-400 font-medium mt-1">Tracing your physical evolution session by session</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={exportCSV}
             className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
             title="Export CSV"
          >
             <FileDown size={20} />
          </button>
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex shadow-inner">
             <button 
               onClick={() => setViewType('list')}
               className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-[10px] font-black tracking-widest ${viewType === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
               <List size={14} /> LIST
             </button>
             <button 
               onClick={() => setViewType('calendar')}
               className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-[10px] font-black tracking-widest ${viewType === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
               <CalendarIcon size={14} /> CALENDAR
             </button>
          </div>
        </div>
      </div>

      {viewType === 'list' ? (
        <div className="space-y-4">
          {(!workouts || workouts.length === 0) ? (
            <div className="py-32 flex flex-col items-center justify-center text-slate-500 space-y-6 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem]">
               <div className="p-10 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                  <Trophy size={60} className="opacity-10 text-blue-500" />
               </div>
               <div className="text-center">
                  <p className="text-xl font-black text-slate-300">The first rep is the hardest</p>
                  <p className="text-sm font-medium mt-2">Log your initial session to start your timeline.</p>
               </div>
            </div>
          ) : workouts.map((session, idx) => (
            <div 
              key={session.id} 
              style={{ animationDelay: `${idx * 100}ms` }}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-[2.5rem] hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-500 flex items-center justify-between group cursor-pointer animate-in fade-in slide-in-from-right-4"
            >
               <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-slate-800 rounded-[1.5rem] flex flex-col items-center justify-center border border-slate-700/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                     <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">
                       {new Date(session.date).toLocaleString('default', { month: 'short' })}
                     </span>
                     <span className="text-3xl font-black">
                       {new Date(session.date).getDate()}
                     </span>
                  </div>
                  <div>
                    <h4 className="font-black text-xl mb-2 tracking-tight">{session.name}</h4>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                       <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                         <Clock size={12} className="text-blue-500" /> {session.duration} MIN
                       </span>
                       <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                         <Weight size={12} className="text-blue-500" /> {(session.logs || []).length} MOVEMENTS
                       </span>
                    </div>
                  </div>
               </div>
               <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-600 group-hover:border-blue-500/50 group-hover:text-blue-500 transition-all duration-500">
                 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 p-20 rounded-[3rem] min-h-[500px] flex items-center justify-center text-slate-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <CalendarIcon size={300} />
          </div>
          <div className="text-center relative z-10">
             <div className="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                <CalendarIcon size={40} className="text-blue-500 animate-pulse" />
             </div>
             <p className="text-2xl font-black text-white italic">"Protocol 2.0: Spatiotemporal Awareness"</p>
             <p className="text-sm font-bold mt-4 uppercase tracking-[0.3em] text-slate-500">Temporal Mapping Integration Pending</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
