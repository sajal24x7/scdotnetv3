/**
 * Random Colored Link Underlines
 * This script applies a randomly selected bold color to link underlines persistently
 */

// Your custom color palette with light and dark versions
const lightColors = [
  'hsl(203, 100%, 87%)', // Light blue
  'hsl(225, 75%, 90%)',  // Light periwinkle
  'hsl(284, 54%, 89%)',  // Light purple
  'hsl(323, 100%, 90%)', // Light magenta
  'hsl(344, 98%, 92%)',  // Light pink
  'hsl(16, 97%, 92%)',   // Light orange
  'hsl(38, 96%, 90%)',   // Light yellow
  'hsl(78, 44%, 87%)',   // Light green
  'hsl(137, 50%, 84%)',  // Light emerald
  'hsl(158, 66%, 77%)',  // Light teal
  'hsl(178, 37%, 81%)',  // Light cyan
  'hsl(245, 45%, 89%)',  // Light blue-purple
  'hsl(284, 100%, 90%)'  // Light violet
];

const darkColors = [
  'hsl(203, 100%, 45%)', // Dark blue
  'hsl(225, 75%, 50%)',  // Dark periwinkle
  'hsl(284, 54%, 55%)',  // Dark purple
  'hsl(323, 100%, 55%)', // Dark magenta
  'hsl(344, 98%, 60%)',  // Dark pink
  'hsl(16, 97%, 60%)',   // Dark orange
  'hsl(38, 96%, 65%)',   // Dark yellow
  'hsl(78, 44%, 55%)',   // Dark green
  'hsl(137, 50%, 50%)',  // Dark emerald
  'hsl(158, 66%, 45%)',  // Dark teal
  'hsl(178, 37%, 50%)',  // Dark cyan
  'hsl(245, 45%, 55%)',  // Dark blue-purple
  'hsl(284, 100%, 55%)'  // Dark violet
];

// Get colors based on theme
function getColors() {
  const isDarkMode = document.documentElement.classList.contains('dark') ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDarkMode ? darkColors : lightColors;
}

// Apply random color to all links immediately
function applyRandomColors() {
  const links = document.querySelectorAll('a:not(.no-underline):not(.nav-area a):not(header a):not(footer a):not(.tag):not(.category-display):not(.tagged-with-item):not(.show-more-btn):not(.show-less-btn):not(.tag-item)');
  const colors = getColors();
  console.log('Applying random colors to', links.length, 'links');

  links.forEach(link => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    link.style.setProperty('--random-link-color', randomColor);
    link.style.setProperty('text-decoration-color', randomColor);
    link.classList.add('random-underline');
    console.log('Applied color', randomColor, 'to link:', link.textContent?.substring(0, 30));
  });
}

// Expose function globally
window.randomLinkColors = applyRandomColors;

// Apply colors when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyRandomColors);
} else {
  applyRandomColors();
}

// Reapply colors when new content is loaded (for SPA-like behavior)
const observer = new MutationObserver((mutations) => {
  let shouldReapply = false;
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      shouldReapply = true;
    }
  });
  if (shouldReapply) {
    console.log('New content detected, reapplying random colors');
    applyRandomColors();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for theme changes and update link colors
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  console.log('Theme changed, reapplying random colors');
  applyRandomColors();
});

// Also listen for manual theme toggle (if using class-based theme switching)
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      if (mutation.target.classList.contains('dark') !== mutation.oldValue?.includes('dark')) {
        console.log('Manual theme toggle detected, reapplying random colors');
        applyRandomColors();
      }
    }
  });
});

themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeOldValue: true,
  attributeFilter: ['class']
}); 