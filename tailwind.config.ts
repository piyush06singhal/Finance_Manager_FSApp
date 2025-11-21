import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#277C78',
          light: '#82C9D7',
          dark: '#1F5F5B',
        },
        secondary: {
          DEFAULT: '#F2CDAC',
          light: '#F8EDE3',
        },
        accent: {
          red: '#C94736',
          yellow: '#F2C94C',
          cyan: '#82C9D7',
          navy: '#626070',
          purple: '#826CB0',
          turquoise: '#597C7C',
          brown: '#93674F',
          magenta: '#934F6F',
          blue: '#3F82B2',
          navyGrey: '#97A0AC',
          armyGreen: '#7F9161',
          gold: '#CAB361',
          orange: '#BE6C49',
        },
        grey: {
          900: '#201F24',
          500: '#696868',
          300: '#B3B3B3',
          100: '#F8F4F0',
        },
        beige: {
          500: '#98908B',
          100: '#F8F4F0',
        },
      },
    },
  },
  plugins: [],
}
export default config
