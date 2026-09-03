const fs = require('fs');
let file = 'src/components/sections/HorizontalGallery.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the lake house image
content = content.replace(
  '1510798831971-661eb04b3739',
  '1486406146926-c627a92ad1ab'
);

fs.writeFileSync(file, content);
console.log("Patched Image 3.");
