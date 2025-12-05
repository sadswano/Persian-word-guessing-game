
// Simulated Auth Service
// In a real app, this would call a backend API to send emails and verify tokens.

const VALIDATION_CODES = new Map<string, string>();

export const sendValidationCode = async (email: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate a random 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Store it (in memory for this session)
  VALIDATION_CODES.set(email, code);

  // In a real app, you would send this via email.
  // For this demo, we log it to console so the user can see it.
  console.log(`[To Me Tony Auth] Validation code for ${email}: ${code}`);
  alert(`کد تایید به ایمیل شما ارسال شد (شبیه‌سازی):\n\n${code}`);

  return true;
};

export const verifyValidationCode = async (email: string, code: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const storedCode = VALIDATION_CODES.get(email);
  
  if (storedCode && storedCode === code) {
    VALIDATION_CODES.delete(email);
    return true;
  }
  
  return false;
};
