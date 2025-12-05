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
    
    // Simple Persian regex check: Arabic/Persian range + spaces
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
    <div className={`w-full transition-transform duration-200 ${error ? 'animate-shake' : ''}`}>
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          placeholder={disabled ? "بازی تمام شد!" : "کلمه‌تان را حدس بزنید..."}
          disabled={loading || disabled}
          className={`
            w-full bg-white/95 rounded-xl px-5 py-4 text-lg outline-none 
            placeholder:text-gray-400 text-gray-800 
            border-2 transition-all shadow-sm
            ${error 
              ? 'border-red-400 focus:border-red-500 bg-red-50' 
              : 'border-[#00979E]/20 focus:border-[#00979E] focus:shadow-[#00979E]/20 focus:shadow-lg'
            }
            disabled:opacity-60 disabled:bg-gray-50
          `}
          dir="rtl"
          autoFocus
        />
        
        <button
          type="submit"
          disabled={loading || disabled || !value.trim()}
          className={`
            absolute left-2 top-2 bottom-2 aspect-square rounded-lg flex items-center justify-center transition-all
            ${!value.trim() || loading || disabled 
               ? 'bg-gray-100 text-gray-300' 
               : 'bg-[#00979E] text-white hover:bg-[#007A80] shadow-md hover:shadow-[#00979E]/40 hover:scale-105 active:scale-95'
            }
          `}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="pb-1 block rotate-180 text-xl">➤</span>
          )}
        </button>
      </form>
    </div>
  );
};