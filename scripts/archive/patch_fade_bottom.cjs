const fs = require('fs');
let content = fs.readFileSync('src/components/ResidenceShowcase.tsx', 'utf8');

const target = `        </div>)}
      </div>
    </section>`;

const replacement = `        </div>)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/ResidenceShowcase.tsx', content);
  console.log('Bottom part patched.');
} else {
  console.log('Bottom part not found.');
}
