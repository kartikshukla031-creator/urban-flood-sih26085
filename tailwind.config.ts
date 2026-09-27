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
        gov: {
          navy: "#0f172a",
          dark: "#1e293b",
          blue: "#2563eb",
          border: "#e2e8f0",
          card: "#ffffff",
          muted: "#64748b",
          subtle: "#f8fafc",
          surface: "#f1f5f9",
          warning: "#d97706",
          danger: "#dc2626",
          success: "#16a34a",
        }
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
};
export default config;
