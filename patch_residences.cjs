const fs = require('fs');
const file = 'src/components/sections/ResidenceShowcase.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Slide step controls buttons
content = content.replace(
  /className="font-meta text-\[10px\] px-3 py-1\.5 border border-\[\#C9C4B5\] bg-white disabled:opacity-30 hover:bg-\[\#1B1813\] hover:text-\[\#EFEBE0\] hover:border-\[\#1B1813\] transition-colors flex items-center space-x-1 cursor-pointer disabled:cursor-not-allowed"/g,
  'className="font-meta text-[10px] px-3.5 py-1.5 rounded-full border border-[#C9C4B5] bg-white disabled:opacity-30 hover:bg-[#1B1813] hover:text-[#EFEBE0] hover:border-[#1B1813] transition-colors flex items-center space-x-1 cursor-pointer disabled:cursor-not-allowed"'
);

// 2. Slide indicators buttons
content = content.replace(
  /className=\{\`relative px-2 sm:px-3 py-1 sm:py-1\.5 font-meta text-\[9px\] sm:text-\[10px\] whitespace-nowrap transition-colors cursor-pointer \$\{/g,
  'className={`relative px-2 sm:px-3 py-1 sm:py-1.5 font-meta text-[9px] sm:text-[10px] whitespace-nowrap transition-colors cursor-pointer rounded-full ${'
);

// 3. Floating Lateral Navigation Arrows
content = content.replace(
  /className=\{\`absolute left-1\.5 sm:left-3 top-1\/2 -translate-y-1\/2 z-30 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border transition-all duration-200 \$\{/g,
  'className={`absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border transition-all duration-200 ${'
);
content = content.replace(
  /className=\{\`absolute right-1\.5 sm:right-3 top-1\/2 -translate-y-1\/2 z-30 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border transition-all duration-200 \$\{/g,
  'className={`absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border transition-all duration-200 ${'
);

// 4. Slide indicators container
content = content.replace(
  'className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scroll-smooth"',
  'className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scroll-smooth rounded-full p-0.5 bg-[#FAF9F6] border border-[#C9C4B5]/40"'
);

fs.writeFileSync(file, content);
console.log("Patched ResidenceShowcase.");
