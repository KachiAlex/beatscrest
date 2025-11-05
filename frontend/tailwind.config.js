/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Logo-based color palette
        primary: {
          // Muted Teal/Blue-Green (background)
          50: '#e6f5f5',
          100: '#b3e0e0',
          200: '#80cccc',
          300: '#4db8b8',
          400: '#1aa3a3',
          500: '#008f8f', // Primary teal
          600: '#007373',
          700: '#005757',
          800: '#003b3b',
          900: '#001f1f',
        },
        'beatcrest-teal': '#4A9B9D', // Muted teal background
        'beatcrest-teal-light': '#5F9EA0',
        'beatcrest-teal-dark': '#3A7A7C',
        'beatcrest-blue': '#3B82F6', // Bright blue from hexagon
        'beatcrest-blue-light': '#60A5FA',
        'beatcrest-blue-dark': '#2563EB',
        'beatcrest-orange': '#F97316', // Orange from hexagon
        'beatcrest-orange-light': '#FB923C',
        'beatcrest-orange-dark': '#EA580C',
        'beatcrest-navy': '#1E3A8A', // Dark navy blue from hexagon
        'beatcrest-navy-light': '#1E40AF',
        'beatcrest-navy-dark': '#1E293B',
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
      },
    },
  },
  plugins: [],
} 