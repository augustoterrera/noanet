/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Mulish', 'Museo Sans', 'system-ui', '-apple-system', 'sans-serif'],
        body:    ['Mulish', 'Museo Sans', 'system-ui', '-apple-system', 'sans-serif'],
        inter:   ['Inter', 'system-ui', 'sans-serif'],
        dm:      ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        plum: {
          50:  '#f9f2fb',
          100: '#efdff2',
          200: '#dbb5e1',
          300: '#bd7ec9',
          400: '#9d4aab',
          500: '#7a2288',
          600: '#6b1f75',
          700: '#5a1a63',
          800: '#3e1545',
          900: '#2a0e2f',
          950: '#1a0a1f',
        },
        coral: {
          DEFAULT: '#ef3d3a',
          bright:  '#ff5754',
          soft:    '#ffe4e3',
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
