export type Post = {
  title: string;
  description?: string;
  pubDate: Date;
  category: 'evergreen' | 'blog' | 'micro' | 'photo' | 'nordletter' | 'stories' | 'poems' | 'bookshelf';
  image?: string;
  content?: string;
  link?: string;
  // Bookshelf-specific fields
  startDate?: Date;
  endDate?: Date;
  format?: 'ebook' | 'softcover' | 'hardcover' | 'audio';
}; 