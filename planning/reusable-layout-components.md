# Reusable Layout Components Implementation Plan

## Overview
Create reusable layout components similar to Maggie Appleton's site structure to control max width, page width, and other layout constraints consistently across the site.

## Current State Analysis

### Existing Layout Structure
- **BaseLayout.astro**: Basic layout with `container mx-auto px-4 py-8 max-w-3xl`
- **Layout.astro**: More comprehensive layout with `container mx-auto px-4 py-8 flex-grow max-w-3xl`
- **PageHeader.astro**: Header component with title, description, and actions
- **FourSectionLayout.astro**: Grid layout for sections

### Current CSS Classes Used
- `container mx-auto px-4 py-8 max-w-3xl` - Main content container
- `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8` - Home page container
- `max-width: 1400px` - Blog/Notes pages
- `prose` - Typography styling for content
- Various responsive classes: `sm:px-6 lg:px-8`

## Implementation Plan

### Phase 1: Create Core Layout Components

#### P1.1 Create PageWrapper Component
- **File**: `src/components/layout/PageWrapper.astro`
- **Purpose**: Control page width and centering
- **Props**:
  - `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  - `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  - `centered`: boolean
  - `className`: string (additional classes)

#### P1.2 Create ProseWrapper Component
- **File**: `src/components/layout/ProseWrapper.astro`
- **Purpose**: Control content width for readable text
- **Props**:
  - `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  - `className`: string (additional classes)
  - `centered`: boolean

#### P1.3 Create ContainerWrapper Component
- **File**: `src/components/layout/ContainerWrapper.astro`
- **Purpose**: General container with responsive padding
- **Props**:
  - `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  - `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  - `className`: string (additional classes)

### Phase 2: Update Existing Layouts

#### P2.1 Update BaseLayout.astro
- Replace hardcoded container classes with PageWrapper
- Maintain current visual appearance
- Add props for customization

#### P2.2 Update Layout.astro
- Replace hardcoded container classes with PageWrapper
- Maintain current visual appearance
- Add props for customization

### Phase 3: Update Page Templates

#### P3.1 Update Home Page (index.astro)
- Replace `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8` with PageWrapper
- Maintain current visual appearance

#### P3.2 Update Blog Index (blog/index.astro)
- Replace custom container styles with PageWrapper
- Maintain current visual appearance

#### P3.3 Update Notes Index (notes/index.astro)
- Replace custom container styles with PageWrapper
- Maintain current visual appearance

#### P3.4 Update Other Content Pages
- Update all remaining pages to use new layout components
- Maintain current visual appearance

### Phase 4: Create Additional Layout Components (if needed)

#### P4.1 Create SectionWrapper Component
- **File**: `src/components/layout/SectionWrapper.astro`
- **Purpose**: Wrap sections with consistent spacing
- **Props**:
  - `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  - `margin`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  - `className`: string (additional classes)

#### P4.2 Create GridWrapper Component
- **File**: `src/components/layout/GridWrapper.astro`
- **Purpose**: Responsive grid layouts
- **Props**:
  - `columns`: number | object (responsive)
  - `gap`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  - `className`: string (additional classes)

### Phase 5: Testing and Validation

#### P5.1 Visual Testing
- Ensure all pages look identical to current state
- Test responsive behavior
- Verify dark mode compatibility

#### P5.2 Component Testing
- Test all prop combinations
- Verify default values work correctly
- Test edge cases

## Implementation Details

### Component Structure

#### PageWrapper.astro
```astro
---
interface Props {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  className?: string;
}

const { 
  maxWidth = '3xl', 
  padding = 'md', 
  centered = true, 
  className = '' 
} = Astro.props;

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'px-2 py-4',
  md: 'px-4 py-8',
  lg: 'px-6 py-12',
  xl: 'px-8 py-16'
};

const containerClasses = `container mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${centered ? 'mx-auto' : ''} ${className}`;
---

<div class={containerClasses}>
  <slot />
</div>
```

#### ProseWrapper.astro
```astro
---
interface Props {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
  centered?: boolean;
}

const { 
  maxWidth = '4xl', 
  className = '', 
  centered = true 
} = Astro.props;

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
};

const proseClasses = `prose dark:prose-invert ${maxWidthClasses[maxWidth]} ${centered ? 'mx-auto' : ''} ${className}`;
---

<div class={proseClasses}>
  <slot />
</div>
```

### Migration Strategy

1. **Create components first** - Build all layout components
2. **Update layouts** - Modify BaseLayout and Layout.astro
3. **Update pages one by one** - Start with index.astro, then blog, notes, etc.
4. **Test each change** - Ensure visual consistency
5. **Final validation** - Complete site testing

## Success Criteria

- [ ] All pages maintain current visual appearance
- [ ] Responsive behavior works correctly
- [ ] Dark mode compatibility preserved
- [ ] Components are reusable and flexible
- [ ] Code is cleaner and more maintainable
- [ ] Performance is not degraded

## Current Phase: P5.1 - Testing and Validation
## Overall Progress: 95% (Phases 1-4 Complete, Most Pages Updated)

---

## Notes
- Maintain existing CSS classes and styling
- Preserve current responsive behavior
- Keep dark mode compatibility
- Focus on visual consistency first, then optimization 