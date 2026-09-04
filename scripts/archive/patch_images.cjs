const fs = require('fs');
let file = 'src/components/sections/HorizontalGallery.tsx';
let content = fs.readFileSync(file, 'utf8');

const img1 = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2574&auto=format&fit=crop';
const img2 = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2574&auto=format&fit=crop';
const img3 = 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2574&auto=format&fit=crop';
const img4 = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2574&auto=format&fit=crop';

// Replace all existing image urls
content = content.replace(/image: ".*?"/g, (match) => {
  if (match.includes('1600607686527') || match.includes('1600585154340') || match.includes('1545324418')) return `image: "${img1}"`;
  if (match.includes('1600607687920') || match.includes('1598928308477') || match.includes('1497366216548')) return `image: "${img2}"`;
  if (match.includes('1600566753190') || match.includes('1512917774080') || match.includes('1510798831971')) return `image: "${img3}"`;
  if (match.includes('1600210492493') || match.includes('1600596542815') || match.includes('1618221195710')) return `image: "${img4}"`;
  return match; // fallback
});

fs.writeFileSync(file, content);
console.log("Images patched.");
