const fs = require('fs');
let content = fs.readFileSync('src/components/HeroCinematic.tsx', 'utf8');

const oldCTA = `<motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={onExploreUnits}
                className="font-meta text-[10px] sm:text-[11px] px-6 py-3 bg-[#1B1813] text-[#EFEBE0] hover:bg-[#8C7452] transition-colors tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-xs rounded-full"
              >
                <span>INICIAR RECORRIDO</span>
                <span>↓</span>
              </motion.button>`;

const newCTA = `<motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#8C7452' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={onExploreUnits}
                className="group font-meta text-[10px] sm:text-[11px] px-7 py-3 bg-[#1B1813] text-[#EFEBE0] transition-colors tracking-wider flex items-center justify-center space-x-2.5 cursor-pointer rounded-full"
              >
                <span>Explorar la obra</span>
                <motion.span
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="group-hover:text-white"
                >
                  ↓
                </motion.span>
              </motion.button>`;

if (content.includes(oldCTA)) {
  content = content.replace(oldCTA, newCTA);
  fs.writeFileSync('src/components/HeroCinematic.tsx', content);
  console.log('Hero CTA patched');
} else {
  console.log('Hero CTA not found');
}
