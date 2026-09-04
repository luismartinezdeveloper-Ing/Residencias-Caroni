const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("from './components/ExperienceHeader'", "from './components/layout/ExperienceHeader'");
content = content.replace("from './components/HeroCinematic'", "from './components/sections/HeroCinematic'");
content = content.replace("from './components/InteractiveElevationViewer'", "from './components/sections/InteractiveElevationViewer'");
content = content.replace("from './components/ResidenceShowcase'", "from './components/sections/ResidenceShowcase'");
content = content.replace("from './components/InvestmentTermSheet'", "from './components/sections/InvestmentTermSheet'");
content = content.replace("from './components/InstitutionalLedger'", "from './components/sections/InstitutionalLedger'");
content = content.replace("from './components/Architectural3DModal'", "from './components/modals/Architectural3DModal'");
content = content.replace("from './components/ConfidentialityModal'", "from './components/modals/ConfidentialityModal'");
content = content.replace("from './components/ArchitecturalDrawings'", "from './components/ui/ArchitecturalDrawings'");

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx fixed');
