// Learn blocks — ```learn fenced YAML inside a note — carry that note's
// spaced-repetition prompts (see scripts/extract-learn-blocks.mjs and
// docs/architecture/learning-systems.md § "Note-backed decks"). They are
// authoring metadata, not prose: strip them everywhere a note body is
// rendered (pages via the remark plugin, RSS/excerpts via the string strip).

// Keep in sync with LEARN_BLOCK_RE in scripts/extract-learn-blocks.mjs.
export const LEARN_BLOCK_RE = /^```learn[ \t]*\n[\s\S]*?\n```[ \t]*$/gm;

export function stripLearnBlocks(markdown: string): string {
    return markdown.replace(LEARN_BLOCK_RE, '').replace(/\n{3,}/g, '\n\n');
}

// Remark plugin for the site's markdown pipeline: drop `learn` code blocks
// from the AST so note pages never render them.
export function remarkStripLearnBlocks() {
    return (tree: { children?: Array<{ type: string; lang?: string | null }> }) => {
        if (!tree.children) return;
        tree.children = tree.children.filter(
            (node) => !(node.type === 'code' && node.lang === 'learn'),
        );
    };
}
