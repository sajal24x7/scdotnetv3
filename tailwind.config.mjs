/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Bitter', 'ui-serif', 'Georgia', 'serif'],
      },
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
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.textPrimary'),
            fontFamily: theme('fontFamily.sans').join(', '),
            a: {
              color: theme('colors.accent'),
              '&:hover': {
                color: theme('colors.accent'),
              },
            },
            h1: {
              color: theme('colors.textPrimary'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h2: {
              color: theme('colors.textPrimary'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h3: {
              color: theme('colors.textPrimary'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h4: {
              color: theme('colors.textPrimary'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h5: {
              color: theme('colors.textPrimary'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h6: {
              color: theme('colors.textPrimary'),
              fontFamily: theme('fontFamily.serif').join(', '),
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
            fontFamily: theme('fontFamily.sans').join(', '),
            a: {
              color: theme('colors.accent'),
              '&:hover': {
                color: theme('colors.accent'),
              },
            },
            h1: {
              color: theme('colors.textPrimaryDark'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h2: {
              color: theme('colors.textPrimaryDark'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h3: {
              color: theme('colors.textPrimaryDark'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h4: {
              color: theme('colors.textPrimaryDark'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h5: {
              color: theme('colors.textPrimaryDark'),
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            h6: {
              color: theme('colors.textPrimaryDark'),
              fontFamily: theme('fontFamily.serif').join(', '),
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