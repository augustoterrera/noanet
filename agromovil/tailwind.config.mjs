/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Mulish', 'system-ui', '-apple-system', 'sans-serif'],
        body:    ['Mulish', 'system-ui', '-apple-system', 'sans-serif'],
        serif:   ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        green: {
          50:  '#ecf9ec',
          100: '#cceecb',
          200: '#a3dfa3',
          300: '#73c474',
          400: '#4d9e4e',
          500: '#356b36',
          600: '#2a572b',
          700: '#1f4220',
          800: '#152e15',
          900: '#0d1f0d',
          950: '#061206',
        },
        lime: {
          DEFAULT: '#a8f53d',
          bright:  '#c0ff57',
          soft:    '#e8ffc4',
        },
        ink: {
          0:   '#ffffff',
          50:  '#fafafa',
          100: '#f3f3f5',
          200: '#e7e7ec',
          300: '#cbcbd3',
          400: '#9b9ba6',
          500: '#6b6b76',
          600: '#4a4a53',
          700: '#303038',
          800: '#1b1b22',
          900: '#0f0f14',
          950: '#07070a',
        },
      },
      maxWidth: {
        container: '1240px',
      },
      screens: {
        'xs': '520px',
        'nav': '900px',
      },
    },
  },
  plugins: [],
};
