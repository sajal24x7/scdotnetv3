/**
 * Random Colored Link Underlines
 * This script applies a randomly selected bold color to link underlines persistently
 */

// Bold colors for random underlines
const boldColors = [
  '#FF5733', // Bright Red
  '#33FF57', // Bright Green
  '#3357FF', // Bright Blue
  '#FF33A8', // Pink
  '#33FFF5', // Cyan
  '#F533FF', // Magenta
  '#FF9633', // Orange
  '#FFFF33', // Yellow
  '#9933FF', // Purple
  '#33FFAA', // Mint
  '#5733FF', // Indigo
  '#FF3333', // Red
  '#33FF33', // Green
  '#3333FF'  // Blue
];

// Apply random color to all links immediately
function applyRandomColors() {
  const links = document.querySelectorAll('a:not(.no-underline):not(.nav-area a):not(header a):not(footer a):not(.tag):not(.category-display)');
  console.log('Applying random colors to', links.length, 'links');
  
  links.forEach(link => {
    const randomColor = boldColors[Math.floor(Math.random() * boldColors.length)];
    link.style.setProperty('--random-link-color', randomColor);
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