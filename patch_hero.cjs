const fs = require('fs');
let content = fs.readFileSync('src/components/HeroCinematic.tsx', 'utf8');

const target = `<div className="space-y-3 font-serif text-xs">
              <div className="flex justify-between py-1 border-b border-[#C9C4B5]/60">
                <span className="text-[#8C8678]">Régimen Jurídico:</span>
                <span className="font-semibold text-[#1B1813]">{BRAND_INFO.regime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#C9C4B5]/60">
                <span className="text-[#8C8678]">Superficie Asignada:</span>
                <span className="font-mono font-semibold text-[#1B1813]">{totalMetros.toLocaleString('es-VE')} m²</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#C9C4B5]/60">
                <span className="text-[#8C8678]">Cobranza Escrow H1:</span>
                <span className="font-mono font-bold text-[#8C7452]">USD 1.144.753</span>
              </div>
              <div className="flex justify-between py-1 text-[#1B1813]">
                <span className="text-[#8C8678]">Entrega Estimada:</span>
                <span className="font-semibold text-[#1B1813]">{BRAND_INFO.delivery}</span>
              </div>
            </div>`;

const replacement = `<div className="space-y-3 font-serif text-xs">
              <div className="flex justify-between py-1 border-b border-[#C9C4B5]/60">
                <span className="text-[#8C8678]">Régimen Jurídico:</span>
                <span className="font-semibold text-[#1B1813]">{BRAND_INFO.regime}</span>
              </div>
              <div className="flex justify-between py-1 text-[#1B1813]">
                <span className="text-[#8C8678]">Superficie Asignada:</span>
                <span className="font-mono font-semibold text-[#1B1813]">{totalMetros.toLocaleString('es-VE')} m²</span>
              </div>
            </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/HeroCinematic.tsx', content);
  console.log('Successfully patched HeroCinematic');
} else {
  console.log('Target not found, trying a more flexible replacement...');
  
  // Alternative replacement if there are indentation differences
  const lines = content.split('\n');
  let startIdx = -1;
  let endIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Cobranza Escrow H1:')) {
      startIdx = i - 1; // start of the div
    }
    if (lines[i].includes('Entrega Estimada:')) {
      endIdx = i + 2; // end of the div
    }
  }
  
  if (startIdx !== -1 && endIdx !== -1) {
    // Remove bottom border from Superficie Asignada
    for (let i = startIdx - 5; i < startIdx; i++) {
       if (lines[i] && lines[i].includes('Superficie Asignada')) {
           // The line before this should have the border
           lines[i-1] = lines[i-1].replace('border-b border-[#C9C4B5]/60', 'text-[#1B1813]');
       }
    }
    
    // Remove the two rows
    lines.splice(startIdx, endIdx - startIdx + 1);
    fs.writeFileSync('src/components/HeroCinematic.tsx', lines.join('\n'));
    console.log('Successfully patched HeroCinematic via flexible replace');
  } else {
    console.log('Could not find the lines to remove.');
  }
}
