const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix context/data/types
  content = content.replace(/from '\.\.\/context\//g, "from '../../context/");
  content = content.replace(/from '\.\.\/data\//g, "from '../../data/");
  content = content.replace(/from '\.\.\/types\//g, "from '../../types/");
  
  // Component to new path
  const componentMap = {
    'ExperienceHeader': 'layout/ExperienceHeader',
    'HeroCinematic': 'sections/HeroCinematic',
    'InteractiveElevationViewer': 'sections/InteractiveElevationViewer',
    'ResidenceShowcase': 'sections/ResidenceShowcase',
    'InvestmentTermSheet': 'sections/InvestmentTermSheet',
    'InstitutionalLedger': 'sections/InstitutionalLedger',
    'Architectural3DModal': 'modals/Architectural3DModal',
    'ConfidentialityModal': 'modals/ConfidentialityModal',
    'ArchitecturalDrawings': 'ui/ArchitecturalDrawings',
    'AnimatedCounter': 'ui/AnimatedCounter'
  };

  for (const [comp, newPath] of Object.entries(componentMap)) {
    // Current file is inside a subfolder, so it references sibling with ./
    // And to reach another component it needs ../newPath
    const searchString = "from './" + comp + "'";
    const replaceString = "from '../" + newPath + "'";
    // Global replace
    content = content.split(searchString).join(replaceString);
  }

  fs.writeFileSync(file, content);
});

console.log('All internal component imports fixed');
