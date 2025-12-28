
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, UserStats, WorkoutSession, Goal } from '../types';
import { User, Weight, Ruler, Droplets, Activity, Save, ArrowRight, Smartphone, Sparkles, Loader2, Apple, Camera, Download, Upload, Trash2, Brain, X, RefreshCw } from 'lucide-react';
import { getNutritionTips, generateAvatar } from '../services/geminiService';

interface ProfileProps {
  profile: UserProfile;
  healthSyncEnabled: boolean;
  onUpdate: (profile: UserProfile, healthSyncEnabled?: boolean) => void;
  stats: UserStats;
  workouts: WorkoutSession[];
  goals: Goal[];
  onImport: (data: any) => void;
}

const ProfileView: React.FC<ProfileProps> = ({ profile, healthSyncEnabled, onUpdate, stats, workouts, goals, onImport }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isHealthSyncOn, setIsHealthSyncOn] = useState(healthSyncEnabled);
  const [nutritionTips, setNutritionTips] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState(false);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  
  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchNutritionTips();
  }, [profile.activityLevel, profile.weight, profile.age]);

  const fetchNutritionTips = async () => {
    setLoadingTips(true);
    try {
      const tips = await getNutritionTips(profile);
      setNutritionTips(tips);
    } catch (e) {
      setNutritionTips("• Focus on high-quality protein (1.6g/kg).\n• Stay hydrated (3L+ daily).\n• Prioritize consistent sleep for recovery.");
    }
    setLoadingTips(false);
  };

  const biometrics = useMemo(() => {
    const { weight, height, age, gender } = formData;
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'Male' ? bmr + 5 : bmr - 161;
    const multi = { 'Sedentary': 1.2, 'Light': 1.375, 'Moderate': 1.55, 'Active': 1.725, 'Very Active': 1.9 }[formData.activityLevel] || 1.2;
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(bmr * multi)
    };
  }, [formData]);

  const handleExport = () => {
    const data = { workouts, stats, goals, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flextrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const triggerImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const json = JSON.parse(re.target?.result as string);
          onImport(json);
        } catch (err) {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleGenerateAvatar = async () => {
    setGeneratingAvatar(true);
    const avatar = await generateAvatar(formData);
    if (avatar) setFormData({ ...formData, avatarUrl: avatar });
    setGeneratingAvatar(false);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photo = canvasRef.current.toDataURL('image/png');
        setFormData({ ...formData, avatarUrl: photo });
        stopCamera();
      }
    }
  };

  const handleHealthSyncToggle = () => {
    const nextState = !isHealthSyncOn;
    setIsHealthSyncOn(nextState);
    if (nextState) {
      // Simulate HealthKit sync initialization
      alert("Initializing Apple Health sync. Permissions requested on device.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="w-full lg:w-1/3 flex flex-col items-center text-center space-y-8 sticky top-24">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-violet-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-64 h-64 rounded-[4rem] bg-slate-900 border-2 border-slate-800 flex items-center justify-center overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.1)] group">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="User Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <span className="text-8xl font-black text-slate-800 select-none">{formData.name[0]}</span>
              )}
              
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                 <button 
                  onClick={handleGenerateAvatar} 
                  disabled={generatingAvatar} 
                  className="p-4 bg-blue-600 hover:bg-blue-500 rounded-3xl shadow-xl active:scale-90 transition-all disabled:opacity-50"
                  title="Generate AI Avatar"
                 >
                   {generatingAvatar ? <Loader2 className="animate-spin text-white" size={24} /> : <Sparkles className="text-white" size={24} />}
                 </button>
                 <button 
                  onClick={startCamera}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-3xl shadow-xl active:scale-90 transition-all"
                  title="Take Photo"
                 >
                   <Camera className="text-white" size={24} />
                 </button>
              </div>
            </div>
          </div>
          
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-white mb-1">{formData.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Neural Athlete Status</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] text-left hover:border-blue-500/20 transition-colors">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 flex items-center gap-2">
                    <Brain size={12} className="text-blue-500" /> BMR
                  </p>
                  <p className="text-2xl font-black text-white">{biometrics.bmr} <span className="text-[10px] text-slate-500">kcal</span></p>
               </div>
               <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] text-left hover:border-emerald-500/20 transition-colors">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 flex items-center gap-2">
                    <Activity size={12} className="text-emerald-500" /> TDEE
                  </p>
                  <p className="text-2xl font-black text-white">{biometrics.tdee} <span className="text-[10px] text-slate-500">kcal</span></p>
               </div>
            </div>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl transition-colors ${isHealthSyncOn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                   <Smartphone size={20} />
                 </div>
                 <div className="text-left">
                    <p className="text-xs font-black text-slate-200">Apple Health</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{isHealthSyncOn ? 'CONNECTED' : 'DISCONNECTED'}</p>
                 </div>
              </div>
              <button 
                onClick={handleHealthSyncToggle}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-500 flex items-center ${isHealthSyncOn ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                 <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${isHealthSyncOn ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex gap-4">
              <button onClick={handleExport} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest transition-all">
                <Download size={14} className="text-slate-400" /> BACKUP
              </button>
              <button onClick={triggerImport} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest transition-all">
                <Upload size={14} className="text-slate-400" /> RESTORE
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Bio Form */}
        <div className="flex-1 space-y-8">
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-[3.5rem] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-blue-500 pointer-events-none">
              <Activity size={200} />
            </div>
            
            <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-white">
              <User size={24} className="text-blue-500" /> Evolutionary Profile
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); onUpdate(formData, isHealthSyncOn); }} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">Name Designation</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-lg" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Gender Identity</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold appearance-none text-lg">
                    {['Male', 'Female', 'Non-binary', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-lg" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Weight (kg)</label>
                  <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-lg" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Height (cm)</label>
                  <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-lg" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Body Fat %</label>
                  <input type="number" value={formData.bodyFatPercentage} onChange={e => setFormData({...formData, bodyFatPercentage: Number(e.target.value)})} className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-bold text-lg" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Training Intensity Level</label>
                <div className="flex flex-wrap gap-3">
                  {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map(level => (
                    <button 
                      key={level} 
                      type="button" 
                      onClick={() => setFormData({...formData, activityLevel: level})} 
                      className={`px-8 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all ${formData.activityLevel === level ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105 border border-blue-400' : 'bg-slate-800/40 text-slate-500 border border-slate-700/50 hover:bg-slate-800'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nutrition Insight Section */}
              <div className="bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/20 rounded-[3rem] p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-blue-500 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Apple size={140} />
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="font-black text-blue-400 flex items-center gap-3 tracking-tight text-lg">
                    <Sparkles size={20} /> AI Nutrition Synthesis
                  </h4>
                  <button 
                    type="button" 
                    onClick={fetchNutritionTips} 
                    disabled={loadingTips} 
                    className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-2xl transition-all"
                  >
                    {loadingTips ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {loadingTips ? [1,2,3].map(i => <div key={i} className="h-32 bg-slate-800/40 rounded-[2rem] animate-pulse" />) : nutritionTips.split('\n').filter(t => t.trim()).slice(0, 3).map((tip, i) => (
                    <div key={i} className="bg-slate-900/60 p-6 rounded-[2rem] border border-blue-500/10 hover:border-blue-500/30 transition-all flex flex-col items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-black">{i+1}</div>
                      <p className="text-[12px] text-slate-300 font-medium leading-relaxed italic">{tip.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-7 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-[2.5rem] font-black tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.98] text-xs">
                <Save size={20} /> COMMIT NEURAL UPDATES
                <ArrowRight size={18} className="opacity-50" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-xl rounded-[4rem] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <h3 className="text-2xl font-black italic tracking-tight">Lens Capture</h3>
              <button onClick={stopCamera} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-2xl"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-8 flex flex-col items-center">
              <div className="relative w-full aspect-square rounded-[3rem] bg-black overflow-hidden border-2 border-slate-800">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-900/40 rounded-[3rem]" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button 
                onClick={capturePhoto} 
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-90 transition-all border-8 border-slate-800"
              >
                <div className="w-14 h-14 rounded-full border-2 border-slate-950" />
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tap to capture biomechanical frame</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
