# Alternative Header Fonts for Your Website

## Current Setup
- **Body Font**: Inter (excellent choice - highly readable)
- **Header Font**: Montserrat (clean, modern)

## 🎯 Recommended Alternatives

### 1. **Playfair Display** (Classic Serif)
**Best for**: Literary, sophisticated, timeless feel
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:opsz,wght@8..144,400;500;600;700&display=swap" rel="stylesheet">
```
- **Pros**: Elegant, great contrast with Inter, perfect for book titles
- **Cons**: Slightly heavier file size
- **Perfect for**: Your book showcase, main headings

### 2. **Source Sans Pro** (Clean Sans-Serif)
**Best for**: Modern, professional, tech-focused
```html
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:opsz,wght@8..144,400;500;600;700&display=swap" rel="stylesheet">
```
- **Pros**: Excellent readability, modern feel, great with Inter
- **Cons**: Less personality than serif options
- **Perfect for**: Tech blog, professional content

### 3. **Lora** (Contemporary Serif)
**Best for**: Reading-focused, blog-style content
```html
<link href="https://fonts.googleapis.com/css2?family=Lora:opsz,wght@8..144,400;500;600;700&display=swap" rel="stylesheet">
```
- **Pros**: Beautiful serif, great for long-form content, excellent readability
- **Cons**: Slightly more formal
- **Perfect for**: Blog posts, articles, newsletters

### 4. **Poppins** (Modern Geometric)
**Best for**: Contemporary, friendly, approachable
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:opsz,wght@8..144,400;500;600;700&display=swap" rel="stylesheet">
```
- **Pros**: Modern, friendly, great for tech/startup feel
- **Cons**: Very popular (might feel generic)
- **Perfect for**: Modern web apps, tech content

### 5. **Merriweather** (Robust Serif)
**Best for**: Serious, authoritative, content-heavy sites
```html
<link href="https://fonts.googleapis.com/css2?family=Merriweather:opsz,wght@8..144,400;500;600;700&display=swap" rel="stylesheet">
```
- **Pros**: Excellent readability, professional, great contrast
- **Cons**: More formal, heavier feel
- **Perfect for**: Academic, professional content

### 6. **Work Sans** (Clean & Modern)
**Best for**: Contemporary, clean, minimal
```html
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:opsz,wght@8..144,400;500;600;700&display=swap" rel="stylesheet">
```
- **Pros**: Clean, modern, excellent with Inter
- **Cons**: Less personality than serif options
- **Perfect for**: Modern websites, tech blogs

## 🎨 Font Pairing Analysis

### **For Your Content Type** (Personal blog, books, tech)

**Top 3 Recommendations**:

1. **Playfair Display** + Inter
   - Perfect for your book content
   - Elegant contrast
   - Great for "A Year of Mornings" showcase

2. **Lora** + Inter  
   - Excellent for blog posts
   - Beautiful serif that's not too formal
   - Great for long-form content

3. **Work Sans** + Inter
   - Clean, modern, professional
   - Perfect for tech content
   - Excellent readability

## 🚀 Quick Implementation

### Option 1: Playfair Display (Recommended)
```html
<!-- In Layout.astro -->
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@8..144,100..900&family=Playfair+Display:opsz,wght@8..144,400;500;600;700&display=swap" rel="stylesheet">
```

```javascript
// In tailwind.config.mjs
fontFamily: {
  sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  serif: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
},
```

### Option 2: Lora (For Blog Focus)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@8..144,100..900&family=Lora:opsz,wght@8..144,400;500;600;700&display=swap" rel="stylesheet">
```

```javascript
fontFamily: {
  sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
},
```

## 📊 Performance Comparison

| Font | File Size | Loading Speed | Personality |
|------|-----------|---------------|-------------|
| Montserrat | ~45KB | Fast | Modern, clean |
| Playfair Display | ~65KB | Good | Elegant, classic |
| Lora | ~55KB | Good | Contemporary, readable |
| Work Sans | ~50KB | Fast | Clean, modern |
| Poppins | ~60KB | Good | Friendly, modern |

## 🎯 My Recommendation

**For your website**, I'd recommend **Playfair Display** because:

1. **Perfect for your book content** - "A Year of Mornings" would look stunning
2. **Great contrast with Inter** - Creates beautiful hierarchy
3. **Elegant but not stuffy** - Modern enough for tech content
4. **Excellent readability** - Works well at all sizes

Would you like me to implement one of these alternatives? I can update the font configuration and show you how it looks! 