
export const GAME_TITLE = "تو میتونی";
export const GAME_SUBTITLE = "To Me Tony";

// A curated list of Persian words for the daily puzzle. 
// In a real app, this might be longer or fetched from a server.
export const SECRET_WORDS = [
  "زندگی", "عشق", "آزادی", "خورشید", "دریا", "کتاب", "دوست", "امید", "زمان", "خاطره",
  "باران", "آسمان", "زمین", "فکر", "شادی", "غم", "انسان", "رویا", "سفر", "خانه",
  "موسیقی", "هنر", "شعر", "دانش", "کار", "تلاش", "موفقیت", "آرامش", "جنگل", "کوه",
  "پرنده", "آب", "آتش", "خاک", "باد", "ستاره", "شب", "روز", "بهار", "زمستان",
  "پاییز", "تابستان", "گل", "درخت", "سیب", "نان", "چای", "قهوه", "صندلی", "میز",
  "پنجره", "دیوار", "کوچه", "شهر", "روستا", "ماه", "ابر", "برف", "سایه", "نور",
  "صدا", "سکوت", "لبخند", "اشک", "نگاه", "دست", "پا", "قلب", "ذهن", "روح"
];

// Seeded random function to pick a word based on the date
export const getDailyWord = (): string => {
  const today = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % SECRET_WORDS.length;
  return SECRET_WORDS[index];
};

export const getRandomWord = (): string => {
  const index = Math.floor(Math.random() * SECRET_WORDS.length);
  return SECRET_WORDS[index];
};

export const getGameNumber = (): number => {
  const start = new Date("2024-01-01").getTime();
  const now = new Date().getTime();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};
