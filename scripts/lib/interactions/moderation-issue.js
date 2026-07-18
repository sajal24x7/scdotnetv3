/**
 * Builds the "Webmentions pending moderation" issue content from the current
 * interactions index. Shared by the scheduled refresh workflow (which
 * refreshes/closes the issue after each collector run) and the comment-driven
 * moderation workflow (which refreshes it after applying a /approve or /deny
 * command), so the two never drift on what "pending" means or how the issue
 * reads.
 */

import { domainOf } from './webmentions.js';

const TITLE = 'Webmentions pending moderation';

export function findPendingWebmentions(index) {
  const pending = [];
  for (const [key, entries] of Object.entries(index)) {
    if (key === '_meta' || !Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (entry.platform === 'web' && entry.status === 'pending') {
        pending.push({ post: key, ...entry });
      }
    }
  }
  return pending;
}

export function buildModerationIssueBody(pending) {
  const lines = pending.map((entry) => {
    const author = entry.author?.name ?? 'someone';
    const domain = domainOf(entry.url) ?? '?';
    return `- **${entry.post}** ← ${entry.type} from [${author}](${entry.url}) (\`${domain}\`)`;
  });
  return [
    'These verified webmentions are from domains not on the allowlist, so they are',
    '**not shown on the site** until approved.',
    '',
    ...lines,
    '',
    'Reply on this issue with a command and a bot will apply it and push automatically:',
    '- `/approve <domain>` — allowlists the domain (`approvedWebmentionDomains`) and',
    '  approves its pending mention(s) above.',
    '- `/deny <domain>` (alias `/block`) — blocklists the domain',
    '  (`blockedWebmentionDomains`) and purges its entries from the index.',
    '',
    'Example: `/approve michaelharley.net`',
    '',
    '_This issue is refreshed automatically and closes itself when the queue is empty._',
  ].join('\n');
}

export { TITLE as MODERATION_ISSUE_TITLE };
