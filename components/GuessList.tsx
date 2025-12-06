
import React from 'react';
import { Guess } from '../types';

interface GuessListProps {
  guesses: Guess[];
  loading?: boolean;
}

export const GuessList: React.FC<GuessListProps> = ({ guesses, loading }) => {
  // Sort guesses: closest rank (lowest number) first
  const sortedGuesses = [...guesses].sort((a, b) => a.rank - b.rank);

  const getLogarithmicPercent = (rank: number): number => {
    if (rank === 1) return 100;
    const maxRank = 5000;
    const logRank = Math.log(rank);
    const logMax = Math.log(maxRank);
    const ratio = logRank / logMax;
    const percent = (1 - ratio) * 100;
    return Math.max(5, Math.min(100, percent));
  };

  const getGradientStyle = (rank: number, percent: number): React.CSSProperties => {
    let background = '';
    
    // Green (1-200) - Close/Hot
    if (rank <= 200) {
      background = `linear-gradient(270deg, rgba(20, 184, 166, 0.2) 0%, rgba(45, 212, 191, 0.4) 100%)`; // Teal
    } 
    // Yellow (201-1000) - Medium
    else if (rank <= 1000) {
      background = `linear-gradient(270deg, rgba(251, 191, 36, 0.15) 0%, rgba(252, 211, 77, 0.3) 100%)`; // Amber
    } 
    // Red (1001+) - Far/Cold
    else {
      background = `linear-gradient(270deg, rgba(244, 63, 94, 0.10) 0%, rgba(251, 113, 133, 0.25) 100%)`; // Rose
    }

    return {
      width: `${percent}%`,
      background: background,
    };
  };
  
  const getTextColor = (rank: number): string => {
     // Rank 1
     if (rank === 1) return 'text-[#004D40] border-[#00979E] bg-[#E0F2F1] shadow-[#00979E]/30 ring-2 ring-[#00979E]/20';
     
     // Close (Green)
     if (rank <= 200) return 'text-teal-900 border-teal-100 bg-white hover:border-teal-200';
     
     // Medium (Yellow)
     if (rank <= 1000) return 'text-amber-900 border-amber-100 bg-white hover:border-amber-200';
     
     // Far (Red)
     return 'text-rose-900 border-rose-100 bg-white hover:border-rose-200';
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-4 pb-32 space-y-2.5">
      
      {/* Waiting Float / Skeleton Loader */}
      {loading && (
        <div className="relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl border border-[#00979E]/10 bg-white/60 shadow-sm animate-pulse backdrop-blur-sm">
           <div className="flex items-center gap-3 w-full">
              <div className="h-5 bg-[#00979E]/10 rounded-md w-1/3"></div>
           </div>
           <div className="flex flex-col items-end gap-1">
              <div className="h-6 bg-[#00979E]/10 rounded-md w-8"></div>
              <div className="h-2 bg-[#00979E]/5 rounded-md w-6"></div>
           </div>
           {/* Shimmer overlay */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
        </div>
      )}

      {sortedGuesses.map((guess, index) => {
        const percent = getLogarithmicPercent(guess.rank);
        const textColor = getTextColor(guess.rank);
        const gradientStyle = getGradientStyle(guess.rank, percent);
        
        return (
          <div
            key={`${guess.word}-${guess.timestamp}`}
            className={`animate-slide-in relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${textColor}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Visual Bar Background with Gradient */}
            <div 
              className="absolute top-0 right-0 h-full z-0 transition-all duration-1000 ease-out opacity-80"
              style={gradientStyle}
            />

            <div className="z-10 relative flex items-center gap-3">
               <span className="font-bold text-lg tracking-tight">{guess.word}</span>
               {guess.isHint && (
                 <span title="راهنمایی" className="text-sm">💡</span>
               )}
               {guess.rank <= 10 && guess.rank > 1 && (
                 <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md font-bold shadow-sm animate-pulse">داغ</span>
               )}
            </div>

            <div className="z-10 relative flex flex-col items-end leading-none">
                <span className={`font-mono font-bold text-lg ${guess.rank === 1 ? 'text-[#007A80] scale-110' : 'opacity-60'}`}>
                    {guess.rank === 1 ? '۱' : guess.rank.toLocaleString('fa-IR')}
                </span>
                <span className="text-[9px] opacity-40 mt-0.5 uppercase tracking-wider font-bold">رتبه</span>
            </div>
            
            {/* Rank 1 Trophy */}
            {guess.rank === 1 && (
                <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none rotate-12">
                    <span className="text-4xl">🌟</span>
                </div>
            )}
          </div>
        );
      })}
      
      {guesses.length === 0 && !loading && (
        <div className="text-center mt-12 opacity-40">
           <p className="text-[#00979E] font-bold text-sm">منتظر چی هستی؟ حدس بزن!</p>
        </div>
      )}
    </div>
  );
};
