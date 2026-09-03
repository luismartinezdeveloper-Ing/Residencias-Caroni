const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// The array of sections
content = content.replace(/'obra', 'elevacion', 'residencias', 'inversion', 'ledger'/, "'obra', 'elevacion', 'inversion', 'ledger'");

// onExploreUnits
content = content.replace(/onExploreUnits=\{\(\) => handleNavigate\('residencias'\)\}/, "onExploreUnits={() => handleNavigate('elevacion')}");

// onInspectUnitDetails
content = content.replace(/onInspectUnitDetails=\{\(\) => handleNavigate\('residencias'\)\}/, "onInspectUnitDetails={() => setIs3DModalOpen(true)}");

fs.writeFileSync(file, content);
console.log("Patched App.tsx navigations.");
