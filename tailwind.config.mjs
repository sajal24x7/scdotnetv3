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