// Mermaid fences (```mermaid) are diagrams, not code samples. Astro has no
// built-in mermaid support, so Shiki would render them as a plain code block.
// This plugin swaps them for the `<pre class="mermaid">` markup the mermaid
// client script (src/components/Mermaid.astro) renders in the browser.

interface CodeNode {
    type: string;
    lang?: string | null;
    value?: string;
    children?: CodeNode[];
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function remarkMermaid() {
    return (tree: CodeNode) => {
        function visit(node: CodeNode) {
            if (!node.children) return;
            node.children.forEach((child, index) => {
                if (child.type === 'code' && child.lang === 'mermaid') {
                    node.children![index] = {
                        type: 'html',
                        // The source stays in the DOM as text so the diagram
                        // degrades to readable markup without JavaScript.
                        value: `<pre class="mermaid not-prose" data-mermaid-source>${escapeHtml(child.value ?? '')}</pre>`,
                    };
                } else {
                    visit(child);
                }
            });
        }
        visit(tree);
    };
}
