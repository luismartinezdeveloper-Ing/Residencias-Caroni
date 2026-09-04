const fs = require('fs');
let content = fs.readFileSync('src/components/ResidenceShowcase.tsx', 'utf8');

const tabSwitcherStart = content.indexOf("{/* View Tab Switcher */}");
const tabSwitcherEnd = content.indexOf("</div>", content.indexOf("</div>", content.indexOf("</button>", tabSwitcherStart)) + 1) + 6;

content = content.slice(0, tabSwitcherStart) + content.slice(tabSwitcherEnd);

fs.writeFileSync('src/components/ResidenceShowcase.tsx', content);
