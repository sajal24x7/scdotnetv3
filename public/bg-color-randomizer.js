// bg-color-randomizer.js - Generates random pastel backgrounds on page load
document.addEventListener('DOMContentLoaded', function() {
  // Define an array of bolder pastel colors (RGB values)
  const pastelColors = [
    '255, 200, 200', // Bolder Pink
    '200, 255, 200', // Bolder Green
    '200, 200, 255', // Bolder Blue
    '255, 255, 180', // Bolder Yellow
    '255, 200, 255', // Bolder Purple
    '180, 255, 255', // Bolder Cyan
    '255, 210, 180', // Bolder Orange
    '210, 255, 210', // Bolder Mint
    '255, 230, 210', // Bolder Seashell
    '230, 255, 240', // Bolder Mint Cream
    '215, 235, 255', // Bolder Alice Blue
    '255, 245, 180', // Bolder Beige
    '255, 225, 180', // Bolder Old Lace
    '255, 220, 200', // Bolder Linen
    '255, 225, 200'  // Bolder Antique White
  ];

  // Randomly select a color from the array
  const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  
  // Select a second color for the gradient (ensuring it's different from the first)
  let secondColor;
  do {
    secondColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  } while (secondColor === randomColor);
  
  // Set the CSS variable for background color
  document.documentElement.style.setProperty('--color-bg', randomColor);
  
  // For dark mode, create darker versions of the selected colors
  const darkModeColor = createDarkerVersion(randomColor);
  const darkModeSecondColor = createDarkerVersion(secondColor);
  
  // Create and apply the gradient background
  applyGradientBackground(randomColor, secondColor, darkModeColor, darkModeSecondColor);
  
  // Listen for theme changes and update colors accordingly
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
      document.documentElement.style.setProperty('--color-bg', darkModeColor);
      applyGradientBackground(darkModeColor, darkModeSecondColor, darkModeColor, darkModeSecondColor);
    } else {
      document.documentElement.style.setProperty('--color-bg', randomColor);
      applyGradientBackground(randomColor, secondColor, darkModeColor, darkModeSecondColor);
    }
  });
});

// Function to create a darker version of a color for dark mode
function createDarkerVersion(rgbString) {
  const rgbValues = rgbString.split(',').map(num => parseInt(num.trim(), 10));
  
  // Make the color darker by reducing each RGB component, but keep more saturation
  const darkerValues = rgbValues.map(value => {
    // Convert to a darker shade, but maintain more saturation
    return Math.max(Math.floor(value * 0.35), 35);
  });
  
  return darkerValues.join(', ');
}

// Function to apply a gradient background
function applyGradientBackground(color1, color2, darkColor1, darkColor2) {
  // Create gradient CSS with higher opacity for bolder colors
  const lightGradient = `
    linear-gradient(
      135deg, 
      rgba(${color1}, 1) 0%, 
      rgba(${color2}, 0.9) 100%
    )
  `;
  
  const darkGradient = `
    linear-gradient(
      135deg, 
      rgba(${darkColor1}, 1) 0%, 
      rgba(${darkColor2}, 0.9) 100%
    )
  `;
  
  // Apply gradient to the body element
  const body = document.querySelector('body');
  if (body) {
    if (document.documentElement.classList.contains('dark')) {
      body.style.background = darkGradient;
    } else {
      body.style.background = lightGradient;
    }
  }
  
  // Also apply a subtle texture overlay (optional)
  if (body) {
    body.style.backgroundImage = document.documentElement.classList.contains('dark') 
      ? `${darkGradient}, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23ffffff' fill-opacity='0.05' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`
      : `${lightGradient}, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23000000' fill-opacity='0.05' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`;
    body.style.backgroundBlendMode = 'normal, overlay';
  }
} 