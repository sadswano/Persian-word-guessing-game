
import React, { useState } from 'react';
import { PlayerStats, User } from '../types';
import { MIN_WITHDRAWAL } from '../constants';

interface StatsViewProps {
  stats: PlayerStats;
  user: User | null;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, user }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;
    
  const balance = user?.walletBalance || 0;
  const progressPercent = Math.min(100, (balance / MIN_WITHDRAWAL) * 100);

  const handleWithdrawSubmit = () => {
    if (!telegramId.trim()) return;
    // Simulate API call to save request
    setSubmitStatus('success');
    // In a real app, you would send { userId: user.id, telegramId, amount: balance } to backend
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Wallet Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-2xl">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
                <p className="text-slate-400 text-xs font-bold mb-2">موجودی کیف پول</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                        {balance.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">تومان</span>
                </div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 backdrop-blur-md">
                💎
            </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mb-2">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-2">
                <span>پیشرفت تا برداشت</span>
                <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
        </div>
        
        {/* Withdrawal Action Area */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/5">
            {!isWithdrawing && submitStatus === 'idle' ? (
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-mono">Min: {MIN_WITHDRAWAL.toLocaleString('fa-IR')}</span>
                    <button 
                        onClick={() => setIsWithdrawing(true)}
                        disabled={balance < MIN_WITHDRAWAL}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all border border-emerald-500/50 shadow-lg shadow-emerald-500/20 disabled:shadow-none"
                    >
                        برداشت وجه
                    </button>
                </div>
            ) : submitStatus === 'success' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center animate-slide-in">
                    <p className="text-emerald-400 text-xs font-bold mb-1">درخواست ثبت شد! ✅</p>
                    <p className="text-[10px] text-emerald-300/70">ادمین در تلگرام با شما تماس خواهد گرفت.</p>
                </div>
            ) : (
                <div className="animate-slide-in">
                    <label className="block text-[10px] text-slate-400 mb-2">آیدی تلگرام جهت واریز:</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="@username"
                            value={telegramId}
                            onChange={(e) => setTelegramId(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500 text-left dir-ltr placeholder:text-slate-600"
                            dir="ltr"
                            autoFocus
                        />
                        <button 
                            onClick={handleWithdrawSubmit}
                            disabled={!telegramId}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                            ثبت
                        </button>
                        <button 
                            onClick={() => setIsWithdrawing(false)}
                            className="text-slate-500 hover:text-white px-2 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="تعداد بازی" value={stats.gamesPlayed} delay={0} />
        <StatBox label="نرخ برد" value={`${winRate}%`} delay={50} />
        <StatBox label="برد متوالی" value={stats.currentStreak} delay={100} />
        <StatBox label="کل درآمد" value={`${(stats.totalEarnings/1000).toFixed(0)}k`} delay={150} />
      </div>
      
      <p className="text-[10px] text-slate-500 text-center leading-5 px-4 pt-2">
        هر روز یک کلمه جدید. ربات‌ها و تقلب باعث مسدودی حساب می‌شوند.
      </p>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string | number; delay: number }> = ({ label, value, delay }) => (
  <div 
    className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm animate-slide-in hover:bg-slate-800/60 transition-colors"
    style={{ animationDelay: `${delay}ms` }}
  >
    <span className="text-2xl font-black text-slate-200 font-sans mb-1">{value}</span>
    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
  </div>
);
