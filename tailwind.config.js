/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#0d1117",
        steel: "#18202d",
        panel: "#101722",
        signal: "#37d9a4",
        amber: "#f5c451",
        iris: "#7c87ff"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(55, 217, 164, 0.16)",
        panel: "0 18px 55px rgba(3, 7, 18, 0.38)"
      }
    }
  },
  plugins: []
};
