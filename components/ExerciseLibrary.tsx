
import React, { useState } from 'react';
import { Exercise, ExerciseCategory } from '../types';
import { Search, Info, Dumbbell, Activity, StretchHorizontal, Trophy, Play, Gauge, Sparkles, ChevronRight } from 'lucide-react';
import { getExerciseTips } from '../services/geminiService';

interface LibraryProps {
  exercises: Exercise[];
}

const ExerciseLibrary: React.FC<LibraryProps> = ({ exercises }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleExerciseClick = async (ex: Exercise) => {
    setSelectedExercise(ex);
    setAiTips(null);
    setLoadingTips(true);
    setPlaybackSpeed(1);
    const tips = await getExerciseTips(ex.name);
    setAiTips(tips);
    setLoadingTips(false);
  };

  const categories: (ExerciseCategory | 'All')[] = ['All', 'Strength', 'Cardio', 'Flexibility', 'Sports'];
  const speedOptions = [0.5, 1, 1.5, 2];

  return (
    <div className="p-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Neural Vault</h2>
          <p className="text-slate-400 font-medium tracking-wide">Access professional movement patterns & AI form coaching</p>
        </div>
        <div className="relative group w-full md:w-80">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden focus-within:border-blue-500/50 transition-all duration-300">
            <Search className="ml-4 text-slate-500" size={20} />
            <input 
              placeholder="Search movements..."
              className="w-full bg-transparent py-4 pl-3 pr-4 outline-none text-sm font-bold placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105 border border-blue-400' 
                : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((ex, idx) => (
          <button 
            key={ex.id}
            onClick={() => handleExerciseClick(ex)}
            style={{ animationDelay: `${idx * 50}ms` }}
            className="group relative flex items-center gap-5 p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] hover:border-blue-500/40 hover:bg-slate-800/60 transition-all duration-500 text-left overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
              {ex.category === 'Strength' && <Dumbbell size={28} className="group-hover:animate-bounce" />}
              {ex.category === 'Cardio' && <Activity size={28} className="group-hover:animate-pulse" />}
              {ex.category === 'Flexibility' && <StretchHorizontal size={28} />}
              {ex.category === 'Sports' && <Trophy size={28} />}
            </div>
            <div className="relative flex-1 min-w-0">
               <h4 className="font-black text-slate-100 text-lg tracking-tight group-hover:text-blue-400 transition-colors duration-300">{ex.name}</h4>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                 {ex.equipment} • {ex.difficulty}
               </p>
            </div>
            <div className="relative opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
              <ChevronRight size={20} className="text-blue-500" />
            </div>
          </button>
        ))}
      </div>

      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900/80 w-full max-w-3xl rounded-[3rem] border border-slate-800/50 shadow-[0_0_100px_rgba(59,130,246,0.1)] overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="p-10 border-b border-slate-800/50 bg-gradient-to-br from-slate-800/20 to-transparent relative">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                       {selectedExercise.difficulty} Protocol
                     </span>
                     <span className="px-4 py-1.5 bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-700">
                       {selectedExercise.category}
                     </span>
                   </div>
                   <h3 className="text-4xl font-black italic tracking-tight leading-none">{selectedExercise.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-10 space-y-10 overflow-y-auto max-h-[65vh] no-scrollbar">
               {/* Animated Demonstration Area */}
               <div className="relative group/demo">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 blur-3xl opacity-50 group-hover/demo:opacity-80 transition-opacity duration-1000" />
                  <div className="relative h-64 bg-slate-950/50 rounded-[2.5rem] border border-slate-800/50 flex items-center justify-center overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                       <div className="w-full h-full bg-[radial-gradient(#3b82f6_2px,transparent_2px)] [background-size:24px_24px]" />
                    </div>
                    
                    {/* Visual Movement Simulation */}
                    <div className="relative flex flex-col items-center">
                      <div 
                        className="w-24 h-24 rounded-[2rem] border-2 border-blue-500/30 bg-blue-500/5 flex items-center justify-center animate-pulse"
                        style={{ animationDuration: `${2 / playbackSpeed}s` }}
                      >
                        <Dumbbell 
                          className="text-blue-500 animate-bounce" 
                          size={48} 
                          style={{ animationDuration: `${1 / playbackSpeed}s` }}
                        />
                      </div>
                      <div className="mt-6 flex gap-2">
                         {[0.1, 0.2, 0.3].map(delay => (
                           <div 
                            key={delay}
                            className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" 
                            style={{ animationDuration: `${1 / playbackSpeed}s`, animationDelay: `${delay}s` }}
                           />
                         ))}
                      </div>
                      <p className="text-[10px] font-black text-blue-500/60 mt-4 uppercase tracking-[0.4em]">Movement Dynamics</p>
                    </div>

                    {/* Speed Integration */}
                    <div className="absolute bottom-6 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-700/50">
                      <Gauge size={14} className="text-slate-500 mx-2" />
                      {speedOptions.map(speed => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300 ${
                            playbackSpeed === speed 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>

                    {/* Biometric Mapping Tags */}
                    <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                      {selectedExercise.muscleGroups.map(mg => (
                        <div key={mg} className="flex items-center gap-2 group/tag">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300">{mg}</span>
                          <div className="w-1.5 h-6 bg-blue-500/40 rounded-full group-hover:bg-blue-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-800/20 p-6 rounded-[2rem] border border-slate-800/50 group/stat">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                      <Gauge size={12} className="text-blue-500" /> Equipment Required
                    </p>
                    <p className="font-black text-lg text-slate-100">{selectedExercise.equipment}</p>
                  </div>
                  <div className="bg-slate-800/20 p-6 rounded-[2rem] border border-slate-800/50 group/stat">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                      <Activity size={12} className="text-blue-500" /> Biometric Focus
                    </p>
                    <p className="font-black text-lg text-slate-100 truncate">{selectedExercise.muscleGroups.join(' / ')}</p>
                  </div>
               </div>

               <div className="space-y-6">
                 <h4 className="font-black text-xl tracking-tight flex items-center gap-3">
                   <Play size={20} className="text-blue-500" /> Execution Protocol
                 </h4>
                 <div className="space-y-4">
                   {selectedExercise.instructions.map((step, i) => (
                     <div key={i} className="flex gap-6 group/step">
                        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-400 flex items-center justify-center text-xs font-black group-hover/step:border-blue-500/50 group-hover/step:text-blue-400 transition-all duration-300">
                          {(i + 1).toString().padStart(2, '0')}
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed pt-2 font-medium opacity-80 group-hover/step:opacity-100 transition-opacity">{step}</p>
                     </div>
                   ))}
                 </div>
               </div>

               {/* AI Form Correction Section */}
               <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 p-8 rounded-[2.5rem]">
                 <div className="absolute -top-4 -right-4 text-blue-500 opacity-5">
                   <Sparkles size={120} />
                 </div>
                 <h4 className="font-black text-blue-400 mb-6 flex items-center gap-3 text-lg tracking-tight">
                   <Sparkles size={20} /> AI Movement Optimization
                 </h4>
                 {loadingTips ? (
                    <div className="flex flex-col gap-4">
                       <div className="h-3 w-full bg-blue-500/10 rounded-full animate-pulse" />
                       <div className="h-3 w-5/6 bg-blue-500/10 rounded-full animate-pulse [animation-delay:200ms]" />
                       <div className="h-3 w-4/6 bg-blue-500/10 rounded-full animate-pulse [animation-delay:400ms]" />
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                         {aiTips}
                       </div>
                       <div className="pt-4 border-t border-blue-500/10 flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase text-blue-500/60 tracking-[0.3em]">AI Verified Variations Included</span>
                       </div>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
