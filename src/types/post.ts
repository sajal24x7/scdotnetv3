export type Post = {
  title: string;
  description?: string;
  pubDate: Date;
  category: 'evergreen' | 'blog' | 'micro' | 'photo' | 'nordletter' | 'stories' | 'poems' | 'books';
  image?: string;
  content?: string;
  link?: string;
}; 