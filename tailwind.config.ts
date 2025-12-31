import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f4f5ff",
          100: "#e5e7ff",
          200: "#cbd0ff",
          300: "#a4adff",
          400: "#7680ff",
          500: "#4c54ff",
          600: "#2d31f0",
          700: "#1f23c2",
          800: "#1f218c",
          900: "#1c1f66",
        },
      },
    },
  },
  plugins: [],
};

export default config;
