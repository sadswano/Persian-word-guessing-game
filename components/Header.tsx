
import React from 'react';
import { GAME_TITLE } from '../constants';
import { User } from '../types';

interface HeaderProps {
  guessesLeft: number;
  user: User | null;
  onOpenStats: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenStats, onOpenLogin }) => {
  return (
    <div className="w-full flex justify-between items-center py-2">
      
      {/* Modern Logo */}
      <div className="flex flex-col">
        <h1 className="text-4xl font-['Lalezar'] text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-indigo-300 drop-shadow-sm">
          {GAME_TITLE}
        </h1>
      </div>
      
      {/* User Glass Pill */}
      <button 
         onClick={user?.isLoggedIn ? onOpenStats : onOpenLogin}
         className={`
           flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-full text-xs font-bold transition-all border
           ${user?.isLoggedIn 
             ? 'bg-slate-800/60 text-slate-200 border-slate-700 hover:bg-slate-700/80 hover:border-slate-600' 
             : 'bg-violet-600 text-white border-violet-500 hover:bg-violet-500'
           }
         `}
      >
          {user?.isLoggedIn ? (
            <>
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 leading-tight">موجودی</span>
                <span className="text-emerald-400 font-mono">{user.walletBalance.toLocaleString('fa-IR')}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600">
                {user.name.charAt(0)}
              </div>
            </>
          ) : (
            <span className="px-2">ورود / ثبت نام</span>
          )}
      </button>
    </div>
  );
};
