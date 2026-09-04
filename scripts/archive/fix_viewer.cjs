const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveElevationViewer.tsx', 'utf8');

// Find the line that starts with `<div className="bg-white rounded-2xl border border-[#1B1813]/10 overflow-hidden shadow-sm">              {levels.map((lvl, idx) => {`
// Actually, it's just the one huge line that was inserted. Let's find it.
const lines = content.split('\n');
let badLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ESTRATOS ARQUITECTÓNICOS (7 COTAS)')) {
    badLineIdx = i + 3; // roughly 2 or 3 lines down
    break;
  }
}

if (badLineIdx !== -1) {
  // Let's just find the exact line that has the massive string
  for(let i = badLineIdx - 2; i < badLineIdx + 5; i++) {
    if(lines[i] && lines[i].length > 1000) {
      console.log('Found massive line at', i);
      const replacementText = `            <div className="bg-white rounded-2xl border border-[#1B1813]/10 overflow-hidden shadow-sm">
              {levels.map((lvl, idx) => {
                const isSelectedLevel = lvl.units.some((u) => u.id === selectedUnit.id);
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredLevel(lvl.levelKey)}
                    onMouseLeave={() => setHoveredLevel(null)}
                    onClick={() => {
                      if (lvl.units.length > 0 && !isSelectedLevel) {
                        onSelectUnit(lvl.units[0]);
                      }
                    }}
                    className={\`px-4 py-3 border-b border-[#1B1813]/5 last:border-b-0 transition-all cursor-pointer \${
                      isSelectedLevel
                        ? 'bg-[#FAF9F6] relative'
                        : 'hover:bg-[#FAF9F6]/50'
                    }\`}
                  >
                    {isSelectedLevel && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8C7452]" />
                    )}
                    <div className="flex justify-between items-center">
                      <span className={\`font-mono text-[11px] sm:text-xs font-bold \${isSelectedLevel ? 'text-[#8C7452]' : 'text-[#8C7452]/70'}\`}>
                        {lvl.cota}
                      </span>
                      <span className="font-meta text-[9px] text-[#8C8678]">
                        {lvl.height}
                      </span>
                    </div>
                    <div className={\`font-display text-sm mt-0.5 flex items-center justify-between \${isSelectedLevel ? 'text-[#1B1813] font-semibold' : 'text-[#1B1813]/80'}\`}>
                      <span>{lvl.label}</span>
                      {isSelectedLevel && (
                        <span className="font-meta text-[8px] bg-[#8C7452] text-[#EFEBE0] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded-sm">
                          Sel.
                        </span>
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {isSelectedLevel && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="font-serif text-[11px] text-[#8C8678] mt-2 leading-snug">
                            {lvl.desc}
                          </p>
                          {/* Associated Units Quick Select */}
                          {lvl.units.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-[#C9C4B5]/60 flex gap-2 pb-1">
                              {lvl.units.map((u) => {
                                const isActive = u.id === selectedUnit.id;
                                return (
                                  <button
                                    key={u.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectUnit(u);
                                    }}
                                    className={\`px-3 py-1 text-[10px] font-sans font-medium rounded-full border transition-colors \${
                                      isActive
                                        ? 'bg-[#1B1813] text-[#EFEBE0] border-[#1B1813]'
                                        : 'bg-white text-[#1B1813] border-[#1B1813]/20 hover:border-[#1B1813]'
                                    }\`}
                                  >
                                    {u.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>`;
      lines[i] = replacementText;
      fs.writeFileSync('src/components/InteractiveElevationViewer.tsx', lines.join('\n'));
      console.log('Fixed it!');
      break;
    }
  }
}
