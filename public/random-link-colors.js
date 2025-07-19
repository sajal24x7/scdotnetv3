/**
 * Random Colored Link Underlines
 * This script applies a randomly selected bold color to link underlines on hover
 */
document.addEventListener('DOMContentLoaded', () => {
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
  
  // Apply random color on mouseover
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      const randomColor = boldColors[Math.floor(Math.random() * boldColors.length)];
      link.style.setProperty('--random-link-color', randomColor);
      link.classList.add('random-underline');
    });
    
    link.addEventListener('mouseleave', () => {
      link.classList.remove('random-underline');
    });
  });
}); 