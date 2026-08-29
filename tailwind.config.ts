import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        eoc: {
          dark: "#0a0f1d",
          card: "#111827",
          border: "#1f293d",
          accent: "#38bdf8",
          warning: "#f59e0b",
          danger: "#ef4444",
          success: "#10b981",
          purple: "#8b5cf6",
        }
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "monospace"],
      }
    },
  },
  plugins: [],
};
export default config;
