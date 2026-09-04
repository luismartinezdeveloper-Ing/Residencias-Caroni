const fs = require('fs');
const file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{selectedUnit.totalArea.toLocaleString\('es-VE', \{ minimumFractionDigits: 2 \}\)\} m²/;

const restored = `{selectedUnit.totalArea.toLocaleString('es-VE', { minimumFractionDigits: 2 })} m²
                      </span>
                    </div>`;

content = content.replace(regex, restored);
fs.writeFileSync(file, content);
console.log('Fixed the mess 2');
