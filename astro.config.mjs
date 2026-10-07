// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import { remarkWikilinks } from './src/utils/remarkWikilinks.ts';
import { remarkStripLearnBlocks } from './src/utils/learnBlocks.ts';
import { remarkMermaid } from './src/utils/remarkMermaid.ts';
import { rehypeRemoteImages } from './src/utils/rehypeRemoteImages.ts';
import { REMOTE_IMAGE_DOMAINS } from './src/utils/imageDomains.ts';

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
  // Fetch a page's HTML when a link is hovered or focused, so the click
  // navigates from cache.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  // Images on the R2 bucket (post bodies, heroes, galleries, Nordletter
  // covers) are downloaded and optimized at build time. Results are cached in
  // node_modules/.astro, which the Cloudflare Pages build cache keeps.
  image: {
    domains: REMOTE_IMAGE_DOMAINS,
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/search/'),
    }),
  ],
  markdown: {
    // Astro 7 defaults to the Sätteri (Rust) markdown pipeline. This site's
    // wikilinks and poetry line-breaks are remark plugins, so opt back into
    // the remark/rehype pipeline explicitly via @astrojs/markdown-remark.
    processor: unified({
      remarkPlugins: [remarkStripLearnBlocks, remarkMermaid, remarkWikilinks, remarkBreaks],
      rehypePlugins: [rehypeRemoteImages],
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
