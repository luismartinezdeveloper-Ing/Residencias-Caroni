const fs = require('fs');
const file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = 'className="bg-white/95 backdrop-blur-xs border border-[#C9C4B5] p-1 sm:p-1.5 flex flex-col gap-1 shadow-xs ${(viewMode === \\'floorplan\\' || viewMode === \\'unit\\') ? \\'pointer-events-none\\' : \\'pointer-events-auto\\'} max-w-full overflow-hidden"';
const replacement = 'className={`bg-white/95 backdrop-blur-xs border border-[#C9C4B5] p-1 sm:p-1.5 flex flex-col gap-1 shadow-xs ${(viewMode === \\'floorplan\\' || viewMode === \\'unit\\') ? \\'pointer-events-none\\' : \\'pointer-events-auto\\'} max-w-full overflow-hidden`}';

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
