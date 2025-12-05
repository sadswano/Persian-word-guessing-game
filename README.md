

<img width="1243" height="691" alt="Screenshot (1)" src="https://github.com/user-attachments/assets/af9c1974-c298-44bd-8626-c9af4fd733c3" />

# To Me Tony (تو میتونی)

A minimalist, AI-powered Persian word guessing game inspired by Contexto.

View app in AI Studio: https://ai.studio/apps/drive/1eEEy2gmd4zZ2kLRixhts2BFRwlAcRtgR

![Game Screenshot](https://via.placeholder.com/800x400?text=To+Me+Tony+Game+Preview)

##  About

**To Me Tony** ("You Can Do It") is a word association game where the goal is to find a secret Persian word. Unlike traditional games based on spelling, this game uses Artificial Intelligence to rank your guesses based on **semantic similarity** and context.

For example, if the secret word is "Apple" (سیب), guessing "Tree" (درخت) might rank closely because they appear together often in Persian texts, even if they aren't spelled alike.

##  Features

-   **AI-Powered Ranking:** Uses Google Gemini to calculate how semantically close your guess is to the secret word.
-   **Persian Aesthetic:** Fully RTL interface featuring "Kashi" (tile) style design, turquoise/gold color palette, and the *Lalezar* font.
-   **Smart Hints:** stuck? Get a hint that reveals a word near Rank #100 (or closer) to guide you without spoiling the answer.
-   **Dynamic Feedback:**
    -   🟩 **Green:** Close match (Rank 1-200)
    -   🟨 **Yellow:** Medium match (Rank 201-1000)
    -   🟥 **Red:** Far match (Rank 1000+)
-   **Statistics:** Track your win rate, current streak, and average guesses.
-   **Login System:** Simple email-based verification to save your stats (Mock implementation).
-   **Modern UI:** Glassmorphism effects, floating controls, and smooth animations.

##  Tech Stack

-   **Frontend:** React, TypeScript, Vite
-   **Styling:** Tailwind CSS
-   **AI Model:** Google Gemini Pro
-   **Fonts:** Noto Sans Arabic, Lalezar

---

##  Run Locally

This contains everything you need to run the app locally.

**Prerequisites:**
-   Node.js (v16+)
-   A Google Gemini API Key

### Steps

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a file named `.env.local` in the root directory.
    Set the `VITE_GEMINI_API_KEY` to your Gemini API key:
    
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run the app:**
    ```bash
    npm run dev
    ```

4.  Open your browser and visit `http://localhost:5173`.

##  How to Play

1.  Type a Persian word in the input box.
2.  Press **Enter** or the **Send** button.
3.  Look at the **Rank**:
    -   **Rank 1** is the secret word!
    -   Lower numbers mean you are getting closer.
4.  Use the **Hint** button if you get stuck.
5.  Have fun!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

[MIT](LICENSE)
