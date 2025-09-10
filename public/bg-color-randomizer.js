// bg-color-randomizer.js - Generates random gradient backgrounds on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Background color randomizer loaded');
  
  // Add a small delay to ensure all styles are loaded
  setTimeout(() => {
    applyRandomGradient();
  }, 100);
  
  // Watch for any changes to the body element and reapply gradients
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        console.log('Body class changed, reapplying gradient');
        setTimeout(() => {
          applyRandomGradient();
        }, 50);
      }
    });
  });
  
  const body = document.querySelector('body');
  if (body) {
    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
  }
});

// Also run on window load to ensure it works even if DOMContentLoaded already fired
window.addEventListener('load', function() {
  console.log('Window loaded, applying gradient');
  setTimeout(() => {
    applyRandomGradient();
  }, 200);
});

function applyRandomGradient() {
  // Add a style tag to override any conflicting styles
  let styleTag = document.getElementById('gradient-override');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'gradient-override';
    document.head.appendChild(styleTag);
  }
  
  // Define an array of gradient definitions (each containing 2-3 colors for smooth gradients)
  const gradientDefinitions = [
    {
      name: 'Sunset',
      light: ['255, 200, 200', '255, 210, 180', '255, 230, 210'],
      dark: ['80, 50, 50', '90, 60, 40', '100, 70, 50']
    },
    {
      name: 'Ocean',
      light: ['200, 200, 255', '180, 255, 255', '215, 235, 255'],
      dark: ['40, 50, 80', '35, 70, 80', '50, 60, 100']
    },
    {
      name: 'Forest',
      light: ['200, 255, 200', '210, 255, 210', '230, 255, 240'],
      dark: ['40, 80, 50', '45, 90, 55', '60, 100, 70']
    },
    {
      name: 'Lavender',
      light: ['255, 200, 255', '255, 220, 255', '255, 240, 255'],
      dark: ['80, 50, 80', '90, 60, 90', '100, 70, 100']
    },
    {
      name: 'Golden',
      light: ['255, 255, 180', '255, 245, 180', '255, 225, 180'],
      dark: ['80, 80, 40', '90, 90, 50', '100, 100, 60']
    },
    {
      name: 'Mint',
      light: ['180, 255, 255', '200, 255, 240', '220, 255, 250'],
      dark: ['40, 80, 80', '50, 90, 85', '60, 100, 90']
    },
    {
      name: 'Rose',
      light: ['255, 220, 200', '255, 230, 220', '255, 240, 230'],
      dark: ['80, 60, 50', '90, 70, 60', '100, 80, 70']
    },
    {
      name: 'Sky',
      light: ['215, 235, 255', '225, 240, 255', '235, 245, 255'],
      dark: ['50, 60, 100', '60, 70, 110', '70, 80, 120']
    },
    {
      name: 'Peach',
      light: ['255, 225, 200', '255, 235, 210', '255, 245, 220'],
      dark: ['100, 70, 50', '110, 80, 60', '120, 90, 70']
    },
    {
      name: 'Sage',
      light: ['230, 255, 240', '240, 255, 250', '250, 255, 255'],
      dark: ['60, 100, 70', '70, 110, 80', '80, 120, 90']
    }
  ];

  // Randomly select a gradient definition
  const selectedGradient = gradientDefinitions[Math.floor(Math.random() * gradientDefinitions.length)];
  console.log('Selected gradient:', selectedGradient.name);
  
  // Set the CSS variable for background color (using first color for compatibility)
  document.documentElement.style.setProperty('--color-bg', selectedGradient.light[0]);
  
  // Create and apply the gradient background
  applyGradientBackground(selectedGradient.light, selectedGradient.dark);
  
  // Listen for theme changes and update colors accordingly
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
      document.documentElement.style.setProperty('--color-bg', selectedGradient.dark[0]);
      applyGradientBackground(selectedGradient.light, selectedGradient.dark);
    } else {
      document.documentElement.style.setProperty('--color-bg', selectedGradient.light[0]);
      applyGradientBackground(selectedGradient.light, selectedGradient.dark);
    }
  });
  
  // Inject CSS to override any conflicting styles
  const lightGradient = `linear-gradient(135deg, rgba(${selectedGradient.light[0]}, 1) 0%, rgba(${selectedGradient.light[1]}, 0.8) 50%, rgba(${selectedGradient.light[2]}, 0.9) 100%)`;
  const darkGradient = `linear-gradient(135deg, rgba(${selectedGradient.dark[0]}, 1) 0%, rgba(${selectedGradient.dark[1]}, 0.8) 50%, rgba(${selectedGradient.dark[2]}, 0.9) 100%)`;
  
  styleTag.textContent = `
    html body {
      background: ${lightGradient} !important;
    }
    .dark html body {
      background: ${darkGradient} !important;
    }
  `;
}

// Function to apply a gradient background using gradient definitions
function applyGradientBackground(lightColors, darkColors) {
  // Create smooth multi-stop gradients for both light and dark modes
  const lightGradient = `
    linear-gradient(
      135deg, 
      rgba(${lightColors[0]}, 1) 0%, 
      rgba(${lightColors[1]}, 0.8) 50%,
      rgba(${lightColors[2]}, 0.9) 100%
    )
  `;
  
  const darkGradient = `
    linear-gradient(
      135deg, 
      rgba(${darkColors[0]}, 1) 0%, 
      rgba(${darkColors[1]}, 0.8) 50%,
      rgba(${darkColors[2]}, 0.9) 100%
    )
  `;
  
  console.log('Applying gradient - Light mode:', lightGradient);
  console.log('Applying gradient - Dark mode:', darkGradient);
  
  // Apply gradient to the body element with !important to override any other styles
  const body = document.querySelector('body');
  if (body) {
    // Remove any existing background classes that might conflict
    body.classList.remove('bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-slate-50', 'bg-zinc-50', 'bg-neutral-50', 'bg-stone-50', 'bg-gray-800', 'bg-gray-900', 'bg-slate-800', 'bg-slate-900', 'bg-zinc-800', 'bg-zinc-900', 'bg-neutral-800', 'bg-neutral-900', 'bg-stone-800', 'bg-stone-900', 'bg-background');
    
    if (document.documentElement.classList.contains('dark')) {
      body.style.setProperty('background', darkGradient, 'important');
    } else {
      body.style.setProperty('background', lightGradient, 'important');
    }
    
    console.log('Applied gradient to body element');
  } else {
    console.error('Body element not found');
  }
  
  // Also apply a subtle texture overlay for depth
  if (body) {
    const backgroundImage = document.documentElement.classList.contains('dark') 
      ? `${darkGradient}, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23ffffff' fill-opacity='0.03' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`
      : `${lightGradient}, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23000000' fill-opacity='0.02' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`;
    
    body.style.setProperty('background-image', backgroundImage, 'important');
    body.style.setProperty('background-blend-mode', 'normal, overlay', 'important');
  }
} 