
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all animate-[enter_0.2s_ease-out]">
        {(title) && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {!title && (
           <button 
              onClick={onClose}
              className="absolute top-4 left-4 text-slate-300 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full transition-colors z-10"
            >
              ✕
            </button>
        )}
        
        <div className="text-slate-600 text-sm leading-7">
          {children}
        </div>
      </div>
    </div>
  );
};
