
export interface HabitStats {
  waterCups: number;
  waterGoal: number;
  sleepHours: number;
  sleepGoal: number;
  exerciseMinutes: number;
  exerciseGoal: number;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  quitSmokingDate: string | null; // ISO Date string
  lastCigarette: string | null; // For relapse tracking
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  smokeHistory: string;
}

export enum HabitType {
  WATER = 'WATER',
  SLEEP = 'SLEEP',
  EXERCISE = 'EXERCISE',
  MEAL = 'MEAL',
  SMOKING = 'SMOKING'
}
