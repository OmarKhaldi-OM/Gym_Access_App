/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          bg: '#232323',
          panel: '#2E2E2E',
          hover: '#383838',
          line: '#404040',
        },
        coral: {
          DEFAULT: '#FF7A5C',
        },
        teal: {
          DEFAULT: '#5FBF9F',
        },
        text: {
          primary: '#F0F0F0',
          muted: '#B8B8B8',
        },
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
