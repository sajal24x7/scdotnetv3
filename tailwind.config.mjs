/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Theme
        bgLight: 'rgb(var(--color-bg))',
        bgSecondary: 'rgb(var(--color-bg-secondary))',
        textPrimary: 'rgb(var(--color-text-primary))',
        textSecondary: 'rgb(var(--color-text-secondary))',
        accent: 'rgb(var(--color-accent))',
        borderColor: 'rgb(var(--color-border))',
        
        // Dark Theme
        bgDark: 'rgb(var(--color-bg))',
        bgSecondaryDark: 'rgb(var(--color-bg-secondary))',
        textPrimaryDark: 'rgb(var(--color-text-primary))',
        textSecondaryDark: 'rgb(var(--color-text-secondary))',
        borderColorDark: 'rgb(var(--color-border))',
        
        // Semantic Colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      spacing: {
        '3xs': '0.25rem',
        '2xs': '0.5rem',
        'xs': '0.75rem',
        's': '1rem',
        'm': '1.5rem',
        'l': '2rem',
        'xl': '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
        '4xl': '8rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.textPrimary'),
            a: {
              color: theme('colors.accent'),
              '&:hover': {
                color: theme('colors.accent'),
              },
            },
            h1: {
              color: theme('colors.textPrimary'),
            },
            h2: {
              color: theme('colors.textPrimary'),
            },
            h3: {
              color: theme('colors.textPrimary'),
            },
            h4: {
              color: theme('colors.textPrimary'),
            },
            h5: {
              color: theme('colors.textPrimary'),
            },
            h6: {
              color: theme('colors.textPrimary'),
            },
            strong: {
              color: theme('colors.textPrimary'),
            },
            code: {
              color: theme('colors.textPrimary'),
            },
            figcaption: {
              color: theme('colors.textSecondary'),
            },
            blockquote: {
              color: theme('colors.textSecondary'),
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.textPrimaryDark'),
            a: {
              color: theme('colors.accent'),
              '&:hover': {
                color: theme('colors.accent'),
              },
            },
            h1: {
              color: theme('colors.textPrimaryDark'),
            },
            h2: {
              color: theme('colors.textPrimaryDark'),
            },
            h3: {
              color: theme('colors.textPrimaryDark'),
            },
            h4: {
              color: theme('colors.textPrimaryDark'),
            },
            h5: {
              color: theme('colors.textPrimaryDark'),
            },
            h6: {
              color: theme('colors.textPrimaryDark'),
            },
            strong: {
              color: theme('colors.textPrimaryDark'),
            },
            code: {
              color: theme('colors.textPrimaryDark'),
            },
            figcaption: {
              color: theme('colors.textSecondaryDark'),
            },
            blockquote: {
              color: theme('colors.textSecondaryDark'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
} 