const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "onNavigateSection={handleNavigate}\n      />\n      {/* Canonical",
  "onNavigateSection={handleNavigate}\n      />)}\n      {/* Canonical"
);

fs.writeFileSync('src/App.tsx', content);
