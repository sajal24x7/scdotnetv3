export const designTokens = {
  typography: {
    scale: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
    weights: [300, 400, 500, 600, 700],
    lineHeights: { tight: 1.25, normal: 1.5, loose: 1.75 }
  },
  spacing: {
    sections: ['8', '12', '16', '24', '32'],
    components: ['2', '4', '6', '8', '12']
  },
  colors: {
    semantic: {
      success: '#10b981',
      warning: '#f59e0b', 
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  layouts: {
    masonry: { mobile: 2, tablet: 3, desktop: 4 },
    feed: { mobile: 1, tablet: 1, desktop: 1 },
    grid: { mobile: 2, tablet: 3, desktop: 4 },
    library: { mobile: 2, tablet: 3, desktop: 5 }
  },
  breakpoints: {
    masonry: { default: 3, 1100: 2, 700: 1 },
    feed: { default: 1 },
    grid: { default: 4, 1024: 3, 768: 2, 640: 1 },
    library: { default: 5, 1024: 4, 768: 3, 640: 2 }
  }
}

export type LayoutVariant = 'masonry' | 'feed' | 'grid' | 'library'
export type CardVariant = 'note' | 'ephemera' | 'newsletter' | 'book'
export type MetadataPosition = 'left' | 'top' | 'none'