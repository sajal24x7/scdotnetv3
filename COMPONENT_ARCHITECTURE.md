# Component Architecture Overview

## New Unified Component Strategy

### AdaptiveCard Component
The new `AdaptiveCard.astro` component serves as a single, flexible card component that can adapt to different layout styles:

- **Masonry Layout**: For notes page (like Maggie Appleton's approach)
- **Feed Layout**: For ephemera (single column feed style)
- **Circular Layout**: For nordletter (circular images with date/title below)

### Key Features

1. **Single Component, Multiple Layouts**
   - One `AdaptiveCard` component handles all content types
   - Layout prop controls visual presentation
   - Consistent typography and spacing across all layouts

2. **Responsive Design**
   - Images and text resize based on screen size
   - Mobile-optimized layouts
   - Dark mode support

3. **Layout Variants**

#### Masonry Layout (`layout="masonry"`)
- Uses CSS `column-count` for true masonry effect
- Responsive: 3 columns → 2 columns → 1 column
- Break-inside: avoid for proper card splitting
- Used for notes page

#### Feed Layout (`layout="feed"`)
- Single column layout
- Subtle dividers between cards
- Larger spacing for better readability
- Used for ephemera page

#### Circular Layout (`layout="circular"`)
- Circular images (120px diameter)
- Centered text layout
- Date and title below image
- Used for nordletter page

### Grid Components

1. **MasonryGrid.astro**
   - Implements masonry layout using CSS columns
   - Responsive breakpoints: 3→2→1 columns
   - Similar to Maggie Appleton's approach but more flexible

2. **FeedGrid.astro**
   - Single column feed layout
   - Subtle dividers between posts
   - Optimized for chronological content

3. **CircularGrid.astro**
   - Grid layout for circular cards
   - Groups posts by year
   - Responsive grid: 2→3→4→5 columns

## Comparison with Previous Architecture

### Before (Multiple Components)
```
Card.astro          - Generic card
NotesGrid.astro     - Grid layout for notes
ContentGrid.astro   - Single column for ephemera
NordletterGrid.astro - Circular layout for nordletter
```

### After (Unified Approach)
```
AdaptiveCard.astro  - Single adaptive component
MasonryGrid.astro   - Masonry layout wrapper
FeedGrid.astro      - Feed layout wrapper
CircularGrid.astro  - Circular layout wrapper
```

## Comparison with Maggie Appleton's Site

### Similarities
- Both use CSS `column-count` for masonry
- Both have separate card components for different content types
- Both implement responsive breakpoints

### Key Differences

1. **Component Strategy**
   - **Maggie**: Separate card components for each content type
   - **Our Site**: Single adaptive component with layout variants

2. **Layout Flexibility**
   - **Maggie**: Fixed column-count approach
   - **Our Site**: More flexible with layout prop system

3. **Maintenance**
   - **Maggie**: More components to maintain
   - **Our Site**: Single component, easier maintenance

4. **Consistency**
   - **Maggie**: Each card type can have different styling
   - **Our Site**: Consistent styling across all layouts

## Benefits of New Architecture

1. **Simplified Maintenance**
   - One card component to maintain
   - Consistent styling across all layouts
   - Easier to add new layout variants

2. **Better Responsiveness**
   - Images and text resize based on screen size
   - Optimized mobile layouts
   - Consistent breakpoints

3. **Visual Identity**
   - Different sections have distinct visual identities
   - Same component, different presentations
   - Maintains brand consistency

4. **Performance**
   - Fewer components to load
   - Consistent caching
   - Better bundle optimization

## Implementation Details

### Usage Examples

```astro
<!-- Masonry Layout (Notes) -->
<AdaptiveCard 
  title="Note Title"
  description="Note description"
  pubDate={date}
  category="evergreen"
  layout="masonry"
/>

<!-- Feed Layout (Ephemera) -->
<AdaptiveCard 
  title="Post Title"
  description="Post description"
  pubDate={date}
  category="blog"
  layout="feed"
/>

<!-- Circular Layout (Nordletter) -->
<AdaptiveCard 
  title="Newsletter Title"
  description="Newsletter description"
  pubDate={date}
  category="nordletter"
  layout="circular"
/>
```

### Grid Wrappers

```astro
<!-- Masonry Grid -->
<MasonryGrid posts={posts} />

<!-- Feed Grid -->
<FeedGrid posts={posts} />

<!-- Circular Grid -->
<CircularGrid posts={posts} />
```

## Future Enhancements

1. **Additional Layouts**
   - Timeline layout
   - Gallery layout
   - List layout

2. **Animation Options**
   - Hover effects
   - Loading animations
   - Transition effects

3. **Content Types**
   - Video cards
   - Audio cards
   - Interactive cards

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support