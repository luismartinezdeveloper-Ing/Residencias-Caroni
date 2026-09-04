const fs = require('fs');
let file = 'src/components/sections/HorizontalGallery.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace "El Refugio Interior" image which might be broken
// Old image: https://images.unsplash.com/photo-1600566753086-00f18efc2291?q=80&w=2574&auto=format&fit=crop
// New image: https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2574&auto=format&fit=crop or 1600596542815-ffad4c1539a9
content = content.replace(
  'https://images.unsplash.com/photo-1600566753086-00f18efc2291?q=80&w=2574&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2574&auto=format&fit=crop'
);

fs.writeFileSync(file, content);
console.log("Fixed gallery image.");
