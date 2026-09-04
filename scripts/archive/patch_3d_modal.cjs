const fs = require('fs');
let file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                    <div className="flex justify-between text-[#8C7452] font-semibold pt-0.5 text-[11px]">
                      <span>Estacionamiento:</span>
                      <span>{selectedUnit.parkingSpots} puestos + {selectedUnit.storageUnits} maletero</span>
                    </div>
                  </div>

                  {/* Distinctive Trait Quote */}`;

const replacement = `                    <div className="flex justify-between text-[#8C7452] font-semibold pt-0.5 text-[11px]">
                      <span>Estacionamiento:</span>
                      <span>{selectedUnit.parkingSpots} puestos + {selectedUnit.storageUnits} maletero</span>
                    </div>
                  </div>
                  
                  {/* Espacios Detallados (roomList) */}
                  <div className="py-2 border-b border-[#C9C4B5]">
                    <div className="font-meta text-[10px] text-[#8C8678] tracking-widest uppercase mb-1.5">Distribución de Espacios</div>
                    <ul className="text-[#1B1813] font-sans text-[11px] space-y-1 pl-3 list-disc marker:text-[#8C7452]">
                      {selectedUnit.roomList.map((room, i) => (
                        <li key={i}>{room}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Distinctive Trait Quote */}`;

if(content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("3D Modal updated with roomList.");
} else {
  console.log("Target not found in 3D Modal.");
}
