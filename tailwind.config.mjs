/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'ui-serif', 'Georgia', 'serif'],
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
            maxWidth: '65ch', /* Optimal line length for reading */
            lineHeight: '1.6',
            fontSize: 'var(--text-normal)',
            a: {
              color: 'inherit !important',
              textDecoration: 'underline',
              textDecorationColor: 'var(--random-link-color, #0066cc)',
              textDecorationThickness: '0.15em',
              textUnderlineOffset: '0.2em',
              transition: 'text-decoration-color 0.3s ease, filter 0.2s ease',
              '&:hover': {
                filter: 'brightness(1.2)',
              },
              // Exclude tags and categories from general link styling
              '&.tag, &.category-display': {
                color: 'inherit !important',
                textDecoration: 'none !important',
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
              color: 'inherit !important',
              textDecoration: 'underline',
              textDecorationColor: 'var(--random-link-color, #0066cc)',
              textDecorationThickness: '0.15em',
              textUnderlineOffset: '0.2em',
              transition: 'text-decoration-color 0.3s ease, filter 0.2s ease',
              '&:hover': {
                filter: 'brightness(1.2)',
              },
              // Exclude tags and categories from general link styling
              '&.tag, &.category-display': {
                color: 'inherit !important',
                textDecoration: 'none !important',
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