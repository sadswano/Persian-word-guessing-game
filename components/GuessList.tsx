
import React from 'react';
import { Guess } from '../types';

interface GuessListProps {
  guesses: Guess[];
  loading?: boolean;
}

export const GuessList: React.FC<GuessListProps> = ({ guesses, loading }) => {
  const sortedGuesses = [...guesses].sort((a, b) => a.rank - b.rank);

  // Helper to determine color based on rank
  const getColorPalette = (rank: number) => {
    if (rank === 1) return {
      bar: 'bg-emerald-500', 
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
    };
    if (rank <= 300) return {
      bar: 'bg-teal-500', 
      border: 'border-teal-500/30',
      text: 'text-teal-300',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    };
    if (rank <= 1000) return {
      bar: 'bg-amber-500', 
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    };
    return {
      bar: 'bg-rose-500', 
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      badge: 'bg-rose-500/10 text-rose-300/80 border-rose-500/20'
    };
  };

  // Logarithmic scale for width
  const getBarWidth = (rank: number) => {
     if (rank === 1) return '100%';
     const maxRank = 5000;
     const percentage = Math.max(5, 100 - (Math.log(rank) / Math.log(maxRank)) * 100);
     return `${percentage}%`;
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-12 z-10 flex flex-col gap-3 mt-6">
      
      {loading && (
        <div className="flex justify-center py-4 gap-2">
             <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce"></div>
             <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce delay-75"></div>
             <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce delay-150"></div>
        </div>
      )}

      {sortedGuesses.map((guess, index) => {
        const colors = getColorPalette(guess.rank);
        const width = getBarWidth(guess.rank);
        const rankStr = guess.rank === 1 ? '۱' : guess.rank.toLocaleString('fa-IR');
        
        // Dynamic font size logic: shorter number = bigger font
        // 1-3 chars (e.g. ۱۰۰) -> 2xl
        // 4-5 chars (e.g. ۱,۰۰۰) -> lg
        // 6 chars (e.g. ۱۰,۰۰۰) -> base
        // 7+ chars -> sm
        const rankLen = rankStr.length;
        let fontSizeClass = 'text-2xl';
        
        if (rankLen > 6) fontSizeClass = 'text-sm';
        else if (rankLen > 5) fontSizeClass = 'text-base';
        else if (rankLen > 3) fontSizeClass = 'text-lg';

        return (
          <div
            key={`${guess.word}-${guess.timestamp}`}
            className={`
                relative w-full h-16 rounded-2xl overflow-hidden bg-slate-900/60 
                border transition-all duration-500 shadow-sm animate-slide-in
                ${colors.border}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* 1. The Fill Bar (Background Progress) */}
            <div 
                className={`absolute inset-y-0 right-0 h-full ${colors.bar} opacity-20 transition-all duration-1000 ease-out`} 
                style={{ width: width }}
            />
            
            {/* 2. Cap Line for the bar */}
             <div 
                className={`absolute inset-y-0 right-0 h-full w-[2px] ${colors.bar} opacity-50`} 
                style={{ marginRight: `calc(${width} - 2px)` }}
            />

            {/* 3. Content */}
            <div className="relative z-10 flex items-center justify-between px-4 h-full w-full">
                
                {/* Word */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-slate-100 drop-shadow-md truncate max-w-[160px]">{guess.word}</span>
                        {guess.isHint && (
                            <span className="text-[9px] font-bold bg-violet-500/20 text-violet-200 border border-violet-500/30 px-2 py-0.5 rounded-md whitespace-nowrap">
                                هوش مصنوعی
                            </span>
                        )}
                    </div>
                </div>

                {/* Rank Badge Box - Dynamic Width */}
                <div className={`
                    flex flex-col items-center justify-center 
                    min-w-[3.5rem] h-11 px-3 rounded-xl border backdrop-blur-sm transition-colors
                    ${colors.badge}
                `}>
                    <span className={`font-mono font-black leading-none mt-1 whitespace-nowrap ${fontSizeClass}`}>
                        {rankStr}
                    </span>
                    
                    {guess.rank === 1 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                    )}
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
