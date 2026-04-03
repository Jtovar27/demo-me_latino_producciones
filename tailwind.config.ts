import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "system-ui", "sans-serif"],
        display: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
      },
      colors: {
        sand: "#EAE1D6",
        beige: "#D7C6B2",
        terracotta: "#A56E52",
        brown: {
          DEFAULT: "#5B4638",
          deep: "#5B4638",
          light: "#7A5E4E",
        },
        charcoal: "#2A2421",
        ivory: "#F7F3EE",
        "warm-white": "#FDFAF7",
      },
      letterSpacing: {
        "widest-xl": "0.2em",
        "widest-2xl": "0.3em",
      },
      lineHeight: {
        "extra-tight": "1.05",
        tight: "1.15",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
    },
  },
  plugins: [],
};

export default config;
