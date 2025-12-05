import { GoogleGenAI, Type } from "@google/genai";
import { WordSimilarityResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Calculates the semantic rank of a guess relative to the secret word.
 * Since we don't have a vector DB, we ask the LLM to estimate the "contextual rank".
 */
export const calculateRank = async (secretWord: string, guessedWord: string): Promise<WordSimilarityResponse> => {
  if (secretWord === guessedWord) {
    return { rank: 1, isWord: true };
  }

  const prompt = `
    I am building a game called Contexto. The secret Persian word is "${secretWord}".
    The user guessed "${guessedWord}".
    
    Task 1: Is "${guessedWord}" a valid Persian word?
    Task 2: Estimate the "contextual distance" or rank of the guess relative to the secret word based on how often they appear in similar contexts in Persian literature, news, and daily conversation.
    
    Rules:
    - Rank 1 is the secret word itself.
    - Synonyms or highly related words (e.g., 'Love' and 'Affection') should have low ranks (2-100).
    - Somewhat related words (e.g., 'Apple' and 'Tree') should be mid-rank (101-1000).
    - Unrelated words should be high rank (1000+).
    - Be consistent.
    
    Return JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isWord: { type: Type.BOOLEAN, description: "True if the guessed word is a valid Persian word." },
            rank: { type: Type.INTEGER, description: "The estimated rank distance (e.g., 5, 400, 5000)." },
          },
          required: ["isWord", "rank"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    // Fallback if parsing fails or returns weird data
    return {
      isWord: result.isWord ?? true,
      rank: result.rank ?? 5000,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback error handling: assume it's a valid word but far away to not block gameplay
    return { isWord: true, rank: Math.floor(Math.random() * 2000) + 1000 };
  }
};

/**
 * Generates a single hint word that is semantically close to the secret word.
 */
export const generateHint = async (secretWord: string, targetRank: number): Promise<string> => {
  const prompt = `
    The secret Persian word is "${secretWord}".
    Provide a single Persian word that is contextually related to this word, with an estimated rank of approximately ${targetRank}.
    (Rank 1 is the word itself. Rank 10 is very close. Rank 100 is moderately related. Rank 1000 is far).
    Do not use the secret word itself.
    Return only the word string, nothing else.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "text/plain",
      },
    });
    return response.text?.trim() || "نامشخص";
  } catch (error) {
    console.error("Hint generation error:", error);
    return "خطا";
  }
};