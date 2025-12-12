
import React from 'react';

export const Footer: React.FC = () => {
  // Stats simulation
  const onlineUsers = 1253;
  const winnersToday = 1042;
  
  return (
    <footer className="w-full max-w-md mx-auto mt-auto px-6 pb-8 pt-4 z-10">
      <div className="flex flex-col gap-4 text-center">
        
        {/* Stat Bar */}
        <div className="bg-slate-900/60 backdrop-blur-md text-slate-300 p-3 rounded-2xl border border-white/5 flex items-center justify-between px-6 shadow-xl shadow-black/20">
            
            <div className="flex flex-col items-center">
                 <div className="flex items-center gap-2 mb-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 box-shadow-glow"></span>
                    </span>
                    <span className="text-lg font-black font-sans text-slate-100">{onlineUsers.toLocaleString('fa-IR')}</span>
                 </div>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">آنلاین</span>
            </div>

            <div className="h-8 w-px bg-slate-700/50"></div>

            <div className="flex flex-col items-center">
                 <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base grayscale opacity-70">🏆</span>
                    <span className="text-lg font-black font-sans text-slate-100">{winnersToday.toLocaleString('fa-IR')}</span>
                 </div>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">برندگان امروز</span>
            </div>

        </div>
        
        <div className="text-[10px] text-slate-600 font-medium">
            نسخه ۳.۰ • طراحی شده با ❤️ برای فارسی زبانان
        </div>
      </div>
    </footer>
  );
};
