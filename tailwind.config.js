/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#E2E8F0",
          100: "#CBD5E1",
          200: "#94A3B8",
          300: "#64748B",
          400: "#475569",
          500: "#334155",
          600: "#1E293B",
          700: "#1E293B",
          800: "#0F172A",
          900: "#020617",
          950: "#020617",
        },
        gold: {
          50: "#FDFBF4",
          100: "#FBF3D9",
          200: "#F5E4A6",
          300: "#EBCD6B",
          400: "#E0B844",
          500: "#D4AF37",
          600: "#B8912A",
          700: "#926D23",
          800: "#795623",
          900: "#674722",
        },
        profit: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        loss: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #F5E4A6 50%, #D4AF37 100%)",
        "glass-dark":
          "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
        "card-glow":
          "radial-gradient(circle at top left, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(212, 175, 55, 0.3)",
        "gold-sm": "0 0 10px rgba(212, 175, 55, 0.2)",
        profit: "0 0 20px rgba(16, 185, 129, 0.3)",
        loss: "0 0 20px rgba(239, 68, 68, 0.3)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.2)",
      },
      animation: {
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "pulse-profit": "pulseProfit 1.5s ease-in-out infinite",
        "pulse-loss": "pulseLoss 1.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212, 175, 55, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(212, 175, 55, 0)" },
        },
        pulseProfit: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(16, 185, 129, 0)" },
        },
        pulseLoss: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(239, 68, 68, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
