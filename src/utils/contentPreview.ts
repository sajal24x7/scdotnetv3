import { getCollection } from 'astro:content';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { getContentCategories } from './content';
import { stripLearnBlocks } from './learnBlocks';

export interface ContentPreview {
  title: string;
  description: string;
  category: string;
  slug: string;
  excerpt?: string;
}

// Excerpt budget: enough for the opening paragraphs of a post without
// bloating the per-category preview JSON (500+ entries in the biggest ones).
const EXCERPT_MAX_BLOCKS = 6;
const EXCERPT_MAX_CHARS = 1000;

const EXCERPT_ALLOWED_TAGS = [
  'p', 'br', 'hr', 'em', 'strong', 'b', 'i', 'del', 'a',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
];

// Cut a single over-long block at a sentence boundary, falling back to the
// last whitespace. Cutting markdown mid-syntax is tolerable here — marked
// renders dangling fragments as literal text and sanitize-html cleans up.
function cutBlock(block: string, limit: number): string {
  const slice = block.slice(0, limit);
  const sentenceEnd = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('.\n'));
  if (sentenceEnd > limit * 0.4) {
    return slice.slice(0, sentenceEnd + 1);
  }
  const lastSpace = slice.lastIndexOf(' ');
  return lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
}

function buildExcerptSource(body: string): { markdown: string; truncated: boolean } {
  // Obsidian wiki-links ([[#Modes]], [[Note|Alias]]) would render literally.
  // Ghost-exported posts carry them with escaped brackets (\[\[...\]\]).
  const stripWikiLink = (inner: string) =>
    inner.replace(/^#/, '').split(/\\?\|/).pop() || '';
  const withoutWikiLinks = stripLearnBlocks(body)
    .replace(/\\\[\\\[(.*?)\\\]\\\]/g, (_match, inner: string) => stripWikiLink(inner))
    .replace(/\[\[([^\]]+)\]\]/g, (_match, inner: string) => stripWikiLink(inner));

  const blocks = withoutWikiLinks
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    // MDX import/export statements aren't content.
    .filter((block) => block.length > 0 && !/^(import|export)\s/.test(block));

  // Nordletter editions open (and re-open, after a "---" divider) with the
  // same boilerplate greeting/subscribe/contact paragraphs before the actual
  // edition content starts. Backlinks avoid this by excerpting the text
  // around the link's own position rather than the top of the post; since
  // the hover preview always starts from the top, drop that boilerplate here
  // instead so readers see real content, not the constant intro.
  const NEWSLETTER_BOILERPLATE = [
    /^Hello from my home in Helsinki!/i,
    /^To follow the series,/i,
    /^You can reach out to me by replying/i
  ];
  while (
    blocks.length > 0 &&
    (/^-{3,}$/.test(blocks[0]) || /^\*{3,}$/.test(blocks[0]) ||
      NEWSLETTER_BOILERPLATE.some((pattern) => pattern.test(blocks[0])))
  ) {
    blocks.shift();
  }

  const chosen: string[] = [];
  let chars = 0;
  let truncated = false;

  for (const block of blocks) {
    if (chosen.length >= EXCERPT_MAX_BLOCKS || chars >= EXCERPT_MAX_CHARS) {
      truncated = true;
      break;
    }

    const remaining = EXCERPT_MAX_CHARS - chars;
    if (block.length > remaining && chosen.length > 0) {
      truncated = true;
      break;
    }

    if (block.length > EXCERPT_MAX_CHARS) {
      chosen.push(cutBlock(block, EXCERPT_MAX_CHARS));
      truncated = true;
      break;
    }

    chosen.push(block);
    chars += block.length;
  }

  if (!truncated && chosen.length < blocks.length) {
    truncated = true;
  }

  let markdown = chosen.join('\n\n');

  // Splitting on blank lines can bisect a fenced code block; close any
  // dangling fence so the rest of the excerpt doesn't render as code.
  const fenceCount = (markdown.match(/```/g) || []).length;
  if (fenceCount % 2 === 1) {
    markdown += '\n```';
  }

  return { markdown, truncated };
}

// Render the opening of a post body to sanitized HTML for the hover card.
export function renderExcerptHtml(body: string): string {
  if (!body || !body.trim()) {
    return '';
  }

  const { markdown, truncated } = buildExcerptSource(body);
  if (!markdown) {
    return '';
  }

  let html: string;
  try {
    html = marked.parse(markdown, { async: false }) as string;
  } catch {
    return '';
  }

  const clean = sanitizeHtml(html, {
    allowedTags: EXCERPT_ALLOWED_TAGS,
    allowedAttributes: { a: ['href'] },
    allowedSchemes: ['http', 'https', 'mailto']
  }).trim();

  if (!clean) {
    return '';
  }

  return truncated ? `${clean}<p>…</p>` : clean;
}

// Generate content previews for all posts
export async function generateContentPreviews(): Promise<Map<string, ContentPreview>> {
  const previewMap = new Map<string, ContentPreview>();
  
  try {
    // Get all category collections
    const categories = getContentCategories();
    const allPosts = await Promise.all(categories.map(category => getCollection(category as any)));
    const posts = allPosts.flat();

    for (const post of posts) {
      const postData = post as any;
      if (!postData.data || !postData.data.title) continue;

      const category = postData.data.category || 'notes';
      const slug = postData.id;
      const path = `/${category}/${slug}/`;
      
      // Get description from frontmatter, or use empty string
      const description = postData.data.description || '';
      const excerpt = renderExcerptHtml(typeof postData.body === 'string' ? postData.body : '');

      const preview: ContentPreview = {
        title: postData.data.title,
        description: description,
        category,
        slug
      };

      if (excerpt) {
        preview.excerpt = excerpt;
      }

      previewMap.set(path, preview);
    }
  } catch (error) {
    console.error('Error generating content previews:', error);
  }
  
  return previewMap;
}

// Get preview for a specific path
export async function getPreviewForPath(path: string): Promise<ContentPreview | null> {
  const previews = await generateContentPreviews();
  return previews.get(path) || null;
}

// Helper function to escape HTML attributes
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
} 