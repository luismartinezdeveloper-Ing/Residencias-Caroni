const fs = require('fs');
let content = fs.readFileSync('src/components/ResidenceShowcase.tsx', 'utf8');

const target = `{/* Gallery Content Layout (Scroll Continuous) */} 
        <div className="space-y-24">`;

const replacement = `{/* Gallery Content Layout (Scroll Continuous) */} 
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedUnit.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-24"
          >`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  // Also need to close the motion.div and AnimatePresence
  // The structure ends with:
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   );
  
  // We can just replace `</section>` with `</motion.div>\n        </AnimatePresence>\n      </div>\n    </section>` 
  // Wait, the structure is:
  // <section>
  //   <div>
  //     <div className="space-y-24"> ... </div>
  //   </div>
  // </section>
  // Let's check how it ends.
  
  fs.writeFileSync('src/components/ResidenceShowcase.tsx', content);
  console.log('Top part patched.');
} else {
  console.log('Top part not found.');
}
