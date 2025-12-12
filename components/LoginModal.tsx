
import React, { useState } from 'react';
import { Modal } from './Modal';
import { sendValidationCode, verifyValidationCode } from '../services/authService';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Email/Name, 2: Code
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('لطفاً نام خود را وارد کنید.');
      return;
    }
    if (!validateEmail(email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      await sendValidationCode(email);
      setStep(2);
    } catch (err) {
      setError('خطا در ارسال کد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length !== 4) {
      setError('کد تایید باید ۴ رقم باشد.');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyValidationCode(email, code);
      if (isValid) {
        onLoginSuccess({
          name: name,
          email: email,
          isLoggedIn: true,
          walletBalance: 0 // New users start with 0
        });
        setStep(1);
        setName('');
        setEmail('');
        setCode('');
      } else {
        setError('کد وارد شده اشتباه است.');
      }
    } catch (err) {
      setError('خطا در بررسی کد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "ورود به حساب" : "تایید هویت"}>
      <div className="pt-2">
        <p className="text-xs text-rose-400 font-bold mb-6 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-center leading-relaxed">
            ⚠️ برای ذخیره امتیازات و دریافت جایزه، لطفاً وارد شوید.
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">نام شما</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 outline-none focus:border-violet-500 focus:bg-slate-900 transition-all text-white placeholder:text-slate-600"
                placeholder="مثلاً: آرش"
                dir="rtl"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">ایمیل</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 outline-none focus:border-violet-500 focus:bg-slate-900 transition-all text-left text-white placeholder:text-slate-600"
                placeholder="mail@example.com"
                dir="ltr"
              />
            </div>

            {error && <p className="text-xs text-rose-400 font-bold">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-violet-600 text-white font-bold py-4 rounded-xl hover:bg-violet-500 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center mt-2"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'دریافت کد تایید'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">کد ۴ رقمی ارسال شده به</p>
              <p className="font-bold text-white dir-ltr font-mono bg-slate-800/50 inline-block px-2 py-0.5 rounded mb-2">{email}</p>
              <div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-[10px] text-violet-400 underline hover:text-violet-300"
                >
                  تغییر ایمیل
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <input 
                type="text" 
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setCode(val);
                }}
                className="w-40 bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-4 outline-none focus:border-violet-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all text-center text-3xl font-mono tracking-[0.5em] text-white placeholder:text-slate-700"
                placeholder="0000"
                dir="ltr"
                autoFocus
              />
            </div>

            {error && <p className="text-xs text-rose-400 font-bold text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading || code.length < 4}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex justify-center"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'ورود به بازی'}
            </button>
          </form>
        )}
        
        {/* Guest Button */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
             <button 
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-300 font-bold text-xs py-2 px-4 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mx-auto"
             >
                <span>ادامه به عنوان مهمان</span>
                <span className="opacity-50 text-[10px]">(بدون جایزه)</span>
             </button>
        </div>
      </div>
    </Modal>
  );
};
