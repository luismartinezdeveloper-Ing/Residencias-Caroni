const fs = require('fs');
let file = 'src/components/sections/InteractiveElevationViewer.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 border-l-0 sm:border-l border-[#C9C4B5]/60 sm:pl-6">`;

const replacement = `            <div className="flex-1 border-l-0 sm:border-l border-[#C9C4B5]/60 sm:pl-6 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                <div>
                  <div className="font-meta text-[8px] text-[#8C8678]">ÁREA TECHADA</div>
                  <div className="font-mono text-sm font-semibold text-[#1B1813]">{selectedUnit.interiorArea.toLocaleString('es-VE')} m²</div>
                </div>
                <div>
                  <div className="font-meta text-[8px] text-[#8C8678]">ÁREA ABIERTA</div>
                  <div className="font-mono text-sm font-semibold text-[#1B1813]">{(selectedUnit.terraceArea + (selectedUnit.gardenArea || 0)).toLocaleString('es-VE')} m²</div>
                </div>
                <div>
                  <div className="font-meta text-[8px] text-[#8C8678]">ÁREA TOTAL</div>
                  <div className="font-mono text-sm font-bold text-[#8C7452]">{selectedUnit.totalArea.toLocaleString('es-VE')} m²</div>
                </div>
                <div>
                  <div className="font-meta text-[8px] text-[#8C8678]">ESTACIONAMIENTO</div>
                  <div className="font-mono text-sm font-semibold text-[#1B1813]">4 Puestos</div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#C9C4B5]/40">
                <div className="font-meta text-[8px] text-[#8C8678] mb-1">PROGRAMA ARQUITECTÓNICO</div>
                <div className="font-sans text-[10px] text-[#1B1813] leading-relaxed">
                  {selectedUnit.roomList.join(' · ')}
                </div>
              </div>
            </div>`;

if(content.includes(target)) {
  const fullTarget = `            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 border-l-0 sm:border-l border-[#C9C4B5]/60 sm:pl-6">
              <div>
                <div className="font-meta text-[8px] text-[#8C8678]">ÁREA TECHADA</div>
                <div className="font-mono text-sm font-semibold text-[#1B1813]">{selectedUnit.interiorArea.toLocaleString('es-VE')} m²</div>
              </div>
              <div>
                <div className="font-meta text-[8px] text-[#8C8678]">ÁREA ABIERTA</div>
                <div className="font-mono text-sm font-semibold text-[#1B1813]">{(selectedUnit.terraceArea + (selectedUnit.gardenArea || 0)).toLocaleString('es-VE')} m²</div>
              </div>
              <div>
                <div className="font-meta text-[8px] text-[#8C8678]">ÁREA TOTAL</div>
                <div className="font-mono text-sm font-bold text-[#8C7452]">{selectedUnit.totalArea.toLocaleString('es-VE')} m²</div>
              </div>
              <div>
                <div className="font-meta text-[8px] text-[#8C8678]">ESTACIONAMIENTO</div>
                <div className="font-mono text-sm font-semibold text-[#1B1813]">4 Puestos</div>
              </div>
            </div>`;
  content = content.replace(fullTarget, replacement);
  fs.writeFileSync(file, content);
  console.log("InteractiveElevationViewer updated with roomList.");
} else {
  console.log("Target not found in InteractiveElevationViewer.");
}
