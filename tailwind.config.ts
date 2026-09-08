import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        bangla: ["'Hind Siliguri'", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        bd: {
          green: "#006a4e",
          "green-dark": "#004d39",
          "green-light": "#059669",
          "green-subtle": "#ecfdf5",
          red: "#f42a41",
          "red-light": "#fb7185",
          "red-subtle": "#fff1f2",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "bd-gradient-subtle": "radial-gradient(ellipse at 15% 15%, rgba(0, 106, 78, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 85% 25%, rgba(244, 42, 65, 0.05) 0%, transparent 40%), radial-gradient(circle at 50% 85%, rgba(0, 106, 78, 0.04) 0%, transparent 50%)",
        "bd-gradient-subtle-dark": "radial-gradient(ellipse at 15% 15%, rgba(5, 150, 105, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 85% 25%, rgba(244, 42, 65, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 85%, rgba(5, 150, 105, 0.06) 0%, transparent 50%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.35)" },
          "50%": { boxShadow: "0 0 0 12px hsl(var(--primary) / 0)" },
        },
        "blob": {
          "0%,100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.08)" },
          "66%": { transform: "translate(-24px, 24px) scale(0.94)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "theme-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "theme-slide": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "theme-pop": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "pulse-glow": "pulse-glow 2.4s ease-out infinite",
        "blob": "blob 12s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        "theme-fade": "theme-fade 0.3s ease-out both",
        "theme-slide": "theme-slide 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "theme-pop": "theme-pop 0.25s cubic-bezier(0.16,1,0.3,1) both",
      },
      transitionDuration: {
        "theme": "300ms",
        "theme-slow": "500ms",
      },
      transitionTimingFunction: {
        "theme": "cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;