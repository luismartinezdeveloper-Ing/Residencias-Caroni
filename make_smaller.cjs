const fs = require('fs');
const file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Grid columns
content = content.replace(
  'className="lg:col-span-7 xl:col-span-8 relative',
  'className="lg:col-span-8 xl:col-span-9 relative'
);
content = content.replace(
  'className="lg:col-span-5 xl:col-span-4 bg-white border-t lg:border-t-0',
  'className="lg:col-span-4 xl:col-span-3 bg-white border-t lg:border-t-0'
);

// 2. Zoom Controls
content = content.replace(
  /w-7 h-7 sm:w-8 sm:h-8/g,
  'w-6 h-6 sm:w-7 sm:h-7'
);
content = content.replace(
  /px-2\.5 h-7 sm:h-8/g,
  'px-2 h-6 sm:h-7'
);

// 3. Compact inner buttons padding
// Estratos
content = content.replace(
  /px-2\.5 py-1 rounded-full border/g,
  'px-2 py-0.5 sm:py-1 rounded-full border'
);
// Camera presets
content = content.replace(
  /px-2 sm:px-2\.5 py-1 sm:py-1\.5 rounded-full border/g,
  'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border'
);

fs.writeFileSync(file, content);
console.log("Made UI smaller.");
