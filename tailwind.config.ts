import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--canvas)",
        foreground: "var(--text)",
        kaduo: {
          canvas: "#FFFFFF",
          surface: "#F5E3D6",
          border: "#E7E5E4",
          primary: "#FF7A1A",
          "primary-hover": "#E8660A",
          focus: "#FF7A1A",
          "text-main": "#0B0D2C",
          "text-muted": "#6B6B73",
        },
        safety: {
          allergy: "#EF4444",
          "fall-risk": "#F59E0B",
          normal: "#10B981",
          info: "#0284C7",
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        clinical: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'clinical-lg': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'glow-cyan': '0 0 16px rgba(6, 182, 212, 0.3)',
        'pulse-danger': '0 0 16px rgba(239, 68, 68, 0.45)',
        'pulse-warning': '0 0 16px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
};
export default config;
