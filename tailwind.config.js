/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,ts,tsx}", "./src/**/*.{js,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        sky: {
          accent: "#4b8eef",
          indigo:  "#818cf8",
          cyan:    "#22d3ee",
        },
        night: {
          900: "#080d22",
          800: "#0d1535",
          700: "#111836",
        },
      },
    },
  },
  plugins: [],
};
