const fs = require('fs');
const file = 'src/components/sections/ResidenceShowcase.tsx';
let content = fs.readFileSync(file, 'utf8');

// The slide pills (9 slides pills)
content = content.replace(
  /className=\{\`relative font-meta text-\[9px\] sm:text-\[9\.5px\] px-2\.5 py-1\.5 whitespace-nowrap transition-colors z-10 cursor-pointer \$\{/g,
  'className={`relative font-meta text-[9px] sm:text-[9.5px] px-2.5 py-1.5 whitespace-nowrap transition-colors z-10 cursor-pointer rounded-full ${'
);

// The active pill background
content = content.replace(
  'className="absolute inset-0 bg-[#1B1813] -z-10 shadow-xs"',
  'className="absolute inset-0 bg-[#1B1813] -z-10 shadow-xs rounded-full"'
);

// The control bar wrapper
content = content.replace(
  'className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white border border-[#C9C4B5] p-2 gap-2 shadow-xs"',
  'className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white border border-[#C9C4B5] p-2 gap-2 shadow-xs rounded-2xl sm:rounded-full"'
);

fs.writeFileSync(file, content);
console.log("Patched ResidenceShowcase again.");
