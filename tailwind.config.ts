import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light theme
        parchment: {
          50: "#FDFCF8",
          100: "#F9F6F0",
          200: "#F0EAE0",
          300: "#E2D8CA",
        },
        // Accent - warm gold
        gold: {
          400: "#D4A929",
          500: "#B8860B",
          600: "#9A6E00",
        },
        // Dark theme
        onyx: {
          800: "#1E1C1A",
          900: "#161412",
          950: "#0F0E0C",
        },
      },
      fontFamily: {
        arabic: ["'Amiri'", "'Noto Serif Arabic'", "serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        book: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04), 4px 0 0 0 rgba(184,134,11,0.15)",
        "book-hover":
          "0 20px 40px -8px rgba(0,0,0,0.15), 0 8px 16px -4px rgba(0,0,0,0.08), 6px 0 0 0 rgba(184,134,11,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
