import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#4A2BC2',
          'purple-hover': '#3D23A0',
          'purple-light': '#EDE9FA',
        },
        saffron: {
          DEFAULT: '#C47D00',
          hover: '#A06600',
          light: '#FFF8E7',
        },
        india: {
          green: '#128937',
          'green-hover': '#0E6B2C',
          'green-light': '#E8F5ED',
        },
        danger: {
          DEFAULT: '#DB372D',
          hover: '#B82D25',
          light: '#FDEEEE',
        },
        info: {
          cyan: '#13C2C2',
          'cyan-hover': '#0FA8A8',
          'cyan-light': '#E6FCFC',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#868E96',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      spacing: {
        gutter: '24px',
      },
      minHeight: {
        header: '64px',
      },
      width: {
        sidebar: '280px',
      },
      maxWidth: {
        container: '1440px',
      },
      borderRadius: {
        DEFAULT: '6px',
        card: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config;
