# Multi-Level Navigation System

This project now features a responsive, multi-level navigation system inspired by The Guardian's design. The navigation automatically adapts based on the current page and provides a seamless user experience across desktop and mobile devices.

## Features

### Main Navigation
- **About** - Single level navigation
- **Garden** - Triggers secondary navigation with subcategories
- **Stream** - Triggers secondary navigation with subcategories  
- **Nordletter** - Single level navigation

### Secondary Navigation
When a user navigates to **Garden** or **Stream**, a secondary navigation bar automatically appears below the main navigation:

#### Garden Subcategories:
- Evergreen
- TIL (Today I Learned)
- Bookshelf
- Notes

#### Stream Subcategories:
- Blog
- Micro
- Photos
- Stories
- Poems

## How It Works

### Desktop Experience
1. **Name Header Row**: "Sajal Choudhary" displayed prominently in serif font
2. **Primary Navigation Row**: Main navigation items with consistent spacing and styling
3. **Secondary Navigation Row**: Appears automatically when in Garden or Stream sections
4. **Active States**: Current section is highlighted with background color and blue border
5. **Hover Effects**: Smooth transitions and visual feedback

### Mobile Experience
1. **Consistent Layout**: Same navigation structure across all devices
2. **Responsive Design**: Optimized for small screens with identical styling
3. **Touch-Friendly**: Large touch targets and clear visual hierarchy
4. **Clean Interface**: No hamburger menu, direct access to all navigation

## Technical Implementation

### Components
- `MultiLevelNavigation.astro` - Main navigation component
- `Header.astro` - Updated to use the new navigation
- Individual page files for each subcategory

### Key Features
- **Automatic Active State Detection**: Based on current page path
- **Responsive Design**: Built with Tailwind CSS
- **Clean HTML Structure**: No JavaScript required for basic functionality
- **Accessibility**: Proper ARIA labels and keyboard navigation

### File Structure
```
src/
├── components/
│   ├── navigation/
│   │   └── MultiLevelNavigation.astro
│   └── Header.astro
├── pages/
│   ├── garden/
│   │   ├── evergreen/
│   │   ├── til/
│   │   ├── bookshelf/
│   │   └── notes/
│   └── stream/
│       ├── blog/
│       ├── micro/
│       ├── photos/
│       ├── stories/
│       └── poems/
└── navigation-demo.astro
```

## Usage

### Basic Navigation
The navigation automatically appears on all pages through the Layout component. No additional setup is required.

### Customizing Navigation Items
To modify the navigation structure, edit `MultiLevelNavigation.astro`:

```astro
// Main navigation items
const mainNavItems = [
  { href: '/about/', label: 'About', key: 'about' },
  { href: '/garden/', label: 'Garden', key: 'garden' },
  { href: '/stream/', label: 'Stream', key: 'stream' },
  { href: '/nordletter/', label: 'Nordletter', key: 'nordletter' },
];

// Secondary navigation items
const secondaryNavItems = {
  garden: [
    { href: '/garden/evergreen/', label: 'Evergreen' },
    // ... more items
  ],
  stream: [
    { href: '/stream/blog/', label: 'Blog' },
    // ... more items
  ],
};
```

### Adding New Sections
1. Add the main navigation item to `mainNavItems`
2. Add secondary items to `secondaryNavItems` if needed
3. Create the corresponding page files
4. Update the `getActiveMainSection()` function if needed

## Styling

The navigation uses Tailwind CSS classes and includes:
- **Color Scheme**: Adapts to light/dark mode
- **Transitions**: Smooth hover and active state changes
- **Typography**: Consistent font weights and sizes
- **Spacing**: Proper padding and margins for touch targets

## Browser Support

- Modern browsers with ES6+ support
- Responsive design for all screen sizes
- Progressive enhancement for older browsers

## Demo

Visit `/navigation-demo` to see the navigation system in action with detailed explanations and examples.

## Future Enhancements

Potential improvements for the navigation system:
- **Third Level Navigation**: For deeper content hierarchies
- **Breadcrumbs**: To show current location in the site
- **Search Integration**: Quick navigation to specific content
- **Keyboard Shortcuts**: For power users
- **Analytics**: Track navigation usage patterns

## Troubleshooting

### Common Issues
1. **Secondary navigation not appearing**: Check that the current page path matches the expected patterns
2. **Mobile menu not working**: Ensure JavaScript is enabled and the component is properly loaded
3. **Styling issues**: Verify Tailwind CSS is properly configured

### Debug Mode
Add `console.log` statements in the component to debug navigation logic:
```astro
<script>
  console.log('Current page:', '{currentPage}');
  console.log('Active section:', '{activeMainSection}');
</script>
```

## Contributing

When making changes to the navigation system:
1. Test on both desktop and mobile devices
2. Verify accessibility features still work
3. Update this documentation if needed
4. Test with different content types and page structures