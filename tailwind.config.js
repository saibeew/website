// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0EF2B1",
        secondary: "#5B8CFF",
        accent: "#00EF6B",
        warning: "#FFB800",
        danger: "#FF4B4B",
        background: "#05070A", // Darkest shade for fallback
        surface: "#1A1F2B",
        "text-heading": "#F8FAFC",
        "text-body": "#9CA3AF",
        "text-main": "#FFFFFF", // Keeping for backward compatibility
        "text-muted": "#9CA3AF"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear'
      }
    }
  },
  plugins: []
};
