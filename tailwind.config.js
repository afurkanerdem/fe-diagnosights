/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html,js,svelte,ts}",
  ],  theme: {
    extend: {
      fontFamily: {
        'urbanist': ['Urbanist']  // 'custom' is the class name you'll use
      }
    },
  },
  plugins: [],
}

