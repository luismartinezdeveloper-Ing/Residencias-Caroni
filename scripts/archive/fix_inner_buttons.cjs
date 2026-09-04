const fs = require('fs');
const file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard transition-colors inner buttons to include rounded-full
content = content.replace(
  /whitespace-nowrap transition-colors/g,
  'rounded-full whitespace-nowrap transition-colors'
);

fs.writeFileSync(file, content);
console.log("Fixed inner buttons.");
