/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#0a0a0a",
        steel: "#f7f7f2",
        panel: "#ffffff",
        signal: "#f2c94c",
        amber: "#f2c94c",
        iris: "#0e2431"
      },
      boxShadow: {
        glow: "0 18px 44px rgba(10, 10, 10, 0.12)",
        panel: "0 18px 44px rgba(10, 10, 10, 0.12)"
      }
    }
  },
  plugins: []
};
