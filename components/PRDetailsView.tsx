
import React from 'react';
import { PRHistoryPoint } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, TrendingUp, Calendar } from 'lucide-react';
import { EXERCISES } from '../constants';

interface PRDetailsProps {
  exerciseId: string | null;
  history: PRHistoryPoint[];
  onBack: () => void;
}

const PRDetailsView: React.FC<PRDetailsProps> = ({ exerciseId, history, onBack }) => {
  const exercise = EXERCISES.find(e => e.id === exerciseId);
  
  const chartData = history.map(p => ({
    date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: p.weight
  }));

  const maxPR = Math.max(...history.map(p => p.weight), 0);
  const startPR = history.length > 0 ? history[0].weight : 0;
  const gain = maxPR - startPR;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
         <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-slate-800">
           <ChevronLeft size={20} />
         </div>
         <span className="font-bold text-sm uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-bold">{exercise?.name || 'Exercise Details'}</h2>
          <p className="text-slate-400 mt-2">Historical Strength Progression</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl min-w-[120px]">
             <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Current Max</p>
             <p className="text-2xl font-bold text-blue-400">{maxPR} kg</p>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl min-w-[120px]">
             <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Gain</p>
             <p className="text-2xl font-bold text-emerald-400">+{gain} kg</p>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <TrendingUp size={240} />
        </div>
        
        <div className="h-[400px] w-full relative z-10">
          {history.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  unit="kg"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
               <Calendar size={64} className="opacity-10" />
               <p className="text-lg">Keep training to see your history grow</p>
               <p className="text-sm italic">At least 2 PR sessions required for charting</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
             <TrendingUp size={18} className="text-blue-400" /> Improvement Insights
           </h3>
           <p className="text-slate-300 text-sm leading-relaxed">
             You have increased your {exercise?.name} by <span className="text-blue-400 font-bold">{gain}kg</span> since your first recorded session. 
             This represents a <span className="text-emerald-400 font-bold">{((gain / (startPR || 1)) * 100).toFixed(1)}%</span> increase in strength.
           </p>
         </div>
         <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
             <Calendar size={18} className="text-blue-400" /> Session Breakdown
           </h3>
           <div className="space-y-2">
             {history.slice().reverse().map((entry, i) => (
               <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-slate-800 last:border-0">
                 <span className="text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>
                 <span className="font-bold">{entry.weight} kg</span>
               </div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
};

export default PRDetailsView;
