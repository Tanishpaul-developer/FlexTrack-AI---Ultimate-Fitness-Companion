
import React, { useState } from 'react';
import { WeeklyPlan, UserProfile } from '../types';
import { generateWorkoutRoutine } from '../services/geminiService';
import { Sparkles, Loader2, Check, Dumbbell, Activity, Target } from 'lucide-react';

interface PlannerProps {
  onSavePlan: (plan: WeeklyPlan) => void;
  profile: UserProfile;
}

const WorkoutPlanner: React.FC<PlannerProps> = ({ onSavePlan, profile }) => {
  const [goal, setGoal] = useState('muscle gain');
  const [experience, setExperience] = useState('Beginner');
  const [equipment, setEquipment] = useState('dumbbells and resistance bands');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyPlan | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const plan = await generateWorkoutRoutine(goal, experience, equipment, profile);
    if (plan) setGeneratedPlan(plan);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight">AI Planner</h2>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Synthesizing personalized training protocols</p>
        </div>
        <div className="w-16 h-16 bg-blue-600/10 rounded-[1.5rem] border border-blue-500/20 flex items-center justify-center">
          <Sparkles className="text-blue-400" size={32} />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Activity size={200} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Target size={12} className="text-blue-400" /> Training Goal
            </label>
            <input 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold"
              placeholder="e.g., Fat loss, Muscle gain"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} className="text-blue-400" /> Experience Level
            </label>
            <select 
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold appearance-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Dumbbell size={12} className="text-blue-400" /> Equipment
            </label>
            <input 
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold"
              placeholder="e.g., Dumbbells, Bands, Gym"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full mt-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98] rounded-[2rem] font-black tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
          {loading ? 'CALCULATING BIOMETRICS...' : 'GENERATE AI PROTOCOL'}
        </button>
      </div>

      {generatedPlan && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-1000">
          <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800/50">
             <h3 className="text-2xl font-black italic tracking-tight">{generatedPlan.routineName}</h3>
             <button 
               onClick={() => onSavePlan(generatedPlan)}
               className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-lg shadow-emerald-600/20"
             >
               <Check size={18} /> ACTIVATE PLAN
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(generatedPlan.weeklySchedule || []).map((day, i) => (
              <div key={i} className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-4xl font-black group-hover:rotate-12 transition-transform">{day.day.charAt(0)}</div>
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                    {day.day}
                  </span>
                  <span className="text-sm font-black text-slate-200">{day.focus}</span>
                </div>
                <div className="space-y-5">
                  {(day.exercises || []).map((ex, j) => (
                    <div key={j} className="bg-slate-800/30 p-5 rounded-3xl border border-slate-700/20 relative group/ex">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-100">{ex.name}</p>
                        <p className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-lg">{ex.sets}x{ex.reps}</p>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed italic opacity-80 group-hover/ex:opacity-100 transition-opacity">
                        {ex.tips}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanner;
