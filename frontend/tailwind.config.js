/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#dbf0ff",
          200: "#b9e2ff",
          300: "#85cdff",
          400: "#42adff",
          500: "#178bf6",
          600: "#066edb",
          700: "#0259b1",
          800: "#054b91",
          900: "#0a4079",
        },
        pitch: {
          50: "#f0fbf3",
          100: "#dcf6e2",
          200: "#bbecc8",
          300: "#88dba1",
          400: "#4ec173",
          500: "#28a356",
          600: "#1a8443",
          700: "#176a39",
          800: "#175432",
          900: "#14452b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
