/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Legacy support (for gradual migration)
        'beatcrest-teal': '#14b8a6',
        'beatcrest-teal-light': '#5eead4',
        'beatcrest-teal-dark': '#0d9488',
        'beatcrest-blue': '#3b82f6',
        'beatcrest-blue-light': '#60a5fa',
        'beatcrest-blue-dark': '#2563eb',
        'beatcrest-orange': '#f97316',
        'beatcrest-orange-light': '#fb923c',
        'beatcrest-orange-dark': '#ea580c',
        'beatcrest-navy': '#1e3a8a',
        'beatcrest-navy-light': '#1e40af',
        'beatcrest-navy-dark': '#1e293b',
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        magenta: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Logo-based gradients - matching exact logo colors
        'beatcrest-gradient': 'linear-gradient(135deg, #3B82F6 0%, #4A9B9D 25%, #F97316 50%, #1E3A8A 75%, #3B82F6 100%)',
        'beatcrest-gradient-vertical': 'linear-gradient(180deg, #F97316 0%, #3B82F6 25%, #4A9B9D 50%, #1E3A8A 75%, #3B82F6 100%)',
        'beatcrest-hexagon': 'linear-gradient(135deg, #3B82F6 0%, #F97316 33%, #1E3A8A 66%, #FFFFFF 100%)',
        'beatcrest-subtle': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(74, 155, 157, 0.1) 25%, rgba(249, 115, 22, 0.1) 50%, rgba(30, 58, 138, 0.1) 75%, rgba(59, 130, 246, 0.1) 100%)',
      },
      backgroundColor: {
        'beatcrest-bg': 'rgba(74, 155, 157, 0.05)', // Subtle teal background
        'beatcrest-surface': 'rgba(255, 255, 255, 0.95)', // Slightly transparent white
        'beatcrest-dark': '#1A202C', // Dark navy background like HMS VOYAGER
        'beatcrest-dark-surface': 'rgba(30, 41, 59, 0.4)', // Dark surface with translucency
        'beatcrest-dark-card': 'rgba(26, 32, 44, 0.7)', // Dark glass card with blur
      },
    },
  },
  plugins: [],
} 