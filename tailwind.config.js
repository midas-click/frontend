/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  safelist: [
    { pattern: /bg-(purple|yellow|orange|green|red|gray|pink|teal|indigo|blue)-(50|100)/ },
    { pattern: /text-(purple|yellow|orange|green|red|gray|pink|teal|indigo|blue)-(700)/ },
    { pattern: /border-(purple|yellow|orange|green|red|gray|pink|teal|indigo|blue)-(200)/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: "#F3EEFF",
          100: "#E8E0FF",
          200: "#D1C2FF",
          300: "#B49DF6",
          400: "#9B8AFB",
          500: "#7C6AED",
          600: "#6941C6",
          700: "#55309E",
          800: "#3C1D7A",
          900: "#1A1A2E",
        },
        accent: {
          red: "#F04438",
          purple: "#6941C6",
          orange: "#F97316",
          green: "#22C55E",
          blue: "#3B6FE8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F9FAFB",
          muted: "#F3EEFF",
        },
        border: {
          DEFAULT: "#F2F4F7",
        },
        text: {
          primary: "#101828",
          secondary: "#667085",
          muted: "#98A2B3",
        },
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        tag: "6px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
      },
      fontSize: {
        'page-title': ['20px', { fontWeight: '600' }],
        'metric': ['28px', { fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
