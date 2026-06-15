export type Post = {
  title: string;
  description?: string;
  created: Date;
  category: 'evergreen' | 'blog' | 'micro' | 'photo' | 'nordletter' | 'stories' | 'poems' | 'bookshelf';
  image?: string;
  content?: string;
  link?: string;
}; 