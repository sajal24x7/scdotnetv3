// bg-color-randomizer.js - Generates random backgrounds on page load using your custom color palette
document.addEventListener('DOMContentLoaded', function() {
  // Your custom color palette (HSL values converted to RGB)
  const lightColors = [
    '209, 237, 252', // hsl(203, 100%, 87%)
    '229, 236, 248', // hsl(225, 75%, 90%)
    '244, 222, 245', // hsl(284, 54%, 89%)
    '252, 209, 244', // hsl(323, 100%, 90%)
    '252, 218, 229', // hsl(344, 98%, 92%)
    '254, 218, 184', // hsl(16, 97%, 92%)
    '252, 245, 184', // hsl(38, 96%, 90%)
    '232, 242, 204', // hsl(78, 44%, 87%)
    '191, 231, 207', // hsl(137, 50%, 84%)
    '151, 219, 204', // hsl(158, 66%, 77%)
    '174, 219, 219', // hsl(178, 37%, 81%)
    '232, 236, 248', // hsl(245, 45%, 89%)
    '247, 209, 252'  // hsl(284, 100%, 90%)
  ];

  // Dark mode colors - subtle grays with hints of the original color (iPhone Pro style)
  const darkColors = [
    '45, 47, 51',    // Blue-gray hint
    '45, 45, 52',    // Periwinkle-gray hint
    '50, 45, 52',    // Purple-gray hint
    '52, 45, 50',    // Magenta-gray hint
    '52, 47, 48',    // Pink-gray hint
    '52, 48, 45',    // Orange-gray hint
    '52, 52, 45',    // Yellow-gray hint
    '48, 52, 45',    // Green-gray hint
    '45, 52, 48',    // Emerald-gray hint
    '45, 52, 50',    // Teal-gray hint
    '45, 50, 52',    // Cyan-gray hint
    '47, 45, 52',    // Blue-purple-gray hint
    '50, 45, 52'     // Violet-gray hint
  ];

  // Randomly select colors from the appropriate palette
  const isDarkMode = document.documentElement.classList.contains('dark') ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;

  const colors = isDarkMode ? darkColors : lightColors;
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // Select a second color for the gradient (ensuring it's different from the first)
  let secondColor;
  do {
    secondColor = colors[Math.floor(Math.random() * colors.length)];
  } while (secondColor === randomColor);

  // Set the CSS variable for background color
  document.documentElement.style.setProperty('--color-bg', randomColor);

  // Get the corresponding dark mode colors
  const darkModeColor = isDarkMode ? randomColor : darkColors[lightColors.indexOf(randomColor)];
  const darkModeSecondColor = isDarkMode ? secondColor : darkColors[lightColors.indexOf(secondColor)];
  
  // Create and apply the gradient background
  applyGradientBackground(randomColor, secondColor, darkModeColor, darkModeSecondColor);
  
  // Listen for theme changes and update colors accordingly
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const lightColor = lightColors[lightColors.indexOf(randomColor)] || lightColors[0];
    const lightColor2 = lightColors[lightColors.indexOf(secondColor)] || lightColors[1];
    const darkColor = darkColors[lightColors.indexOf(randomColor)] || darkColors[0];
    const darkColor2 = darkColors[lightColors.indexOf(secondColor)] || darkColors[1];

    if (event.matches) {
      document.documentElement.style.setProperty('--color-bg', darkColor);
      applyGradientBackground(darkColor, darkColor2, darkColor, darkColor2);
    } else {
      document.documentElement.style.setProperty('--color-bg', lightColor);
      applyGradientBackground(lightColor, lightColor2, darkColor, darkColor2);
    }
  });
});

// Function to create a darker version of a color for dark mode (no longer needed with predefined dark colors)
// Keeping for compatibility
function createDarkerVersion(rgbString) {
  return rgbString; // Not used anymore, but keeping for compatibility
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