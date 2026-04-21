/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #6366f1)',
          50: 'color-mix(in srgb, var(--color-primary) 10%, white)',
          100: 'color-mix(in srgb, var(--color-primary) 20%, white)',
          200: 'color-mix(in srgb, var(--color-primary) 30%, white)',
          500: 'var(--color-primary, #6366f1)',
          600: 'color-mix(in srgb, var(--color-primary) 90%, black)',
          700: 'color-mix(in srgb, var(--color-primary) 80%, black)',
        },
      },
    },
  },
  plugins: [],
}
