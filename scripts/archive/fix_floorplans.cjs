const fs = require('fs');

// 1. Fix Architectural3DModal.tsx
let modalFile = 'src/components/modals/Architectural3DModal.tsx';
let modalContent = fs.readFileSync(modalFile, 'utf8');

const buttonsToReplace = `<div className="flex border border-[#1B1813] bg-white p-0.5 shadow-sm">
                          <button 
                            onClick={() => setPlanType('Social')}
                            className={\`font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer \${
                              planType === 'Social' 
                                ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold' 
                                : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                            }\`}
                          >
                            {selectedUnit.typology === 'Jardín' ? 'PLANTA INFERIOR (SOCIAL)' : selectedUnit.typology === 'Mirador' ? 'PLANTA PRINCIPAL' : 'ÁREA SOCIAL'}
                          </button>
                          <button 
                            onClick={() => setPlanType('Privada')}
                            className={\`font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer \${
                              planType === 'Privada' 
                                ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold' 
                                : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                            }\`}
                          >
                            {selectedUnit.typology === 'Jardín' ? 'PLANTA SUPERIOR (PRIVADA)' : selectedUnit.typology === 'Mirador' ? 'NIVEL DE HABITACIONES' : 'ÁREA PRIVADA'}
                          </button>
                        </div>`;

const newButtons = `                        <div className="flex border border-[#1B1813] bg-white p-0.5 shadow-sm">
                          {selectedUnit.typology !== 'Residencia' ? (
                            <>
                              <button 
                                onClick={() => setPlanType('Social')}
                                className={\`font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer \${
                                  planType === 'Social' 
                                    ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold' 
                                    : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                                }\`}
                              >
                                {selectedUnit.typology === 'Jardín' ? 'PLANTA INFERIOR (SOCIAL)' : 'PLANTA PRINCIPAL'}
                              </button>
                              <button 
                                onClick={() => setPlanType('Privada')}
                                className={\`font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer \${
                                  planType === 'Privada' 
                                    ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold' 
                                    : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                                }\`}
                              >
                                {selectedUnit.typology === 'Jardín' ? 'PLANTA SUPERIOR (PRIVADA)' : 'NIVEL DE HABITACIONES'}
                              </button>
                            </>
                          ) : (
                            <span className="font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap bg-[#1B1813] text-[#EFEBE0] font-semibold">
                              PLANTA COMPLETA (UNA PLANTA)
                            </span>
                          )}
                        </div>`;
modalContent = modalContent.replace(buttonsToReplace, newButtons);
fs.writeFileSync(modalFile, modalContent);


// 2. Fix ArchitecturalDrawings.tsx
let drawingsFile = 'src/components/ui/ArchitecturalDrawings.tsx';
let drawingsContent = fs.readFileSync(drawingsFile, 'utf8');

const schemaStart = `export const FloorPlanSchema: React.FC<{`;
const schemaRender = `        {/* Exterior Wall */}
        <rect x="30" y="30" width="440" height="220" stroke="#1B1813" strokeWidth="1.8" fill="#FAF9F6" />
        {planType === 'Privada' ? (`;

const newSchemaRender = `        {/* Exterior Wall */}
        <rect x="30" y="30" width="440" height="220" stroke="#1B1813" strokeWidth="1.8" fill="#FAF9F6" />
        {typology === 'Residencia' ? (
          <>
            {/* FULL FLOOR PLAN FOR RESIDENCIA */}
            {/* Social Half */}
            <rect x="30" y="30" width="220" height="220" stroke="#1B1813" strokeWidth="1" fill="none" />
            <rect x="30" y="30" width="220" height="70" stroke="#1B1813" strokeWidth="1" fill="none" />
            <text x="140" y="72" fill="#8C8678" fontSize="9" fontFamily="Calibri, Inter" letterSpacing="0.18em" textAnchor="middle">
              TERRAZA CONTINUA (92 M²)
            </text>
            <text x="140" y="140" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Gran Salón & Comedor</text>
            <text x="140" y="210" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="middle">COCINA & FAENA</text>
            
            {/* Private Half */}
            {/* Master Suite */}
            <rect x="250" y="30" width="220" height="100" stroke="#1B1813" strokeWidth="1" fill="#F4F1EA" />
            <text x="360" y="70" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Master Suite</text>
            <text x="360" y="90" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">VESTIER & BAÑO DOBLE</text>
            {/* Secondary Suites */}
            <rect x="250" y="130" width="110" height="120" stroke="#1B1813" strokeWidth="1" fill="none" />
            <text x="305" y="180" fill="#1B1813" fontSize="10" fontFamily="EB Garamond" textAnchor="middle">Suite 02</text>
            <rect x="360" y="130" width="110" height="120" stroke="#1B1813" strokeWidth="1" fill="none" />
            <text x="415" y="180" fill="#1B1813" fontSize="10" fontFamily="EB Garamond" textAnchor="middle">Suite 03</text>
          </>
        ) : planType === 'Privada' ? (`;

drawingsContent = drawingsContent.replace(schemaRender, newSchemaRender);

// Also fix the ESQUEMA ARQUITECTÓNICO text logic:
const titleLogic = `            ESQUEMA ARQUITECTÓNICO · DISTRIBUCIÓN {planType.toUpperCase()}
          </span>
          <h4 className="font-display text-lg text-[#1B1813]">
            {typology === 'Jardín'
              ? (planType === 'Social' ? \`Planta Baja (\${orientation})\` : \`Planta Alta Privada (\${orientation})\`)
              : typology === 'Residencia'
              ? \`Planta Tipo (\${orientation})\`
              : (planType === 'Social' ? \`Planta Principal de Coronación (\${orientation})\` : \`Nivel de Habitaciones (\${orientation})\`)}
          </h4>`;

const newTitleLogic = `            ESQUEMA ARQUITECTÓNICO · {typology === 'Residencia' ? 'PLANTA ÚNICA' : \`DISTRIBUCIÓN \${planType.toUpperCase()}\`}
          </span>
          <h4 className="font-display text-lg text-[#1B1813]">
            {typology === 'Jardín'
              ? (planType === 'Social' ? \`Planta Baja (\${orientation})\` : \`Planta Alta Privada (\${orientation})\`)
              : typology === 'Residencia'
              ? \`Planta Tipo (\${orientation})\`
              : (planType === 'Social' ? \`Planta Principal de Coronación (\${orientation})\` : \`Nivel de Habitaciones (\${orientation})\`)}
          </h4>`;

drawingsContent = drawingsContent.replace(titleLogic, newTitleLogic);
fs.writeFileSync(drawingsFile, drawingsContent);

console.log("Patched 3D Modal and Drawings for single-floor Residencia.");
