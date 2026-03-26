import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        panelStrong: "rgb(var(--panel-strong) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
          warm: "rgb(var(--accent-warm) / <alpha-value>)",
          glow: "rgb(var(--accent-glow) / <alpha-value>)",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 30px 80px rgba(32, 255, 201, 0.10)",
        card: "0 18px 60px rgba(7, 10, 24, 0.38)",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
        pulseSoft: "pulseSoft 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0px, 0px, 0px) scale(1)" },
          "50%": { transform: "translate3d(10px, -14px, 0px) scale(1.03)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.95" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
