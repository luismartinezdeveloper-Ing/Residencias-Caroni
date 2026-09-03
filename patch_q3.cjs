const fs = require('fs');

// 1. Update brandData.ts
let brandData = fs.readFileSync('src/data/brandData.ts', 'utf8');
brandData = brandData.replace("delivery: 'Q3 2028'", "delivery: '2028'");
fs.writeFileSync('src/data/brandData.ts', brandData);

// 2. Update HeroCinematic.tsx
let heroData = fs.readFileSync('src/components/HeroCinematic.tsx', 'utf8');
heroData = heroData.replace(
  '<span className="font-semibold text-[#1B1813]">2028</span>',
  '<span className="font-semibold text-[#1B1813]">{BRAND_INFO.delivery}</span>'
);
fs.writeFileSync('src/components/HeroCinematic.tsx', heroData);

console.log("Q3 removed and HeroCinematic restored to use BRAND_INFO.delivery");
