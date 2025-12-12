
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GuessInput } from './components/GuessInput';
import { GuessList } from './components/GuessList';
import { Modal } from './components/Modal';
import { StatsView } from './components/StatsView';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { CalligraphyBackground } from './components/CalligraphyBackground';
import { GameState, Guess, PlayerStats, User } from './types';
import { getDailyWord, PRIZE_LIMIT, REWARD_AMOUNT } from './constants';
import { calculateRank, generateHint } from './services/geminiService';

const STORAGE_KEY = 'to-me-tony-modern-state-v1';
const STATS_KEY = 'to-me-tony-modern-stats-v1';
const USER_KEY = 'to-me-tony-modern-user-v1';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [inputError, setInputError] = useState(false);
  
  // Game State
  const getInitialState = (): GameState => ({
    guesses: [],
    lastPlayedDate: new Date().toISOString().split('T')[0],
    isWon: false,
    isLost: false,
    targetWord: getDailyWord(false), // Default to Easy (Guest) initially
    walletCredited: false
  });

  const getInitialStats = (): PlayerStats => ({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalGuesses: 0,
    totalEarnings: 0
  });

  const [state, setState] = useState<GameState>(getInitialState);
  const [stats, setStats] = useState<PlayerStats>(getInitialStats);
  const [user, setUser] = useState<User | null>(null);

  // Initialize Data
  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem(USER_KEY);
    let loadedUser = null;
    if (savedUser) {
      try { loadedUser = JSON.parse(savedUser); setUser(loadedUser); } catch (e) { setUser(null); }
    } else {
      setShowLoginModal(true);
    }

    // Load Stats
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      try { setStats(JSON.parse(savedStats)); } catch (e) { setStats(getInitialStats()); }
    }

    // Load Game State
    const savedState = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    // Determine the correct word based on user status (Hard for User, Easy for Guest)
    const isHardMode = !!loadedUser;
    const correctTargetWord = getDailyWord(isHardMode);
    
    if (savedState) {
      try {
        const parsed: GameState = JSON.parse(savedState);
        
        // Reset if new day OR if the stored word doesn't match the required difficulty mode
        // (This happens when a guest logs in, we must switch them to the Hard word)
        if (parsed.lastPlayedDate !== today || parsed.targetWord !== correctTargetWord) {
           setState({
             ...getInitialState(),
             targetWord: correctTargetWord,
             lastPlayedDate: today
           });
        } else {
           setState(parsed);
           if (parsed.isWon || parsed.isLost) setShowEndModal(true);
        }
      } catch (e) {
        setState({ ...getInitialState(), targetWord: correctTargetWord });
      }
    } else {
        setState({ ...getInitialState(), targetWord: correctTargetWord });
    }
  }, []);

  // Watch for User Login/Logout to switch difficulty
  useEffect(() => {
    if (!state.lastPlayedDate) return; // Skip initial render issues
    
    const isHardMode = !!user;
    const correctWord = getDailyWord(isHardMode);

    if (state.targetWord !== correctWord) {
        // Mode changed (e.g. Guest -> Login). Reset game to the correct word.
        // NOTE: This enforces "Different words for Prize vs Fun".
        const today = new Date().toISOString().split('T')[0];
        setState({
            guesses: [],
            lastPlayedDate: today,
            isWon: false,
            isLost: false,
            targetWord: correctWord,
            walletCredited: false
        });
        setShowEndModal(false);
    }
  }, [user, state.targetWord]); // Check when user or targetWord updates

  // Syncs
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { 
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const updateWalletAndStats = (isWin: boolean, guessCount: number) => {
    if (state.walletCredited) return;

    const isPrizeEligible = isWin && guessCount <= PRIZE_LIMIT;

    setStats(prev => {
      const newStats = { ...prev };
      newStats.gamesPlayed += 1;
      if (isWin) {
        newStats.gamesWon += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.currentStreak, newStats.maxStreak);
        newStats.totalGuesses += guessCount;
        if (isPrizeEligible && user) newStats.totalEarnings += REWARD_AMOUNT;
      } else {
        newStats.currentStreak = 0;
      }
      return newStats;
    });

    if (isPrizeEligible && user) {
        setUser(prev => prev ? ({ ...prev, walletBalance: prev.walletBalance + REWARD_AMOUNT }) : null);
    }

    setState(prev => ({ ...prev, walletCredited: true }));
  };

  const handleGuess = async (word: string) => {
    // 1. Check Guest Duplicate
    if (state.guesses.some(g => g.word === word)) {
      alert("این کلمه را قبلاً حدس زده‌اید!");
      return;
    }

    // 2. Anti-Cheat: Immediate Win on First Guess
    // "if anyone guess in first word he is absoult cheater."
    if (state.guesses.length === 0 && word === state.targetWord) {
        alert("⛔ سیستم ضد تقلب فعال شد!\n\nحدس زدن کلمه دقیقاً در اولین تلاش غیرممکن تلقی می‌شود.\nلطفاً از ربات یا لیست آماده استفاده نکنید.");
        return;
    }

    setLoading(true);
    const result = await calculateRank(state.targetWord, word);
    setLoading(false);

    if (!result.isWord) {
      setInputError(true);
      setTimeout(() => setInputError(false), 500);
      return;
    }

    let finalRank = result.rank;
    if (finalRank === 1 && word !== state.targetWord) finalRank = 2; 
    
    // Ensure uniqueness of ranks for visual clarity
    if (finalRank !== 1) {
        const existingRanks = new Set(state.guesses.map(g => g.rank));
        while (existingRanks.has(finalRank)) finalRank++;
    }

    const newGuess: Guess = {
      word: word,
      rank: finalRank,
      timestamp: Date.now(),
    };

    const isWin = finalRank === 1;
    const newGuessList = [...state.guesses, newGuess];

    setState(prev => ({
      ...prev,
      guesses: newGuessList,
      isWon: isWin,
    }));

    if (isWin) {
        updateWalletAndStats(true, newGuessList.length);
        setTimeout(() => setShowEndModal(true), 1500);
    }
  };

  const handleGiveUp = () => {
      setState(prev => ({ ...prev, isLost: true }));
      updateWalletAndStats(false, state.guesses.length);
      setShowEndModal(true);
  };

  const handleGetHint = async () => {
    setHintLoading(true);
    const hintWord = await generateHint(state.targetWord, 100);
    setHintLoading(false);
    if (hintWord) handleGuess(hintWord);
  };

  const handleShare = async () => {
    const word = state.targetWord;
    const moves = state.guesses.length;
    const url = window.location.href;
    
    const text = state.isWon 
        ? `🧠 مغز متفکر! من کلمه «${word}» رو تو ${moves} حرکت پیدا کردم.\n\nتو میتونی رکورد منو بزنی؟ 👀\n\n🎮 بازی آنلاین «تو میتونی»:\n🔗 ${url}`
        : `🤯 کلمه امروز «${word}» خیلی سخت بود!\n\nفکر میکنی بتونی پیداش کنی؟ 👀\n\n🎮 بازی آنلاین «تو میتونی»:\n🔗 ${url}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'To Me Tony | تو میتونی',
                text: text,
            });
        } catch (err) {
            console.log('Share canceled');
        }
    } else {
        // Fallback for desktop/unsupported
        navigator.clipboard.writeText(text).then(() => {
            alert('متن اشتراک‌گذاری کپی شد! برای دوستانت بفرست.');
        });
    }
  };

  const isGameOver = state.isWon || state.isLost;
  const guessesUsed = state.guesses.length;
  const prizeEligible = guessesUsed < PRIZE_LIMIT;

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 pb-32 relative">
      <CalligraphyBackground />
      
      {/* Main Container */}
      <div className="w-full max-w-md px-4 flex flex-col gap-6 z-20">
            
        <Header 
            guessesLeft={Math.max(0, PRIZE_LIMIT - guessesUsed)}
            user={user}
            onOpenStats={() => setShowStatsModal(true)}
            onOpenLogin={() => setShowLoginModal(true)}
        />

        <div className="flex flex-col gap-4">
            {!isGameOver && (
                <div className="flex justify-between items-center text-xs font-bold px-2">
                    <span className="text-slate-400">کلمه امروز را پیدا کنید</span>
                    {prizeEligible ? (
                        <span className={`px-2 py-0.5 rounded-full ${PRIZE_LIMIT - guessesUsed <= 2 ? 'bg-rose-500/10 text-rose-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {PRIZE_LIMIT - guessesUsed} فرصت تا جایزه
                        </span>
                    ) : (
                        <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">جایزه سوخت شد</span>
                    )}
                </div>
            )}

            <GuessInput 
                onGuess={handleGuess} 
                loading={loading} 
                disabled={isGameOver}
                error={inputError}
                setError={setInputError}
            />

            {/* Post-Prize Actions */}
            {!isGameOver && !prizeEligible && (
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleGetHint} disabled={hintLoading}
                        className="bg-slate-800/50 hover:bg-slate-800 text-amber-300 text-sm font-bold py-3 rounded-2xl border border-slate-700 transition-all flex justify-center items-center gap-2">
                        {hintLoading ? '...' : '💡 راهنمایی'}
                    </button>
                    <button onClick={handleGiveUp}
                        className="bg-slate-800/50 hover:bg-slate-800 text-rose-400 text-sm font-bold py-3 rounded-2xl border border-slate-700 transition-all">
                        تسلیم 🏳️
                    </button>
                </div>
            )}

            {isGameOver && (
                <button 
                    onClick={() => setShowEndModal(true)}
                    className={`w-full text-lg font-bold text-white py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2
                    ${state.isWon ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25' : 'bg-slate-700 shadow-slate-900/50'}`}
                >
                    {state.isWon ? 'مشاهده نتیجه 🏆' : 'نمایش کلمه 🧐'}
                </button>
            )}
        </div>
      </div>

      <GuessList guesses={state.guesses} loading={loading} />

      <Footer />

      {/* Modals */}
      <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} title="پروفایل کاربری">
        <StatsView stats={stats} user={user} />
      </Modal>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={(u) => { setUser(u); setShowLoginModal(false); }}
      />

      <Modal isOpen={showEndModal} onClose={() => setShowEndModal(false)}>
        <div className="text-center pt-2 pb-4">
            <div className={`text-7xl mb-6 mx-auto w-24 h-24 flex items-center justify-center rounded-full ${state.isWon ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-rose-500/10 text-rose-500'}`}>
                {state.isWon ? '💎' : '👻'}
            </div>
            
            <h2 className="text-3xl font-['Lalezar'] text-white mb-2">
                {state.isWon ? 'پیروزی!' : 'پایان بازی'}
            </h2>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 my-6 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent"></div>
                 <div className="relative">
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">کلمه مخفی امروز</div>
                    <div className="text-4xl font-['Lalezar'] text-white drop-shadow-md">{state.targetWord}</div>
                 </div>
            </div>

            {/* Share Button */}
            <button 
                onClick={handleShare}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 mb-4 flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                اشتراک‌گذاری با دوستان
            </button>

            {/* Prize Message */}
            {state.isWon && state.guesses.length <= PRIZE_LIMIT && user && (
                 <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 font-bold mb-4">
                     + {REWARD_AMOUNT.toLocaleString('fa-IR')} تومان پاداش دریافت شد
                 </div>
            )}

            {/* Guest/Missed Prize Message */}
            {state.isWon && (!user || state.guesses.length > PRIZE_LIMIT) && (
                 <div className="text-amber-400/80 font-medium text-sm mb-4 px-4 leading-relaxed">
                     {user 
                        ? 'جایزه سوخت شده بود، اما آفرین بابت پشتکارت!'
                        : 'برای دریافت جایزه نقدی در دفعات بعد، وارد حساب شوید.'}
                 </div>
            )}
            
            {/* Lockout Message for Prize Players */}
            {user && (
                 <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-400">
                    🔒 شما بازی امروز را تکمیل کرده‌اید. فرصت بعدی: فردا
                 </div>
            )}
             {!user && (
                 <p className="text-slate-500 text-xs mt-6">فردا با کلمه‌ای جدید منتظرتان هستیم.</p>
             )}
        </div>
      </Modal>
    </div>
  );
};

export default App;
