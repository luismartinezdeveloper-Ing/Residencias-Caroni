const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveElevationViewer.tsx', 'utf8');

const startIdx = content.indexOf('<div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">');
const endIdx = content.indexOf('</div>\n        </div>\n      </div>\n    </section>');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + content.slice(endIdx);
  fs.writeFileSync('src/components/InteractiveElevationViewer.tsx', content);
  console.log('Patched InteractiveElevationViewer');
} else {
  console.log('Could not find indices in InteractiveElevationViewer');
}
