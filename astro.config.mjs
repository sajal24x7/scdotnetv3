// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

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
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkBreaks],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true
    }
  }
});
