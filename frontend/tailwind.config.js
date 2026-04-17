/** @type {import(''tailwindcss'').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#fcfbf7",
        surface: "#ffffff",
        panel: "#f2efe8",
        line: "#171717",
        gold: "#7a5c3e",
        goldSoft: "#a27b52",
        pearl: "#171717",
        smoke: "#6a665f"
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"]
      }
    }
  },
  plugins: []
};
