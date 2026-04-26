import type { Config } from "tailwindcss";

// Pause Sleep brand colours — derived from logo
// Navy/indigo: the main dark circle  #1B1A44
// Forest teal: the wave accent       #3D6B5B
// Sage:        muted background tone #8A9E97
// Cream:       warm off-white        #F7F5F0

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
        // Primary = Pause Sleep navy/indigo
        primary: {
          DEFAULT: "#1B1A44",
          50:  "#EEEDF5",
          100: "#CCCAEB",
          200: "#9B97D6",
          300: "#6D69BE",
          400: "#3F3BA6",
          500: "#1B1A44",
          600: "#161538",
          700: "#10102A",
          800: "#0B0A1C",
          900: "#05050E",
        },
        // Teal = forest teal wave colour from logo
        teal: {
          DEFAULT: "#3D6B5B",
          50:  "#EBF2EF",
          100: "#C8DEDA",
          200: "#9EC4BB",
          300: "#74AB9B",
          400: "#4A917C",
          500: "#3D6B5B",
          600: "#315649",
          700: "#254037",
          800: "#182B25",
          900: "#0C1512",
        },
        // Sage = the muted grey-green from logo background
        sage: {
          DEFAULT: "#8A9E97",
          50:  "#F4F6F5",
          100: "#E2EAE7",
          200: "#C5D4CE",
          300: "#A8BFB6",
          400: "#8A9E97",
          500: "#728E86",
          600: "#5A7269",
          700: "#43564E",
          800: "#2C3934",
          900: "#151C1A",
        },
        // Coral = warm call-to-action accent
        coral: {
          DEFAULT: "#D4675A",
          50:  "#FBF0EE",
          100: "#F5D5D2",
          200: "#ECADA7",
          300: "#E2857C",
          400: "#D4675A",
          500: "#BF4E41",
          600: "#993E34",
          700: "#732E26",
          800: "#4D1F19",
          900: "#260F0C",
        },
      },
      fontFamily: {
        sans: ["Inter", "Open Sans", "sans-serif"],
        heading: ["Poppins", "Inter", "sans-serif"],
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
