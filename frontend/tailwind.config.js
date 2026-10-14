/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    fontSize: {
      xs: ['13px', { lineHeight: '1.45' }],
      sm: ['15px', { lineHeight: '1.5' }],
      base: ['17px', { lineHeight: '1.55' }],
      lg: ['20px', { lineHeight: '1.45' }],
      xl: ['23px', { lineHeight: '1.35' }],
      '2xl': ['27px', { lineHeight: '1.25' }],
      '3xl': ['33px', { lineHeight: '1.2' }],
      '4xl': ['39px', { lineHeight: '1.15' }],
      '5xl': ['49px', { lineHeight: '1.1' }],
      '6xl': ['62px', { lineHeight: '1.05' }],
    },
    extend: {
      colors: {
        graphite: {
          bg: '#E8E9DE',
          panel: '#F3F3EB',
          hover: '#D9DCCD',
          line: '#C6CABB',
        },
        coral: {
          DEFAULT: '#CCF05A',
        },
        teal: {
          DEFAULT: '#536D35',
        },
        text: {
          primary: '#191C18',
          muted: '#646B60',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Sora', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
