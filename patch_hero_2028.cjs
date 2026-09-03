const fs = require('fs');
let content = fs.readFileSync('src/components/HeroCinematic.tsx', 'utf8');

const target = `<div className="space-y-3 font-serif text-xs">
              <div className="flex justify-between py-1 border-b border-[#C9C4B5]/60">
                <span className="text-[#8C8678]">Régimen Jurídico:</span>
                <span className="font-semibold text-[#1B1813]">{BRAND_INFO.regime}</span>
              </div>
              <div className="flex justify-between py-1 text-[#1B1813]">
                <span className="text-[#8C8678]">Superficie Asignada:</span>
                <span className="font-mono font-semibold text-[#1B1813]">{totalMetros.toLocaleString('es-VE')} m²</span>
              </div>
            </div>`;

const replacement = `<div className="space-y-3 font-serif text-xs">
              <div className="flex justify-between py-1 border-b border-[#C9C4B5]/60">
                <span className="text-[#8C8678]">Régimen Jurídico:</span>
                <span className="font-semibold text-[#1B1813]">{BRAND_INFO.regime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#C9C4B5]/60">
                <span className="text-[#8C8678]">Superficie Asignada:</span>
                <span className="font-mono font-semibold text-[#1B1813]">{totalMetros.toLocaleString('es-VE')} m²</span>
              </div>
              <div className="flex justify-between py-1 text-[#1B1813]">
                <span className="text-[#8C8678]">Entrega Estimada:</span>
                <span className="font-semibold text-[#1B1813]">2028</span>
              </div>
            </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/HeroCinematic.tsx', content);
  console.log('Successfully patched HeroCinematic to add 2028');
} else {
  console.log('Target not found, maybe indentation is different. Using fallback...');
  content = content.replace(
    '<span className="font-mono font-semibold text-[#1B1813]">{totalMetros.toLocaleString(\'es-VE\')} m²</span>\n              </div>\n            </div>',
    '<span className="font-mono font-semibold text-[#1B1813]">{totalMetros.toLocaleString(\'es-VE\')} m²</span>\n              </div>\n              <div className="flex justify-between py-1 text-[#1B1813]">\n                <span className="text-[#8C8678]">Entrega Estimada:</span>\n                <span className="font-semibold text-[#1B1813]">2028</span>\n              </div>\n            </div>'
  );
  content = content.replace(
    '<div className="flex justify-between py-1 text-[#1B1813]">\n                <span className="text-[#8C8678]">Superficie Asignada:</span>',
    '<div className="flex justify-between py-1 border-b border-[#C9C4B5]/60">\n                <span className="text-[#8C8678]">Superficie Asignada:</span>'
  );
  fs.writeFileSync('src/components/HeroCinematic.tsx', content);
}
