const fs = require('fs');
let content = fs.readFileSync('src/components/ResidenceShowcase.tsx', 'utf8');

content = content.replace(
  "          </div>\n        \n        {/* 8 Units Ribbon Selector */}",
  "          </div>\n        </div>\n        \n        {/* 8 Units Ribbon Selector */}"
);

fs.writeFileSync('src/components/ResidenceShowcase.tsx', content);
