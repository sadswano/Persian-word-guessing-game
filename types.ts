
export interface Guess {
  word: string;
  rank: number; // 1 is exact match, higher is further away
  timestamp: number;
  isHint?: boolean;
}

export interface GameState {
  guesses: Guess[];
  lastPlayedDate: string; // YYYY-MM-DD
  isWon: boolean;
  isLost: boolean; // New state for running out of guesses
  targetWord: string; // The active secret word
  walletCredited: boolean; // To prevent double counting
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  totalGuesses: number;
  totalEarnings: number; // In Tomans
}

export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
  walletBalance: number;
}

export interface WordSimilarityResponse {
  rank: number;
  isWord: boolean;
}

export enum RankColor {
  Green = 'bg-emerald-100 text-emerald-900 border-emerald-200',
  Yellow = 'bg-amber-100 text-amber-900 border-amber-200',
  Gray = 'bg-slate-100 text-slate-700 border-slate-200',
}
