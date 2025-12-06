
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { GuessInput } from './components/GuessInput';
import { GuessList } from './components/GuessList';
import { Modal } from './components/Modal';
import { StatsView } from './components/StatsView';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { GameState, Guess, PlayerStats, User } from './types';
import { getRandomWord } from './constants';
import { calculateRank, generateHint } from './services/geminiService';

const STORAGE_KEY = 'to-me-tony-state-v5';
const STATS_KEY = 'to-me-tony-stats-v1';
const USER_KEY = 'to-me-tony-user-v1';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [inputError, setInputError] = useState(false);
  
  // Default Initial State - Random word (Unlimited Mode)
  const getInitialState = (): GameState => ({
    guesses: [],
    lastPlayedDate: new Date().toISOString().split('T')[0],
    isWon: false,
    hasGivenUp: false,
    hintUsed: false,
    hintWord: null,
    targetWord: getRandomWord(),
    mode: 'unlimited'
  });

  const getInitialStats = (): PlayerStats => ({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalGuesses: 0,
  });

  const [state, setState] = useState<GameState>(getInitialState);
  const [stats, setStats] = useState<PlayerStats>(getInitialStats);
  const [user, setUser] = useState<User | null>(null);

  // Load state and stats from local storage on mount
  useEffect(() => {
    // Load Game State
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed: GameState = JSON.parse(savedState);
        setState(parsed);
        if (parsed.isWon || parsed.hasGivenUp) setShowEndModal(true);
      } catch (e) {
        setState(getInitialState());
        setShowHelpModal(true);
      }
    } else {
      setShowHelpModal(true);
    }

    // Load Stats
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        setStats(getInitialStats());
      }
    }

    // Load User
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  // Save game state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Save stats
  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  // Save User
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const updateStats = (isWin: boolean, guessCount: number) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.gamesPlayed += 1;
      
      if (isWin) {
        newStats.gamesWon += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.currentStreak, newStats.maxStreak);
        newStats.totalGuesses += guessCount;
      } else {
        newStats.currentStreak = 0;
      }
      return newStats;
    });
  };

  const handleGuess = async (word: string) => {
    if (state.guesses.some(g => g.word === word)) {
      alert("این کلمه را قبلاً حدس زده‌اید!");
      return;
    }

    setLoading(true);
    
    // Calculate Rank via AI
    const result = await calculateRank(state.targetWord, word);
    
    setLoading(false);

    if (!result.isWord) {
      setInputError(true);
      setTimeout(() => setInputError(false), 500);
      return;
    }

    // --- Unique Rank Logic ---
    let finalRank = result.rank;
    
    // Safety check: if AI returns 1 but words don't match, force it to at least 2
    if (finalRank === 1 && word !== state.targetWord) {
        finalRank = 2;
    }

    // Ensure uniqueness by checking against existing guesses
    if (finalRank !== 1) {
        const existingRanks = new Set(state.guesses.map(g => g.rank));
        while (existingRanks.has(finalRank)) {
            finalRank++;
        }
    }
    // -------------------------

    const newGuess: Guess = {
      word: word,
      rank: finalRank,
      timestamp: Date.now(),
    };

    const isWin = finalRank === 1;

    setState(prev => ({
      ...prev,
      guesses: [...prev.guesses, newGuess],
      isWon: isWin,
    }));

    if (isWin) {
      updateStats(true, state.guesses.length + 1);
      setTimeout(() => setShowEndModal(true), 800);
    }
  };

  const handleHint = useCallback(async () => {
    if (state.hintUsed) return;
    setLoading(true);

    // Dynamic Hint Logic
    // Find the current best rank (lowest number)
    const bestRank = state.guesses.length > 0 
        ? Math.min(...state.guesses.map(g => g.rank)) 
        : 10001;
    
    let targetRank = 100;
    // If user is already close (rank <= 100), give them a better hint (current - 10)
    if (bestRank <= 100) {
        targetRank = Math.max(2, bestRank - 10);
    }

    // Generate word at target rank
    const hintWord = await generateHint(state.targetWord, targetRank);
    
    // Calculate actual rank for the UI
    const result = await calculateRank(state.targetWord, hintWord);
    
    // Ensure uniqueness if possible, otherwise just add it
    let finalRank = result.rank;
    if (finalRank !== 1) {
        const existingRanks = new Set(state.guesses.map(g => g.rank));
        while (existingRanks.has(finalRank)) {
            finalRank++;
        }
    }

    const newGuess: Guess = {
        word: hintWord,
        rank: finalRank,
        timestamp: Date.now(),
        isHint: true
    };
    
    setState(prev => ({
      ...prev,
      guesses: [...prev.guesses, newGuess],
      hintUsed: true,
      hintWord: hintWord
    }));

    setLoading(false);
  }, [state.hintUsed, state.targetWord, state.guesses]);

  const handleGiveUpClick = () => {
    setShowGiveUpConfirm(true);
  };

  const confirmGiveUp = () => {
    setShowGiveUpConfirm(false);
    updateStats(false, state.guesses.length);
    setState(prev => ({
        ...prev,
        hasGivenUp: true
    }));
    setTimeout(() => setShowEndModal(true), 300);
  };

  const handleRestart = () => {
    const newWord = getRandomWord();
    setState({
      guesses: [],
      lastPlayedDate: new Date().toISOString().split('T')[0],
      isWon: false,
      hasGivenUp: false,
      hintUsed: false,
      hintWord: null,
      targetWord: newWord,
      mode: 'unlimited'
    });
    setShowEndModal(false);
  };

  const handleShare = () => {
    const statusText = state.isWon ? `پیدا کردم` : `تلاش کردم`;
    const text = `من کلمه "${state.targetWord}" را در ${state.guesses.length} حدس در "تو میتونی" ${statusText}!\n#ToMeTony #Contexto`;
    if (navigator.share) {
      navigator.share({
        title: 'To Me Tony',
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert("متن کپی شد!");
      });
    }
  };

  const handleLoginSuccess = (newUser: User) => {
    setUser(newUser);
  };
  
  const isGameOver = state.isWon || state.hasGivenUp;

  return (
    <div className="min-h-screen text-black font-sans pb-10 flex flex-col items-center relative overflow-x-hidden">
      
      <Header 
        guessCount={state.guesses.length} 
        user={user}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Floating Sticky Controller */}
      <div className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#F0FDF4]/80 border-b border-[#00979E]/10 shadow-[0_4px_30px_rgba(0,151,158,0.05)] transition-all duration-300">
        <div className="w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-3">
          
          <GuessInput 
            onGuess={handleGuess} 
            loading={loading} 
            disabled={isGameOver}
            error={inputError}
            setError={setInputError}
          />

          {!isGameOver && (
            <div className="flex justify-between items-center px-1">
              <button 
                onClick={handleHint}
                disabled={loading || state.hintUsed}
                className="group flex items-center gap-1.5 text-xs font-bold text-[#00979E] hover:text-[#007A80] transition-colors disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-lg bg-[#E0F7FA] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  💡
                </div>
                <span>راهنمایی</span>
              </button>

              <button 
                onClick={handleGiveUpClick}
                disabled={loading || state.guesses.length === 0}
                className="group flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors disabled:opacity-0"
              >
                <span>تسلیم</span>
                <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  🏳️
                </div>
              </button>
            </div>
          )}

          {isGameOver && (
             <div className="flex justify-center animate-bounce">
                <button 
                    onClick={() => setShowEndModal(true)}
                    className="text-xs font-bold text-white bg-[#00979E] px-5 py-2 rounded-xl shadow-lg hover:bg-[#007A80] transition-colors"
                >
                    نمایش نتیجه
                </button>
             </div>
          )}
        </div>
      </div>

      <GuessList guesses={state.guesses} loading={loading} />

      <Footer />

      {/* Rules Modal */}
      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} title="آموزش بازی">
        <div className="space-y-4 font-light animate-slide-in">
          <p className="font-bold text-[#00979E]">به "تو میتونی" خوش آمدید!</p>
          <p className="text-sm text-slate-600 leading-6">هدف بازی ساده است: <strong className="font-bold text-slate-800">کلمه مخفی را با توجه به ارتباط معنایی پیدا کنید.</strong></p>
          <ul className="list-disc list-inside space-y-2 marker:text-[#00979E] text-sm text-slate-600 leading-6">
            <li>هر حدس توسط هوش مصنوعی رتبه‌بندی می‌شود.</li>
            <li>رتبه <span className="font-bold font-mono text-[#00979E]">۱</span> یعنی خود کلمه!</li>
            <li>کلمات مرتبط (مثل "درخت" و "سیب") رتبه سبز دارند.</li>
            <li>کلمات بی ربط رتبه زرد یا قرمز می‌گیرند.</li>
          </ul>
        </div>
      </Modal>

      {/* Stats Modal */}
      <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} title="آمار شما">
        <StatsView stats={stats} />
        {!user?.isLoggedIn && (
           <div className="mt-6 border-t pt-4 text-center">
              <button 
                onClick={() => { setShowStatsModal(false); setShowLoginModal(true); }}
                className="text-xs text-[#00979E] underline font-bold"
              >
                برای ذخیره آمار وارد شوید
              </button>
           </div>
        )}
      </Modal>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Give Up Confirmation Modal */}
      <Modal isOpen={showGiveUpConfirm} onClose={() => setShowGiveUpConfirm(false)} title="تسلیم؟">
        <div className="space-y-6 pt-2">
           <p className="text-slate-600 leading-relaxed text-sm">
             آیا می‌خواهید بازی را تمام کنید و کلمه مخفی را ببینید؟
             <br/>
             <span className="text-xs text-red-400">این کار باعث قطع شدن "برد متوالی" شما می‌شود.</span>
           </p>
           <div className="flex gap-3">
              <button 
                onClick={confirmGiveUp}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-200"
              >
                بله، نشان بده
              </button>
              <button 
                onClick={() => setShowGiveUpConfirm(false)}
                className="flex-1 bg-white text-slate-700 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-all"
              >
                ادامه می‌دهم
              </button>
           </div>
        </div>
      </Modal>

      {/* End Game Modal */}
      <Modal isOpen={showEndModal} onClose={() => setShowEndModal(false)}>
        <div className="text-center pt-2">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 text-4xl shadow-lg ring-4 ring-white ${state.isWon ? 'bg-gradient-to-tr from-emerald-100 to-teal-200 text-emerald-600' : 'bg-gradient-to-tr from-red-50 to-orange-100 text-red-500'}`}>
            {state.isWon ? '🏆' : '🫠'}
          </div>
          <h2 className="text-3xl font-['Lalezar'] text-slate-800 mb-2">
            {state.isWon ? 'آفرین!' : 'بازی تمام شد'}
          </h2>
          
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group mt-6">
             <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">کلمه مخفی</div>
             <div className="text-4xl font-['Lalezar'] text-[#00979E] mb-4 drop-shadow-sm">{state.targetWord}</div>
             
             <div className="w-full h-px bg-slate-100 my-4"></div>
             
             <div className="flex justify-between items-center px-2">
               <span className="text-slate-400 text-xs font-bold">تعداد تلاش</span>
               <span className="text-xl font-black text-slate-800 font-sans">{state.guesses.length}</span>
             </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleRestart}
              className="w-full bg-[#00979E] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#007A80] active:scale-[0.98] transition-all shadow-xl shadow-[#00979E]/20 flex items-center justify-center gap-2"
            >
              <span>بازی بعدی</span> ↻
            </button>
            
             <button 
              onClick={handleShare}
              className="w-full bg-white text-[#00979E] border-2 border-[#E0F7FA] py-4 rounded-xl font-bold text-lg hover:bg-[#E0F7FA] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>اشتراک‌گذاری</span> 📤
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
