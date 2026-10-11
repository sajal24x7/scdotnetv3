/**
 * Haiku numbering: every haiku gets its place in the practice (oldest = 1),
 * worked out from `created` at build time, so a new haiku is numbered
 * automatically with nothing to set in frontmatter.
 */
export function numberHaiku<T extends { id: string; data: { created?: Date | string } }>(
    posts: readonly T[]
): Map<string, number> {
    const time = (post: T) => (post.data.created ? new Date(post.data.created).getTime() : 0);
    const ordered = [...posts].sort((a, b) => time(a) - time(b));
    return new Map(ordered.map((post, index) => [post.id, index + 1]));
}
