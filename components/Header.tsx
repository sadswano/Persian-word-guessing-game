import React from 'react';
import { GAME_TITLE, GAME_SUBTITLE } from '../constants';
import { User } from '../types';

interface HeaderProps {
  guessCount: number;
  user: User | null;
  onOpenHelp: () => void;
  onOpenStats: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ guessCount, user, onOpenHelp, onOpenStats, onOpenLogin }) => {
  return (
    <header className="w-full max-w-md mx-auto pt-6 pb-2 px-4 flex flex-col items-center gap-1 relative mb-2">
      <h1 className="text-5xl font-['Lalezar'] text-[#00979E] tracking-wide drop-shadow-sm flex flex-col items-center z-10">
        {GAME_TITLE}
        <span className="text-sm font-sans font-normal text-[#00979E]/40 tracking-[0.2em] uppercase mt-[-5px]">{GAME_SUBTITLE}</span>
      </h1>
      
      {/* Decorative Persian Border */}
      <div className="w-32 h-1 border-b-2 border-[#00979E]/20 border-double my-2"></div>
      
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs font-bold text-[#00979E]/60 bg-[#E0F7FA] px-3 py-1.5 rounded-lg min-w-[60px] text-center border border-[#00979E]/10">
          {guessCount} حدس
        </span>
        
        <button 
          onClick={onOpenStats}
          className="text-xs font-bold text-[#00979E]/60 hover:text-[#00979E] hover:bg-[#E0F7FA] w-8 h-8 flex items-center justify-center rounded-lg transition-colors border border-transparent hover:border-[#00979E]/10"
          title="آمار بازی"
        >
          📊
        </button>

        <button 
          onClick={onOpenHelp}
          className="text-xs font-bold text-[#00979E]/60 hover:text-[#00979E] hover:bg-[#E0F7FA] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#00979E]/10"
          title="راهنما"
        >
          ؟
        </button>

        <button 
          onClick={onOpenLogin}
          className={`
            text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border
            ${user?.isLoggedIn 
              ? 'text-[#007A80] bg-white border-[#00979E]/20 hover:bg-[#E0F7FA]' 
              : 'text-slate-400 bg-white border-slate-100 hover:bg-slate-50 hover:text-slate-600'
            }
          `}
        >
          {user?.isLoggedIn ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00979E]"></span>
              {user.name}
            </>
          ) : (
            'ورود'
          )}
        </button>
      </div>
    </header>
  );
};