
import React, { useState } from 'react';
import { Goal } from '../types';
import { Plus, Trophy, Target as TargetIcon, Star, CheckCircle2, ChevronRight, Scale, Percent } from 'lucide-react';

interface GoalsProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

const GoalsView: React.FC<GoalsProps> = ({ goals, setGoals }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    targetValue: 0,
    currentValue: 0,
    unit: 'kg',
    type: 'Strength',
    deadline: new Date().toISOString().split('T')[0]
  });

  const handleAdd = () => {
    if (!newGoal.title || !newGoal.targetValue) return;
    const goal: Goal = {
      ...newGoal as Goal,
      id: Date.now().toString(),
    };
    setGoals([...goals, goal]);
    setShowAddGoal(false);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'Weight': return <Scale size={20} />;
      case 'Body Fat': return <Percent size={20} />;
      case 'Strength': return <Trophy size={20} />;
      default: return <Star size={20} />;
    }
  };

  return (
    <div className="p-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Milestones</h2>
          <p className="text-slate-400 font-medium tracking-wide">Define your peak performance protocol</p>
        </div>
        <button 
           onClick={() => setShowAddGoal(true)}
           className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-[2rem] font-black tracking-widest text-[10px] flex items-center gap-3 shadow-2xl shadow-blue-600/20 transition-all hover:scale-105"
        >
          <Plus size={20} /> INITIATE GOAL
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {goals.length === 0 ? (
          <div className="lg:col-span-2 py-32 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-500 space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5">
               <TargetIcon size={300} />
             </div>
             <div className="p-10 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 shadow-2xl relative z-10">
                <TargetIcon size={64} className="opacity-10 text-blue-500" />
             </div>
             <div className="text-center relative z-10">
                <p className="text-xl font-black text-slate-300">No active peak protocols</p>
                <p className="text-sm font-medium mt-2">Measurable goals are the engine of evolution.</p>
             </div>
          </div>
        ) : (
          goals.map(goal => {
            const isDescProgress = goal.type === 'Weight' || goal.type === 'Body Fat';
            const progress = isDescProgress 
              ? Math.max(0, Math.min(100, ( (goal.currentValue - goal.targetValue) / (goal.currentValue || 1) ) * 100))
              : Math.min((goal.currentValue / goal.targetValue) * 100, 100);
            
            return (
              <div key={goal.id} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-10 rounded-[3rem] hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                 <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-400 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                   {getGoalIcon(goal.type)}
                 </div>
                 
                 <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${progress >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-600/10 text-blue-400'}`}>
                          {progress >= 100 ? <CheckCircle2 size={24} /> : getGoalIcon(goal.type)}
                       </div>
                       <div>
                          <h4 className="font-black text-2xl tracking-tight leading-none mb-2">{goal.title}</h4>
                          <span className="px-3 py-1 bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-700">
                            {goal.type} Protocol
                          </span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Target Date</p>
                       <p className="text-sm font-black text-slate-300">{new Date(goal.deadline).toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Progress</p>
                          <p className="text-xl font-black text-blue-400">{goal.currentValue} <span className="text-xs uppercase opacity-60">{goal.unit}</span></p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</p>
                          <p className="text-xl font-black text-white">{goal.targetValue} <span className="text-xs uppercase opacity-60">{goal.unit}</span></p>
                       </div>
                    </div>
                    
                    <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner p-1">
                       <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${progress >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600'}`}
                          style={{ width: `${progress}%` }}
                       />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                            {progress >= 100 ? 'BIOMETRIC TARGET SECURED' : `EVOLUTION STATUS: ${progress.toFixed(0)}%`}
                          </span>
                       </div>
                       <button 
                         className="text-[10px] text-slate-600 hover:text-red-400 uppercase font-black tracking-widest transition-colors" 
                         onClick={() => setGoals(goals.filter(g => g.id !== goal.id))}
                       >
                         TERMINATE
                       </button>
                    </div>
                 </div>
              </div>
            );
          })
        )}
      </div>

      {showAddGoal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-slate-900/80 w-full max-w-lg rounded-[3rem] border border-slate-800/50 p-10 shadow-2xl animate-in zoom-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black italic tracking-tight">New Milestone</h3>
                <button onClick={() => setShowAddGoal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Protocol Designation</label>
                    <input 
                      placeholder="e.g., Target Body Weight 75kg"
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold"
                      onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Goal Category</label>
                        <select 
                          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold appearance-none"
                          onChange={e => setNewGoal({...newGoal, type: e.target.value as any})}
                        >
                           <option value="Strength">Strength</option>
                           <option value="Weight">Weight</option>
                           <option value="Body Fat">Body Fat</option>
                           <option value="Frequency">Frequency</option>
                           <option value="Duration">Duration</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Metric Unit</label>
                        <select 
                          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold appearance-none"
                          onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                        >
                           <option value="kg">kg</option>
                           <option value="%">%</option>
                           <option value="lbs">lbs</option>
                           <option value="km">km</option>
                           <option value="workouts">workouts</option>
                        </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Target Value</label>
                        <input 
                          type="number"
                          placeholder="0"
                          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold"
                          onChange={e => setNewGoal({...newGoal, targetValue: Number(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Deadline</label>
                        <input 
                          type="date"
                          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-slate-200"
                          onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                        />
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-10">
                 <button 
                   onClick={() => setShowAddGoal(false)} 
                   className="py-4 bg-slate-800 hover:bg-slate-700 rounded-[1.5rem] font-black tracking-widest text-[10px] transition-all"
                 >
                   CANCEL
                 </button>
                 <button 
                   onClick={handleAdd} 
                   className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black tracking-widest text-[10px] transition-all shadow-xl shadow-blue-600/20"
                 >
                   COMMENCE TRACKING
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GoalsView;
