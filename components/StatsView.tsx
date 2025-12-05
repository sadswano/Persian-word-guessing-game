
import React from 'react';
import { PlayerStats } from '../types';

interface StatsViewProps {
  stats: PlayerStats;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;
  
  const averageGuesses = stats.gamesWon > 0 
    ? (stats.totalGuesses / stats.gamesWon).toFixed(1) 
    : '-';

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="تعداد بازی" value={stats.gamesPlayed} />
        <StatBox label="برد %" value={`${winRate}%`} />
        <StatBox label="برد متوالی" value={stats.currentStreak} />
        <StatBox label="میانگین حدس" value={averageGuesses} />
      </div>
      
      {stats.gamesPlayed === 0 && (
        <p className="text-center text-xs text-slate-400 mt-4">
          هنوز بازی‌ای انجام نشده است. شروع کنید!
        </p>
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm">
    <span className="text-2xl font-black text-teal-700 font-sans">{value}</span>
    <span className="text-xs text-slate-400 font-bold mt-1">{label}</span>
  </div>
);
