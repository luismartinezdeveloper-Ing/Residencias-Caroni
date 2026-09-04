const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveElevationViewer.tsx', 'utf8');

const targetStr = content.substring(
  content.indexOf('<div className="space-y-2">'),
  content.indexOf('</div>', content.indexOf('                );', content.indexOf('<div className="space-y-2">'))) + 24
);

// We will just rewrite from 146 to the end of the div.
const lines = content.split('\n');
let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div className="space-y-2">')) {
    start = i;
  }
  if (start !== -1 && i > start && lines[i].includes('              </div>')) {
    end = i;
    break;
  }
}

if (start !== -1 && end !== -1) {
  const replacementLines = `            <div className="bg-white rounded-2xl border border-[#1B1813]/10 overflow-hidden shadow-sm">
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
            </div>`.split('\\n');

  // Need to fix my replacement string logic in the bash script
  // Ah, the split will just create one element. That's fine.
  
  lines.splice(start, end - start + 1, replacementLines);
  fs.writeFileSync('src/components/InteractiveElevationViewer.tsx', lines.join('\\n'));
  console.log('Successfully patched via array splice');
} else {
  console.log('Start or end not found');
}
