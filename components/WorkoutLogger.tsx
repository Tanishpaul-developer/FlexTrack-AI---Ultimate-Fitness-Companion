
import React, { useState, useEffect, useCallback } from 'react';
import { WorkoutSession, WorkoutLog, Exercise, Set } from '../types';
import { Plus, Trash2, CheckCircle, Clock, Save, ChevronLeft, Timer, StickyNote } from 'lucide-react';

interface WorkoutLoggerProps {
  exercises: Exercise[];
  onSave: (session: WorkoutSession) => void;
}

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ exercises, onSave }) => {
  const [sessionName, setSessionName] = useState(`Training Session - ${new Date().toLocaleDateString()}`);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && restTimer > 0) {
      interval = setInterval(() => setRestTimer(prev => prev - 1), 1000);
    } else if (restTimer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restTimer]);

  const addExercise = (ex: Exercise) => {
    const newLog: WorkoutLog = {
      id: Math.random().toString(36).substr(2, 9),
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: [{ id: '1', weight: 0, reps: 0, completed: false }],
      notes: ''
    };
    setLogs([...logs, newLog]);
    setShowExercisePicker(false);
  };

  const updateSet = (logId: string, setId: string, updates: Partial<Set>) => {
    setLogs(prev => prev.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          sets: log.sets.map(s => {
            if (s.id === setId) {
              if (updates.completed && !s.completed) {
                setRestTimer(90);
                setIsTimerRunning(true);
              }
              return { ...s, ...updates };
            }
            return s;
          })
        };
      }
      return log;
    }));
  };

  const handleSave = () => {
    if (logs.length === 0) return;
    onSave({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: sessionName,
      logs,
      notes: '',
      duration: Math.floor(sessionDuration / 60)
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-40 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
           <input 
             value={sessionName}
             onChange={(e) => setSessionName(e.target.value)}
             className="bg-transparent text-3xl font-black text-white outline-none border-b-2 border-transparent focus:border-blue-500 w-full"
           />
           <div className="flex items-center gap-3 mt-2 text-blue-400 font-black text-sm uppercase tracking-widest">
             <Clock size={14} />
             <span>T+ {formatTime(sessionDuration)}</span>
           </div>
        </div>
        <button 
          onClick={handleSave}
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
        >
          <Save size={18} />
          END SESSION
        </button>
      </div>

      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] overflow-hidden group">
            <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-800/10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <CheckCircle size={20} />
                  </div>
                  <h3 className="font-black text-xl tracking-tight">{log.exerciseName}</h3>
               </div>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setActiveNoteId(activeNoteId === log.id ? null : log.id)}
                   className={`p-3 rounded-xl transition-all ${log.notes ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   <StickyNote size={18} />
                 </button>
                 <button 
                   onClick={() => setLogs(logs.filter(l => l.id !== log.id))}
                   className="p-3 text-slate-600 hover:text-rose-500 transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
            </div>
            
            {activeNoteId === log.id && (
              <div className="p-6 bg-slate-900 border-b border-slate-800">
                <textarea 
                  value={log.notes}
                  onChange={(e) => setLogs(prev => prev.map(l => l.id === log.id ? {...l, notes: e.target.value} : l))}
                  placeholder="Focus points, muscle feel, or equipment adjustments..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 outline-none focus:border-blue-500/50 min-h-[100px] resize-none"
                />
              </div>
            )}

            <div className="p-8 space-y-4">
               <div className="grid grid-cols-4 text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] px-2 mb-2">
                 <span>SET</span>
                 <span>KG</span>
                 <span>REPS</span>
                 <span className="text-right">STAT</span>
               </div>

               {log.sets.map((set, idx) => (
                 <div key={set.id} className={`grid grid-cols-4 items-center gap-4 p-3 rounded-2xl transition-all ${set.completed ? 'bg-emerald-500/5' : 'bg-slate-800/20 hover:bg-slate-800/40'}`}>
                   <span className="text-xs font-black text-slate-500 ml-2">{idx + 1}</span>
                   <input 
                     type="number"
                     value={set.weight || ''}
                     onChange={(e) => updateSet(log.id, set.id, { weight: Number(e.target.value) })}
                     className="bg-slate-950 border border-slate-700/50 rounded-xl py-3 px-1 text-center font-black outline-none focus:ring-2 focus:ring-blue-500/30"
                     placeholder="-"
                   />
                   <input 
                     type="number"
                     value={set.reps || ''}
                     onChange={(e) => updateSet(log.id, set.id, { reps: Number(e.target.value) })}
                     className="bg-slate-950 border border-slate-700/50 rounded-xl py-3 px-1 text-center font-black outline-none focus:ring-2 focus:ring-blue-500/30"
                     placeholder="-"
                   />
                   <div className="flex justify-end">
                     <button 
                       onClick={() => updateSet(log.id, set.id, { completed: !set.completed })}
                       className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${set.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-2 border-slate-700 text-slate-700 hover:border-slate-500'}`}
                     >
                       <CheckCircle size={18} />
                     </button>
                   </div>
                 </div>
               ))}

               <button 
                 onClick={() => setLogs(prev => prev.map(l => l.id === log.id ? {...l, sets: [...l.sets, { id: Date.now().toString(), weight: l.sets[l.sets.length-1]?.weight || 0, reps: l.sets[l.sets.length-1]?.reps || 0, completed: false }]} : l))}
                 className="w-full py-4 bg-slate-800/30 hover:bg-slate-800/50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-800 border-dashed transition-all"
               >
                 <Plus size={14} /> NEW SET
               </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => setShowExercisePicker(true)}
          className="w-full py-16 border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-500 hover:border-blue-500/30 hover:text-blue-400 transition-all flex flex-col items-center justify-center gap-4 group bg-slate-900/10"
        >
          <div className="p-6 bg-slate-900/50 rounded-full group-hover:scale-110 transition-transform shadow-xl">
             <Plus size={32} />
          </div>
          <span className="font-black uppercase tracking-[0.3em] text-[10px]">Deploy Movement</span>
        </button>
      </div>

      {showExercisePicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <h3 className="text-2xl font-black italic tracking-tight">Select Movement</h3>
              <button onClick={() => setShowExercisePicker(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-6 space-y-3 no-scrollbar">
               {exercises.map(ex => (
                 <button 
                   key={ex.id}
                   onClick={() => addExercise(ex)}
                   className="w-full text-left p-6 rounded-[1.5rem] bg-slate-800/40 hover:bg-blue-600/10 border border-slate-700/50 hover:border-blue-500/30 transition-all flex justify-between items-center group"
                 >
                   <div>
                     <p className="font-black text-white group-hover:text-blue-400 transition-colors">{ex.name}</p>
                     <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{ex.category} • {ex.equipment}</p>
                   </div>
                   <Plus size={18} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}

      {restTimer > 0 && (
        <div className="fixed bottom-24 sm:bottom-12 right-6 sm:right-12 z-50">
           <div className="bg-blue-600 px-8 py-5 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.4)] flex items-center gap-6 text-white border-2 border-blue-400/30 animate-in slide-in-from-bottom duration-500">
             <div className="relative">
                <Timer size={28} className="animate-pulse" />
                <div className="absolute inset-0 bg-white blur-xl opacity-20" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-black text-blue-100 tracking-widest mb-1">RECOVERY</p>
                <p className="text-2xl font-black font-mono">{formatTime(restTimer)}</p>
             </div>
             <button onClick={() => setRestTimer(0)} className="ml-4 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors font-black text-[10px] uppercase tracking-widest">
                SKIP
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLogger;
