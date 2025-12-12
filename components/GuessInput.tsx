
import React, { useState, FormEvent } from 'react';

interface GuessInputProps {
  onGuess: (word: string) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  error: boolean;
  setError: (hasError: boolean) => void;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onGuess, loading, disabled, error, setError }) => {
  const [value, setValue] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading || disabled) return;
    
    // Simple Persian regex check
    const isPersian = /^[\u0600-\u06FF\s]+$/.test(value);
    
    if (isPersian) {
      await onGuess(value.trim());
      setValue('');
      setError(false);
    } else {
        setError(true);
        setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className={`w-full relative transition-transform duration-200 ${error ? 'animate-shake' : ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          placeholder={disabled ? "بازی تمام شد" : "کلمه را حدس بزنید..."}
          disabled={loading || disabled}
          className={`
            w-full bg-slate-800/80 text-white text-lg px-6 py-4 rounded-2xl outline-none transition-all
            placeholder:text-slate-500 border border-slate-700/50 shadow-lg
            focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 focus:bg-slate-800
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          dir="rtl"
          autoFocus
        />
        
        <button
          type="submit"
          disabled={loading || disabled || !value.trim()}
          className={`
            absolute left-2 top-2 bottom-2 aspect-square flex items-center justify-center transition-all rounded-xl
            ${!value.trim() || loading || disabled 
               ? 'text-slate-600 bg-transparent' 
               : 'bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-500/20'
            }
          `}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-180">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};
