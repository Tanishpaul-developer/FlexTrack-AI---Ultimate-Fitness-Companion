
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, WorkoutSession, UserStats, Goal, WeeklyPlan, UserProfile, AppNotification } from './types';
import { NAV_ITEMS, EXERCISES } from './constants';
import DashboardView from './components/DashboardView';
import WorkoutLogger from './components/WorkoutLogger';
import ExerciseLibrary from './components/ExerciseLibrary';
import WorkoutHistory from './components/WorkoutHistory';
import GoalsView from './components/GoalsView';
import WorkoutPlanner from './components/WorkoutPlanner';
import PRDetailsView from './components/PRDetailsView';
import ProfileView from './components/ProfileView';
import { Sidebar } from './components/Navigation';
import { Smartphone, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const DEFAULT_STATS: UserStats = {
  profile: {
    name: 'New User',
    age: 28,
    weight: 75,
    height: 180,
    bodyFatPercentage: 18,
    bloodGroup: 'O+',
    gender: 'Other',
    activityLevel: 'Moderate'
  },
  weightHistory: [{ date: new Date().toISOString().split('T')[0], value: 75 }],
  personalRecords: {},
  prHistory: {},
  streak: 0,
  totalWorkouts: 0,
  badges: ['first_workout'],
  healthSyncEnabled: false
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [selectedPRId, setSelectedPRId] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('flextrack_workouts_v2');
    const savedStats = localStorage.getItem('flextrack_stats_v2');
    const savedGoals = localStorage.getItem('flextrack_goals_v2');
    
    try {
      if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
      if (savedStats) setStats(prev => ({ ...DEFAULT_STATS, ...JSON.parse(savedStats) }));
      if (savedGoals) setGoals(JSON.parse(savedGoals));
    } catch (e) {
      addNotification("Failed to load your local data. Starting fresh.", "error");
    }
  }, [addNotification]);

  useEffect(() => {
    localStorage.setItem('flextrack_workouts_v2', JSON.stringify(workouts));
    localStorage.setItem('flextrack_stats_v2', JSON.stringify(stats));
    localStorage.setItem('flextrack_goals_v2', JSON.stringify(goals));
  }, [workouts, stats, goals]);

  const addWorkout = (session: WorkoutSession) => {
    setWorkouts(prev => [session, ...prev]);
    const newPRs = { ...stats.personalRecords };
    const newPRHistory = { ...stats.prHistory };
    
    session.logs.forEach(log => {
      const maxWeight = Math.max(...(log.sets?.map(s => s.weight) || [0]));
      if (maxWeight > 0) {
        if (!newPRs[log.exerciseId] || maxWeight > newPRs[log.exerciseId]) {
          newPRs[log.exerciseId] = maxWeight;
          addNotification(`New Personal Record: ${log.exerciseName}!`, "success");
        }
        if (!newPRHistory[log.exerciseId]) newPRHistory[log.exerciseId] = [];
        newPRHistory[log.exerciseId].push({ date: session.date, weight: maxWeight });
      }
    });
    
    setStats(prev => ({
      ...prev,
      personalRecords: newPRs,
      prHistory: newPRHistory,
      totalWorkouts: prev.totalWorkouts + 1,
      streak: prev.streak + 1
    }));
    setActiveView('dashboard');
    addNotification("Workout saved successfully!", "success");
  };

  const handleProfileUpdate = (profile: UserProfile, healthSyncEnabled?: boolean) => {
    setStats(prev => ({ 
      ...prev, 
      profile, 
      healthSyncEnabled: healthSyncEnabled !== undefined ? healthSyncEnabled : prev.healthSyncEnabled 
    }));
    addNotification("Profile evolved.", "success");
  };

  const handleImport = (data: any) => {
    try {
      if (data.workouts) setWorkouts(data.workouts);
      if (data.stats) setStats(data.stats);
      if (data.goals) setGoals(data.goals);
      addNotification("Data imported successfully!", "success");
    } catch (e) {
      addNotification("Invalid backup file.", "error");
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView workouts={workouts} stats={stats} setActiveView={setActiveView} onViewPR={(id) => { setSelectedPRId(id); setActiveView('pr-details'); }} />;
      case 'log':
        return <WorkoutLogger onSave={addWorkout} exercises={EXERCISES} />;
      case 'library':
        return <ExerciseLibrary exercises={EXERCISES} />;
      case 'history':
        return <WorkoutHistory workouts={workouts} />;
      case 'goals':
        return <GoalsView goals={goals} setGoals={setGoals} />;
      case 'planner':
        return <WorkoutPlanner onSavePlan={(p) => { setStats(s => ({...s, activePlan: p})); setActiveView('dashboard'); addNotification("Routine activated!", "success"); }} profile={stats.profile} />;
      case 'profile':
        return <ProfileView profile={stats.profile} healthSyncEnabled={stats.healthSyncEnabled} onUpdate={handleProfileUpdate} stats={stats} workouts={workouts} goals={goals} onImport={handleImport} />;
      case 'pr-details':
        return <PRDetailsView exerciseId={selectedPRId} history={stats.prHistory?.[selectedPRId || ''] || []} onBack={() => setActiveView('dashboard')} />;
      default:
        return <DashboardView workouts={workouts} stats={stats} setActiveView={setActiveView} onViewPR={(id) => { setSelectedPRId(id); setActiveView('pr-details'); }} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-blue-500/30">
      <Sidebar activeView={activeView} setActiveView={setActiveView} profileName={stats.profile.name} avatarUrl={stats.profile.avatarUrl} />
      
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 scroll-smooth focus:outline-none" tabIndex={-1}>
        <header className="p-6 border-b border-slate-800/50 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-xl z-20">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              FlexTrack AI
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Neural Fitness System</p>
          </div>
          <button 
            onClick={() => setActiveView('profile')}
            className="group flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 pr-4 rounded-full hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
              {stats.profile.avatarUrl ? <img src={stats.profile.avatarUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-xs font-black">{stats.profile.name[0]}</span>}
            </div>
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">{stats.profile.name}</span>
          </button>
        </header>
        
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Notifications Portal */}
      <div className="fixed top-24 right-6 z-[60] flex flex-col gap-3">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-center gap-4 px-5 py-4 rounded-2xl border backdrop-blur-xl animate-in slide-in-from-right duration-300 shadow-2xl ${
            n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            n.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
            'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}>
            {n.type === 'success' && <CheckCircle size={18} />}
            {n.type === 'error' && <AlertCircle size={18} />}
            {n.type === 'info' && <Info size={18} />}
            <span className="text-xs font-bold tracking-wide">{n.message}</span>
          </div>
        ))}
      </div>

      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-2xl border border-slate-800/50 rounded-3xl flex justify-around p-4 z-30 shadow-2xl">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${activeView === item.id ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
          >
            {item.icon}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
