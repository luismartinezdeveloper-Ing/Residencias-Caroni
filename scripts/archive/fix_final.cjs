const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveElevationViewer.tsx', 'utf8');

const anchor = '        {/* Focused Unit Highlight Strip */}';
const startIdx = content.indexOf(anchor);

if (startIdx !== -1) {
  content = content.slice(0, startIdx) + 
`        {/* Focused Unit Highlight Strip */}
        <div className="bg-[#FAF9F6] border border-[#1B1813] p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-meta text-[9px] text-[#8C7452] font-semibold tracking-wider">
                UNIDAD ACTIVA EN CORTE
              </span>
            </div>
            <div className="font-display text-xl sm:text-2xl text-[#1B1813]">
              {selectedUnit.name} — Nivel {selectedUnit.level} ({selectedUnit.totalArea.toLocaleString('es-VE')} m²)
            </div>
            <div className="font-serif text-xs text-[#8C8678]">
              {selectedUnit.distinctiveAttribute}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
`;
  fs.writeFileSync('src/components/InteractiveElevationViewer.tsx', content);
  console.log("Fixed!");
}
