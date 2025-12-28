
export type ExerciseCategory = 'Strength' | 'Cardio' | 'Flexibility' | 'Sports' | 'Bodyweight';

export interface Set {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: Set[];
  notes?: string;
  duration?: number;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  logs: WorkoutLog[];
  notes: string;
  duration: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  instructions: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  type: 'Weight' | 'Strength' | 'Frequency' | 'Duration' | 'Body Fat';
}

export interface PRHistoryPoint {
  date: string;
  weight: number;
}

export interface WeeklyPlan {
  routineName: string;
  weeklySchedule: {
    day: string;
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      tips: string;
    }[];
  }[];
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  bodyFatPercentage: number;
  bloodGroup: string;
  gender: string;
  activityLevel: string;
  avatarUrl?: string;
}

export interface UserStats {
  profile: UserProfile;
  weightHistory: { date: string; value: number }[];
  personalRecords: Record<string, number>;
  prHistory: Record<string, PRHistoryPoint[]>;
  streak: number;
  totalWorkouts: number;
  badges: string[];
  activePlan?: WeeklyPlan;
  healthSyncEnabled: boolean;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ViewState = 'dashboard' | 'library' | 'log' | 'history' | 'goals' | 'planner' | 'pr-details' | 'profile';
