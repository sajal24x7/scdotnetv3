// Mermaid fences (```mermaid) are diagrams, not code samples. Astro has no
// built-in mermaid support, so Shiki would render them as a plain code block.
// This plugin renders them to SVG at build time with Pele, so diagrams ship
// as static markup with no client JavaScript. Colors come from --pele-*
// CSS variables (see src/styles/components.css), so the theme toggle restyles
// them without a re-render.

import { render } from 'pele';

interface CodeNode {
    type: string;
    lang?: string | null;
    value?: string;
    children?: CodeNode[];
}

interface VFileLike {
    path?: string;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function renderMermaid(source: string, filePath?: string): string {
    try {
        const { svg } = render(source);
        return `<figure class="mermaid not-prose">${svg}</figure>`;
    } catch (error) {
        // A broken diagram should not fail the build. Warn, then keep the
        // source visible as text rather than an empty box.
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[remarkMermaid] Could not render diagram in ${filePath ?? 'unknown file'}: ${message}`);
        return `<pre class="mermaid not-prose" data-mermaid-error>${escapeHtml(source)}</pre>`;
    }
}

export function remarkMermaid() {
    return (tree: CodeNode, file?: VFileLike) => {
        function visit(node: CodeNode) {
            if (!node.children) return;
            node.children.forEach((child, index) => {
                if (child.type === 'code' && child.lang === 'mermaid') {
                    node.children![index] = {
                        type: 'html',
                        value: renderMermaid(child.value ?? '', file?.path),
                    };
                } else {
                    visit(child);
                }
            });
        }
        visit(tree);
    };
}
