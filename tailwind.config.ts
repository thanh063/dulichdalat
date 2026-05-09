import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        pine: {
          900: "var(--pine-900)",
          700: "var(--pine-700)",
          500: "var(--pine-500)",
        },
        mist: {
          300: "var(--mist-300)",
          100: "var(--mist-100)",
        },
        bloom: "var(--bloom)",
        gold: "var(--gold)",
        earth: "var(--earth)",
        cream: "var(--cream)",
        charcoal: "var(--charcoal)",
        smoke: "var(--smoke)",
      },
      fontFamily: {
        sans: ["Jost", "sans-serif"],
        display: ["Cormorant Garamond", "serif"],
        heading: ["DM Serif Display", "serif"],
        accent: ["Playfair Display", "serif"],
      },
    },
  },
};

export default config;