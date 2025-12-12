
import React, { useEffect, useState } from 'react';

// Common Persian letters with poetic/calligraphic curves
const CHARS = ['ع', 'ش', 'ق', 'ن', 'و', 'ر', 'ه', 'ی', 'م', 'س', 'ل', 'خ', 'ز'];

interface FloatingChar {
  id: number;
  char: string;
  left: string;
  top: string;
  size: string;
  duration: string;
  delay: string;
  opacity: number;
}

export const CalligraphyBackground: React.FC = () => {
  const [items, setItems] = useState<FloatingChar[]>([]);

  useEffect(() => {
    // Create random floating letters
    const newItems = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      left: `${Math.random() * 90}%`,
      top: `${Math.random() * 90}%`,
      size: `${Math.random() * 12 + 8}rem`, // Large size
      duration: `${Math.random() * 15 + 15}s`, // Slow movement
      delay: `${Math.random() * -10}s`,
      opacity: Math.random() * 0.07 + 0.02, // Very subtle opacity (0.02 - 0.09)
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute font-['Lalezar'] animate-float select-none text-white blur-[1px]"
          style={{
            left: item.left,
            top: item.top,
            fontSize: item.size,
            animationDuration: item.duration,
            animationDelay: item.delay,
            opacity: item.opacity,
            transformOrigin: 'center center',
          }}
        >
          {item.char}
        </div>
      ))}
      
      {/* Overlay to ensure readability of content above */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/80"></div>
    </div>
  );
};
