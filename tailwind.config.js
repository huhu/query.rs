/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        darkTextPrimary: "#e3e3e3",
        darkHoverColor: "#3f3f4666",
        darkBgPrimary: "#121213",
      },
    },
  },
  plugins: [],
};
