export type Post = {
  title: string;
  description?: string;
  pubDate: Date;
  category: 'evergreen' | 'blog' | 'micro' | 'photo' | 'nordletter' | 'stories' | 'poems' | 'bookshelf' | 'film' | 'tv';
  image?: string;
  content?: string;
  link?: string;
}; 