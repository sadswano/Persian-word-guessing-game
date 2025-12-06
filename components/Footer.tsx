
import React from 'react';

export const Footer: React.FC = () => {
  // Simulate stats for display purposes
  // In a real app, these would come from an API
  const onlinePlayers = 142;
  const todayPlayers = 3891;
  
  const today = new Date().toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <footer className="w-full max-w-md mx-auto mt-auto px-6 pb-6 pt-2">
      <div className="flex flex-col gap-4 text-center">
        
        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#00979E]/20 to-transparent"></div>

        <div className="flex justify-between items-center text-xs text-slate-500 font-bold px-2">
            <div className="flex items-center gap-2 group cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="group-hover:text-[#00979E] transition-colors">{onlinePlayers.toLocaleString('fa-IR')} آنلاین</span>
            </div>
            
            <div className="flex items-center gap-1.5 group cursor-default">
                <span className="grayscale group-hover:grayscale-0 transition-all">👥</span>
                <span className="group-hover:text-[#00979E] transition-colors">{todayPlayers.toLocaleString('fa-IR')} بازی امروز</span>
            </div>
        </div>

        <div className="text-[11px] text-[#00979E]/80 font-medium bg-white/50 border border-[#00979E]/10 py-2 rounded-xl shadow-sm backdrop-blur-sm">
            📅 {today}
        </div>
      </div>
    </footer>
  );
};
