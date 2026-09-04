const fs = require('fs');
let content = fs.readFileSync('src/components/ResidenceShowcase.tsx', 'utf8');

const startIdx = content.indexOf('        {/* Section Header */}');
const endIdx = content.indexOf('        {/* Gallery Content Layout (Scroll Continuous) */}');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + content.slice(endIdx);
  
  content = content.replace(
    'className="w-full bg-[#FAF9F6] border-b border-[#1B1813] py-12 sm:py-16"',
    'className="w-full bg-[#FAF9F6] border-b border-[#1B1813] pb-12 sm:pb-16 pt-0"'
  );
  
  fs.writeFileSync('src/components/ResidenceShowcase.tsx', content);
  console.log('Patched');
} else {
  console.log('Not found');
}
