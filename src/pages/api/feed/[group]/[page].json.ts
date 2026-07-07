import type { APIRoute } from 'astro';
import { getAllPosts } from '../../../../utils/content';
import { getFeedEntriesForGroup, FEED_PAGE_SIZE, FEED_GROUPS } from '../../../../utils/feed';
import type { FeedEntry, FeedGroup } from '../../../../utils/feed';

// Pre-paginated feed pages consumed by the homepage "Load 10 more" button.
// One JSON file per group per page of 10 entries, generated at build time.

const GROUP_NAMES: FeedGroup[] = ['all', ...(Object.keys(FEED_GROUPS) as FeedGroup[])];

interface PageProps {
  entries: FeedEntry[];
  hasMore: boolean;
  total: number;
}

export async function getStaticPaths() {
  const allPosts = await getAllPosts();

  const groups = await Promise.all(
    GROUP_NAMES.map(async (group) => ({
      group,
      entries: await getFeedEntriesForGroup(allPosts, group)
    }))
  );

  return groups.flatMap(({ group, entries }) => {
    const pageCount = Math.max(1, Math.ceil(entries.length / FEED_PAGE_SIZE));

    return Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1;
      const start = index * FEED_PAGE_SIZE;
      const props: PageProps = {
        entries: entries.slice(start, start + FEED_PAGE_SIZE),
        hasMore: start + FEED_PAGE_SIZE < entries.length,
        total: entries.length
      };
      return {
        params: { group, page: String(page) },
        props
      };
    });
  });
}

export const GET: APIRoute = ({ props }) => {
  return new Response(JSON.stringify(props), {
    headers: { 'Content-Type': 'application/json' }
  });
};
