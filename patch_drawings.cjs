const fs = require('fs');

let content = fs.readFileSync('src/components/ui/ArchitecturalDrawings.tsx', 'utf8');

// 1. Fix the overlap in FloorPlanSchema and dynamic areas
const target1 = `<text x="250" y="68" fill="#8C7452" fontSize="10" fontFamily="Calibri, Inter" letterSpacing="0.2em" textAnchor="middle">
                JARDÍN PRIVADO EXCLUSIVO (350,89 M²)
              </text>
              <rect x="340" y="42" width="100" height="36" stroke="#8C7452" strokeWidth="0.8" fill="none" />
              <text x="390" y="64" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="middle">
                LÁMINA DE AGUA
              </text>
              {/* Covered Terrace */}
              <rect x="30" y="100" width="440" height="40" stroke="#1B1813" strokeWidth="1" fill="none" />
              <text x="250" y="124" fill="#8C8678" fontSize="9" fontFamily="Calibri, Inter" letterSpacing="0.18em" textAnchor="middle">
                TERRAZA CUBIERTA (120,75 M²)
              </text>`;

const replacement1 = `<text x="185" y="68" fill="#8C7452" fontSize="9" fontFamily="Calibri, Inter" letterSpacing="0.15em" textAnchor="middle">
                JARDÍN PRIVADO EXCLUSIVO ({orientation === 'Norte' ? '350,89' : '280,40'} M²)
              </text>
              {orientation === 'Norte' && (
                <>
                  <rect x="340" y="42" width="100" height="36" stroke="#8C7452" strokeWidth="0.8" fill="none" />
                  <text x="390" y="64" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="middle">
                    LÁMINA DE AGUA
                  </text>
                </>
              )}
              {/* Covered Terrace */}
              <rect x="30" y="100" width="440" height="40" stroke="#1B1813" strokeWidth="1" fill="none" />
              <text x="250" y="124" fill="#8C8678" fontSize="9" fontFamily="Calibri, Inter" letterSpacing="0.18em" textAnchor="middle">
                TERRAZA CUBIERTA ({orientation === 'Norte' ? '120,75' : '110,50'} M²)
              </text>`;

content = content.replace(target1, replacement1);

// 2. Fix the area in JARDÍN SUR 310 m² -> 280 m²
content = content.replace(
  `JARDÍN SUR 310 m²`,
  `JARDÍN SUR 280 m²`
);

// 3. Fix the area in ● SELECCIONADO (970 m²) -> (931 m²) for Sur
content = content.replace(
  `● SELECCIONADO (970 m²)`,
  `● SELECCIONADO (931 m²)`
);

// 4. In case the word "JARDÍN PRIVADO 350 m²" is not matched properly
content = content.replace(
  `JARDÍN PRIVADO 350 m²`,
  `JARDÍN NORTE 350 m²`
);

fs.writeFileSync('src/components/ui/ArchitecturalDrawings.tsx', content);
console.log("Patched ArchitecturalDrawings.tsx");
