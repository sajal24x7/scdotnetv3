# Astronautical Aperture

A personal website built with Astro, featuring a comprehensive component library inspired by Maggie Appleton's design patterns. This project demonstrates modern web development practices with a focus on maintainability, accessibility, and performance.

## 🚀 Features

- **Component-Based Architecture**: Reusable, well-documented components
- **Responsive Design**: Mobile-first approach with consistent breakpoints
- **Accessibility First**: Built-in accessibility features and keyboard navigation
- **Performance Optimized**: Fast loading times and smooth animations
- **Dark Mode Support**: Comprehensive dark mode implementation
- **TypeScript**: Full type safety and better developer experience
- **Content Management**: Organized content structure with multiple categories

## 📁 Project Structure

```
astronautical-aperture/
├── src/
│   ├── components/
│   │   ├── navigation/          # Navigation components
│   │   ├── content/            # Content display components
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # Basic UI components
│   ├── pages/                  # Astro pages
│   ├── content/                # Markdown content
│   ├── layouts/                # Page layouts
│   ├── utils/                  # Utility functions
│   └── styles/                 # Global styles
├── public/                     # Static assets
└── scripts/                    # Build and utility scripts
```

## 🎯 Content Categories

- **Notes**: Evergreen documentation and learning notes
- **Ephemera**: Blog posts, photos, micro updates, and TIL posts
- **Stories**: Short stories and fiction
- **Poems**: Poetry and verse
- **Books**: Book recommendations and reviews
- **NordLetter**: Newsletter content

## 🛠️ Technology Stack

- **Astro**: Static site generation
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first styling
- **Markdown**: Content authoring
- **RSS**: Content syndication
- **Sitemap**: SEO optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd astronautical-aperture
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:4321`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands

## 📚 Component Library

### Navigation Components

#### SocialLinks.astro
Reusable social media links with configurable layouts and sizes.

```astro
<SocialLinks 
  layout="vertical" 
  size="md" 
  showLabels={false} 
/>
```

#### NavigationMenu.astro
Extracted navigation logic with mobile and desktop layouts.

```astro
<NavigationMenu 
  currentPage={currentPage} 
  layout="desktop" 
/>
```

### Content Components

#### PostList.astro
Flexible post listing with multiple display modes.

```astro
<PostList 
  posts={posts}
  mode="grid"
  showCategory={true}
  showDate={true}
  maxPosts={6}
/>
```

#### CategoryFilter.astro
Category filtering interface with accessibility features.

```astro
<CategoryFilter 
  categories={['notes', 'ephemera', 'stories', 'poems']}
  currentCategory="notes"
  layout="horizontal"
  size="md"
/>
```

### Layout Components

#### PageHeader.astro
Consistent page headers with action buttons.

```astro
<PageHeader 
  title="My Page"
  description="Page description"
  layout="centered"
  size="lg"
  actions={[
    {
      label: "View All",
      href: "/all/",
      primary: true
    }
  ]}
/>
```

#### ContentGrid.astro
Responsive grid layout for content display.

```astro
<ContentGrid 
  posts={posts}
  columns={3}
  gap={6}
/>
```

### UI Components

#### ProfileHero.astro
Hero section with profile information and social links.

```astro
<ProfileHero 
  title="Sajal Choudhary"
  description="Software engineer and writer"
  image="/profile/profile.jpeg"
  socialLinks={socialLinks}
/>
```

#### BookShowcase.astro
Display book recommendations in a grid layout.

```astro
<BookShowcase 
  books={books}
  title="Recommended Books"
  description="Books I've enjoyed reading"
/>
```

## 🎨 Design System

### Colors
- **Primary**: Custom accent colors
- **Text**: Dark/light mode compatible
- **Background**: Consistent across components
- **Accent**: Highlight colors for interactions

### Typography
- **Headings**: Clear hierarchy with consistent sizing
- **Body**: Readable font with proper line height
- **Code**: Monospace font for technical content

### Spacing
- **Consistent**: 4px base unit system
- **Responsive**: Scales appropriately on different devices
- **Accessible**: Proper touch targets and spacing

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG AA compliant
- **Touch Targets**: Minimum 44px touch targets

## 📱 Responsive Design

- **Mobile-First**: Designed for mobile devices first
- **Flexible Layouts**: Adaptive grid systems
- **Touch-Friendly**: Appropriate touch targets
- **Consistent Breakpoints**: Unified responsive design system

## 🔧 Development

### Adding New Components

1. Create component in appropriate directory
2. Add TypeScript interface for props
3. Include accessibility features
4. Add documentation and usage examples
5. Test across different screen sizes

### Content Management

1. Add markdown files to appropriate year folders
2. Include frontmatter with required metadata
3. Use consistent formatting and structure
4. Test rendering and navigation

### Styling Guidelines

1. Use Tailwind CSS utility classes
2. Follow mobile-first responsive design
3. Maintain consistent spacing and typography
4. Test in both light and dark modes

## 📈 Performance

- **Bundle Size**: Optimized component tree
- **Image Optimization**: Proper image handling
- **Lazy Loading**: Efficient content loading
- **Caching**: Static generation for fast loading
- **SEO**: Optimized meta tags and sitemap

## 🧪 Testing

### Visual Regression Testing
- Compare before/after screenshots
- Test across different browsers
- Verify responsive behavior
- Check dark mode implementation

### Accessibility Testing
- Keyboard navigation verification
- Screen reader compatibility
- Color contrast validation
- Focus management testing

### Performance Testing
- Bundle size analysis
- Loading time optimization
- Mobile performance testing
- Core Web Vitals monitoring

## 📚 Documentation

- **Component Documentation**: `REFACTORING_DOCUMENTATION.md`
- **Refactoring Summary**: `REFACTORING_SUMMARY.md`
- **Usage Examples**: Included in component files
- **Migration Guide**: Available for developers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Maggie Appleton**: Design inspiration and component patterns
- **Astro Team**: Excellent static site generation framework
- **Tailwind CSS**: Utility-first CSS framework
- **Community**: Open source contributions and feedback

## 📞 Contact

- **Website**: [sajal.dev](https://sajal.dev)
- **Mastodon**: [@sajal24x7@mastodon.social](https://mastodon.social/@sajal24x7)
- **LinkedIn**: [sajal24x7](https://www.linkedin.com/in/sajal24x7)

---

Built with ❤️ using Astro and modern web technologies. 