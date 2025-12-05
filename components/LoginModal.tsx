
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
          isLoggedIn: true
        });
        onClose();
        // Reset form after successful login
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
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "ورود / ثبت‌نام" : "تایید ایمیل"}>
      <div className="pt-2">
        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">نام شما</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-400 focus:bg-white transition-all text-slate-800"
                placeholder="مثلاً: علی"
                dir="rtl"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ایمیل</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-400 focus:bg-white transition-all text-left text-slate-800"
                placeholder="example@mail.com"
                dir="ltr"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all shadow-lg shadow-teal-100 disabled:opacity-70 disabled:active:scale-100 flex justify-center"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'ارسال کد تایید'}
            </button>
            
            <p className="text-[10px] text-slate-400 text-center leading-4">
              با ورود به حساب، آمار بازی‌های شما ذخیره خواهد شد.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-xs text-slate-500">کد ۴ رقمی ارسال شده به</p>
              <p className="font-bold text-teal-700 dir-ltr">{email}</p>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-[10px] text-slate-400 underline mt-1 hover:text-slate-600"
              >
                اصلاح ایمیل
              </button>
            </div>

            <div className="flex justify-center">
              <input 
                type="text" 
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setCode(val);
                }}
                className="w-32 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-400 focus:bg-white transition-all text-center text-2xl font-mono tracking-widest text-slate-800"
                placeholder="0000"
                dir="ltr"
                autoFocus
              />
            </div>

            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading || code.length < 4}
              className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all shadow-lg shadow-teal-100 disabled:opacity-70 disabled:active:scale-100 flex justify-center"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'تایید و ورود'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
