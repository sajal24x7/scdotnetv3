// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import { remarkWikilinks } from './src/utils/remarkWikilinks.ts';

// Converts soft line breaks (single newlines) to <br> nodes, preserving
// line-by-line structure in blockquotes used for poetry and similar content.
function remarkBreaks() {
  return (tree) => {
    function visit(node) {
      if (!node.children) return;
      let i = 0;
      while (i < node.children.length) {
        const child = node.children[i];
        if (child.type === 'text' && child.value.includes('\n')) {
          const segments = child.value.split('\n');
          const replacement = [];
          segments.forEach((segment, j) => {
            if (j > 0) replacement.push({ type: 'break' });
            if (segment) replacement.push({ type: 'text', value: segment });
          });
          if (replacement.length > 1) {
            node.children.splice(i, 1, ...replacement);
            i += replacement.length;
          } else {
            i++;
          }
        } else {
          visit(child);
          i++;
        }
      }
    }
    visit(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://sajalchoudhary.net',
  // Astro 7 changed the default from `true` to `'jsx'` (JSX-style whitespace
  // stripping). Pin the v6 behavior so the upgrade is output-identical;
  // revisit `'jsx'` as a separate change.
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/navigation-demo/') &&
        !page.includes('/search/'),
    }),
  ],
  markdown: {
    // Astro 7 defaults to the Sätteri (Rust) markdown pipeline. This site's
    // wikilinks and poetry line-breaks are remark plugins, so opt back into
    // the remark/rehype pipeline explicitly via @astrojs/markdown-remark.
    processor: unified({
      remarkPlugins: [remarkWikilinks, remarkBreaks],
    }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true
    }
  }
});
