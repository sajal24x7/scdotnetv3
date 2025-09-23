import typography from '@tailwindcss/typography';

const proseHighlight = 'linear-gradient(to bottom, transparent 0%, transparent 55%, var(--link-highlight) 55%, var(--link-highlight) 100%)';
const proseHighlightHover = 'linear-gradient(to bottom, transparent 0%, transparent 55%, var(--link-highlight-hover) 55%, var(--link-highlight-hover) 100%)';

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

        // Shared component colors
        tag: '#8b5cf6',
        'tag-hover': '#7c3aed',
        'tag-dark': '#a78bfa',
        'tag-dark-hover': '#c4b5fd',
        category: '#ca8a04',
        'category-border': '#eab308',
        'category-dark': '#fbbf24',
        'category-dark-border': '#f59e0b',
      },
      typography: (theme) => {
        const serifHeading = {
          color: theme('colors.textPrimary'),
          fontFamily: theme('fontFamily.serif').join(', '),
          fontWeight: '600',
          lineHeight: '1.25',
        };

        return {
          DEFAULT: {
            css: {
              maxWidth: '65ch',
              color: theme('colors.textPrimary'),
              fontFamily: theme('fontFamily.sans').join(', '),
              lineHeight: '1.6',
              fontSize: 'var(--text-normal)',
              '--tw-prose-body': theme('colors.textPrimary'),
              '--tw-prose-headings': theme('colors.textPrimary'),
              '--tw-prose-links': 'inherit',
              '--tw-prose-bold': theme('colors.textPrimary'),
              '--tw-prose-quotes': theme('colors.textSecondary'),
              '--tw-prose-hr': theme('colors.borderColor'),
              a: {
                color: 'inherit',
                textDecoration: 'none',
                borderRadius: '0.25em',
                padding: '0.1em 0.2em',
                margin: '-0.1em -0.2em',
                backgroundImage: proseHighlight,
                backgroundSize: '100% 100%',
                transition: 'background 0.2s ease, color 0.2s ease',
              },
              'a:hover': {
                backgroundImage: proseHighlightHover,
              },
              h1: {
                ...serifHeading,
                fontSize: 'var(--text-huge)',
              },
              h2: {
                ...serifHeading,
                fontSize: 'var(--text-large)',
              },
              h3: {
                ...serifHeading,
                fontSize: 'var(--text-large)',
                fontWeight: '500',
              },
              h4: {
                ...serifHeading,
                fontSize: 'var(--text-normal)',
                fontWeight: '500',
              },
              h5: {
                ...serifHeading,
                fontSize: 'var(--text-normal)',
                fontWeight: '500',
              },
              h6: {
                ...serifHeading,
                fontSize: 'var(--text-normal)',
                fontWeight: '500',
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
                borderLeftColor: theme('colors.borderColor'),
              },
            },
          },
          dark: {
            css: {
              color: theme('colors.textPrimaryDark'),
              fontFamily: theme('fontFamily.sans').join(', '),
              '--tw-prose-body': theme('colors.textPrimaryDark'),
              '--tw-prose-headings': theme('colors.textPrimaryDark'),
              '--tw-prose-links': 'inherit',
              '--tw-prose-bold': theme('colors.textPrimaryDark'),
              '--tw-prose-quotes': theme('colors.textSecondaryDark'),
              '--tw-prose-hr': theme('colors.borderColorDark'),
              a: {
                color: 'inherit',
                textDecoration: 'none',
                borderRadius: '0.25em',
                padding: '0.1em 0.2em',
                margin: '-0.1em -0.2em',
                backgroundImage: proseHighlight,
                backgroundSize: '100% 100%',
                transition: 'background 0.2s ease, color 0.2s ease',
              },
              'a:hover': {
                backgroundImage: proseHighlightHover,
              },
              h1: {
                ...serifHeading,
                color: theme('colors.textPrimaryDark'),
                fontSize: 'var(--text-huge)',
              },
              h2: {
                ...serifHeading,
                color: theme('colors.textPrimaryDark'),
                fontSize: 'var(--text-large)',
              },
              h3: {
                ...serifHeading,
                color: theme('colors.textPrimaryDark'),
                fontSize: 'var(--text-large)',
                fontWeight: '500',
              },
              h4: {
                ...serifHeading,
                color: theme('colors.textPrimaryDark'),
                fontSize: 'var(--text-normal)',
                fontWeight: '500',
              },
              h5: {
                ...serifHeading,
                color: theme('colors.textPrimaryDark'),
                fontSize: 'var(--text-normal)',
                fontWeight: '500',
              },
              h6: {
                ...serifHeading,
                color: theme('colors.textPrimaryDark'),
                fontSize: 'var(--text-normal)',
                fontWeight: '500',
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
                borderLeftColor: theme('colors.borderColorDark'),
              },
            },
          },
        };
      },
    },
  },
  plugins: [typography],
};
