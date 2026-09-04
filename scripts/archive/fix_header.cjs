const fs = require('fs');
const file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex items-center gap-2 order-3 sm:order-2 overflow-x-auto no-scrollbar max-w-full">[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Header Right Actions: Fullscreen Focus \+ Close \*\/\}/;

const newHeader = `{/* 4 Main View Modes Tabs (Clean, fully responsive) */}
              <div className="flex border border-[#1B1813] bg-white p-0.5 overflow-x-auto no-scrollbar max-w-full order-3 sm:order-2">
                {[
                  { id: 'assembled', label: '01 · MONOLÍTICO' },
                  { id: 'exploded', label: '02 · DESPIECE VERTICAL' },
                  { id: 'unit', label: '03 · AISLAR UNIDAD' },
                  { id: 'floorplan', label: '04 · PLANTA ARQUITECTÓNICA' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={\`font-meta text-[8px] sm:text-[9.5px] px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap transition-colors cursor-pointer \${
                      viewMode === mode.id
                        ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold'
                        : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                    }\`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Header Right Actions: Fullscreen Focus + Close */}`;

content = content.replace(regex, newHeader);
fs.writeFileSync(file, content);
console.log('Fixed header');
