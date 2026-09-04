const fs = require('fs');
let content = fs.readFileSync('src/components/ui/ArchitecturalDrawings.tsx', 'utf8');

const textToReplace = `<text x="185" y="68" fill="#8C7452" fontSize="9" fontFamily="Calibri, Inter" letterSpacing="0.15em" textAnchor="middle">
                JARDÍN PRIVADO EXCLUSIVO ({orientation === 'Norte' ? '350,89' : '280,40'} M²)
              </text>`;
              
const replacement = `<text x={orientation === 'Norte' ? "185" : "250"} y="68" fill="#8C7452" fontSize="9" fontFamily="Calibri, Inter" letterSpacing="0.15em" textAnchor="middle">
                JARDÍN PRIVADO EXCLUSIVO ({orientation === 'Norte' ? '350,89' : '280,40'} M²)
              </text>`;

content = content.replace(textToReplace, replacement);
fs.writeFileSync('src/components/ui/ArchitecturalDrawings.tsx', content);
console.log("Alignment fine-tuned");
