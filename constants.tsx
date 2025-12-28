
import React from 'react';
import { Dumbbell, Activity, StretchHorizontal, Trophy, Calendar, LayoutDashboard, List, Target, User } from 'lucide-react';
import { Exercise } from './types';

export const EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    category: 'Strength',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: ['Lie on the bench', 'Grip bar shoulder-width', 'Lower to chest', 'Push up']
  },
  {
    id: '2',
    name: 'Squat',
    category: 'Strength',
    muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: ['Feet shoulder-width apart', 'Bar across upper back', 'Lower hips', 'Stand back up']
  },
  {
    id: '3',
    name: 'Deadlift',
    category: 'Strength',
    muscleGroups: ['Back', 'Glutes', 'Hamstrings'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: ['Feet hip-width', 'Bend at hips', 'Grip bar', 'Lift using legs and back']
  },
  {
    id: '4',
    name: 'Running',
    category: 'Cardio',
    muscleGroups: ['Legs', 'Heart'],
    equipment: 'None',
    difficulty: 'Beginner',
    instructions: ['Maintain steady pace', 'Focus on breathing', 'Good posture']
  },
  {
    id: '5',
    name: 'Yoga Flow',
    category: 'Flexibility',
    muscleGroups: ['Full Body'],
    equipment: 'Yoga Mat',
    difficulty: 'Beginner',
    instructions: ['Flow through poses', 'Deep breathing', 'Hold stretches']
  }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
  { id: 'log', label: 'Workout', icon: <Dumbbell size={20} /> },
  { id: 'history', label: 'History', icon: <Calendar size={20} /> },
  { id: 'library', label: 'Exercises', icon: <List size={20} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={20} /> },
  { id: 'profile', label: 'Profile', icon: <User size={20} /> },
] as const;

export const BADGES = [
  { id: 'first_workout', name: 'First Steps', description: 'Completed your first workout', icon: <Trophy className="text-blue-400" /> },
  { id: 'streak_3', name: 'Consistent', description: '3-day workout streak', icon: <Activity className="text-green-400" /> },
  { id: 'heavy_hitter', name: 'Heavy Hitter', description: 'Bench pressed 100kg+', icon: <Dumbbell className="text-purple-400" /> },
];
