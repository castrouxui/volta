/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'volta-electric': '#6366F1',
        'volta-midnight': '#0F172A',
        'volta-pure': '#FFFFFF',
        'volta-spark': '#8B5CF6',
        'volta-charge': '#3B82F6',
        'volta-energy': '#10B981',
      },
    },
  },
  plugins: [],
};
