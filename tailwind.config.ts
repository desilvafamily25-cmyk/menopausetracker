import type { Config } from "tailwindcss";

// Pause Sleep brand colours
// Cream:      warm page background      #FBF4EC
// Brown:      warm readable foreground  #3B241C
// Rose:       primary buttons/links     #C95F56
// Terracotta: grounded accent           #A65F3E
// Sage:       calm health support tone  #7F9B8E

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Darken the default gray scale for better readability
        gray: {
          50:  "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#6b7280",  // was #9ca3af — much darker
          500: "#4b5563",  // was #6b7280 — much darker
          600: "#374151",
          700: "#1f2937",
          800: "#111827",
          900: "#0f172a",
        },
        cream: {
          DEFAULT: "#FBF4EC",
          50: "#FFFDFC",
          100: "#FBF4EC",
          200: "#F5E5D9",
          300: "#ECD0BE",
          400: "#DFAE94",
          500: "#C98967",
          600: "#A65F3E",
          700: "#7C442D",
          800: "#553023",
          900: "#3B241C",
        },
        blush: {
          DEFAULT: "#F8E7E1",
          50: "#FFF8F5",
          100: "#FCEFEA",
          200: "#F8E7E1",
          300: "#F0C8BE",
          400: "#E3A196",
          500: "#D57B72",
          600: "#C95F56",
          700: "#A94A42",
          800: "#813830",
          900: "#5D2922",
        },
        brown: {
          DEFAULT: "#3B241C",
          50: "#F8F1EC",
          100: "#EDDCD2",
          200: "#DABAA8",
          300: "#C2967B",
          400: "#A97756",
          500: "#85583C",
          600: "#67432F",
          700: "#503326",
          800: "#3B241C",
          900: "#271712",
        },
        // Primary = soft rose/coral
        primary: {
          DEFAULT: "#C95F56",
          50:  "#FFF8F5",
          100: "#FCEFEA",
          200: "#F8DAD2",
          300: "#EFB9AF",
          400: "#DF8D83",
          500: "#C95F56",
          600: "#AC4941",
          700: "#89382F",
          800: "#632A23",
          900: "#3B241C",
        },
        // Teal = softened sage-green support tone
        teal: {
          DEFAULT: "#7F9B8E",
          50:  "#F3F7F4",
          100: "#E3EDE7",
          200: "#C8DCCE",
          300: "#A6C3B1",
          400: "#7F9B8E",
          500: "#668879",
          600: "#4F6B5E",
          700: "#3C5047",
          800: "#2B3A34",
          900: "#1B2722",
        },
        // Sage = quieter neutral panel tint
        sage: {
          DEFAULT: "#B9B5A0",
          50:  "#F8F6EF",
          100: "#EFEBDD",
          200: "#DDD6BE",
          300: "#CBC19F",
          400: "#B9B5A0",
          500: "#9C9276",
          600: "#7D735D",
          700: "#5F5747",
          800: "#433D32",
          900: "#29251F",
        },
        // Coral = terracotta accent
        coral: {
          DEFAULT: "#A65F3E",
          50:  "#FBF0EA",
          100: "#F4DBCF",
          200: "#E7B89E",
          300: "#D38E67",
          400: "#BE724C",
          500: "#A65F3E",
          600: "#884B31",
          700: "#693925",
          800: "#4C2B1E",
          900: "#321C14",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "sans-serif"],
        heading: ["Cormorant Garamond", "Georgia", "serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        mono: ["DM Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
