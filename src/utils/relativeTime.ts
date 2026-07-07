// Shared by the feed's build-time rendering and the client script that
// refreshes labels after load, so both produce identical wording.
// "yesterday"/"N days ago" follow calendar days in the viewer's timezone,
// not 24-hour buckets, so a post from two evenings ago never reads "yesterday".
export function relativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) {
    return 'just now';
  }

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (days === 0) {
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? 'last week' : `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return months <= 1 ? 'last month' : `${months} months ago`;

  const years = Math.floor(days / 365);
  return years <= 1 ? 'last year' : `${years} years ago`;
}
