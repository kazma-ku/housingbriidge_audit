/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // You can add custom HousingBridge brand colors here later
      colors: {
        brand: {
          blue: "#2563eb",
          slate: "#1e293b",
        },
      },
    },
  },
  plugins: [],
};
