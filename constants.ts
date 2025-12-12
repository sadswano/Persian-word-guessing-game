
export const GAME_TITLE = "تو میتونی";
export const GAME_SUBTITLE = ""; 

export const PRIZE_LIMIT = 7; 
export const MAX_GUESSES = 999; 
export const REWARD_AMOUNT = 7000;
export const MIN_WITHDRAWAL = 50000;

// Fun Mode: Common, daily words (High school level)
export const EASY_WORDS = [
  "آسمان", "پنجره", "خیابان", "مدرسه", "فوتبال", "خورشید", "لبخند", "دوست", 
  "خانواده", "دریا", "جنگل", "کتاب", "باران", "پرنده", "ساعت", "آینه", 
  "باغچه", "مداد", "کیف", "صندلی", "ماکرونی", "بستنی", "گوشی", "تلویزیون"
];

// Prize Mode: Hardcore, Abstract, Homophones (Trap words)
export const HARD_WORDS = [
  "قسطاس", "برزخ", "تغافل", "استحاله", "تذبذب", "مصلحت", "طینت", "عزت", 
  "ذلت", "فراست", "صلابت", "مناعت", "قناعت", "شقاوت", "ضلالت", "صیانت", 
  "بضاعت", "فصاحت", "بلاغت", "وقاحت", "مستاصل", "مضمحل", "منزجر", "متقاعد"
];

// Seeded random function to pick a word based on the date
export const getDailyWord = (isHardMode: boolean = true): string => {
  const today = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  const list = isHardMode ? HARD_WORDS : EASY_WORDS;
  const index = Math.abs(hash) % list.length;
  return list[index];
};

export const getRandomWord = (): string => {
  return getDailyWord(true);
};

export const getGameNumber = (): number => {
  const start = new Date("2024-01-01").getTime();
  const now = new Date().getTime();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};
