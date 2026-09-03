const fs = require('fs');
let content = fs.readFileSync('src/components/ResidenceShowcase.tsx', 'utf8');

// The original opening was:
// <AnimatePresence mode="wait">
//   <motion.div key={selectedUnit.id} ... className="space-y-24">

// The closing should be right before:
// {/* Action Strip: Connect Directly to Investment Structure & LOI */}

content = content.replace(
`            </div>
          </div>
        </div>

        {/* Action Strip`,
`            </div>
          </div>
        </motion.div>
        </AnimatePresence>

        {/* Action Strip`
);

fs.writeFileSync('src/components/ResidenceShowcase.tsx', content);
