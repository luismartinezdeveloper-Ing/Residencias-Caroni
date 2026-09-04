const fs = require('fs');
const file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Floor Type Toggle \(if duplex\) \*\/\}[\s\S]*?\}\)/;

const newToggle = `{/* Floor Type Toggle (Dynamic for all typologies) */}
                      <div className="flex justify-center mb-6 z-30 pointer-events-auto relative mt-4">
                        <div className="flex border border-[#1B1813] bg-white p-0.5 shadow-sm">
                          <button 
                            onClick={() => setPlanType('Social')}
                            className={\`font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 whitespace-nowrap transition-colors cursor-pointer \${
                              planType === 'Social' 
                                ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold' 
                                : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                            }\`}
                          >
                            {selectedUnit.typology === 'Jardín' ? 'PLANTA INFERIOR (SOCIAL)' : selectedUnit.typology === 'Mirador' ? 'PLANTA PRINCIPAL' : 'ÁREA SOCIAL'}
                          </button>
                          <button 
                            onClick={() => setPlanType('Privada')}
                            className={\`font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 whitespace-nowrap transition-colors cursor-pointer \${
                              planType === 'Privada' 
                                ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold' 
                                : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                            }\`}
                          >
                            {selectedUnit.typology === 'Jardín' ? 'PLANTA SUPERIOR (PRIVADA)' : selectedUnit.typology === 'Mirador' ? 'NIVEL DE HABITACIONES' : 'ÁREA PRIVADA'}
                          </button>
                        </div>
                      </div>`;

content = content.replace(regex, newToggle);
fs.writeFileSync(file, content);
console.log('Fixed floor toggle');
