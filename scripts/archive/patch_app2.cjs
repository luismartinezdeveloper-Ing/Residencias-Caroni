const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// add import
content = content.replace("import { HeroCinematic } from './components/sections/HeroCinematic';", "import { HeroCinematic } from './components/sections/HeroCinematic';\nimport { HorizontalGallery } from './components/sections/HorizontalGallery';");

// Insert component after InteractiveElevationViewer
const targetStr = `        </motion.div>{isAdvisorMode && (<>{/* 03. ESTRUCTURA FINANCIERA & LOI (Investment Grade Simulator & Binding LOI) */}`;
const insertion = `        </motion.div>

        {/* 03. GALERIA (Apple-Style Horizontal Scroll) */}
        <HorizontalGallery />
        
        {isAdvisorMode && (<>{/* 04. ESTRUCTURA FINANCIERA & LOI (Investment Grade Simulator & Binding LOI) */}`;
content = content.replace(targetStr, insertion);

// Update handleScrollObserver sections array
content = content.replace("const sections: NavSection[] = ['obra', 'elevacion', 'inversion', 'ledger'];", "const sections: NavSection[] = ['obra', 'elevacion', 'galeria', 'inversion', 'ledger'];");

// Update footer buttons
content = content.replace(
  /<button onClick=\{\(\) => handleNavigate\('elevacion'\)\} className="hover:text-\[\#8C7452\] transition-colors">02\. FACHADAS<\/button>/,
  `<button onClick={() => handleNavigate('elevacion')} className="hover:text-[#8C7452] transition-colors">02. FACHADAS</button>
              <button onClick={() => handleNavigate('galeria')} className="hover:text-[#8C7452] transition-colors">03. GALERÍA</button>`
);
content = content.replace(/>03\. INVERSIÓN<\/button>/, '>04. INVERSIÓN</button>');
content = content.replace(/>04\. ESTADO DEL PROYECTO<\/button>/, '>05. ESTADO DEL PROYECTO</button>');

// Also fix `05. ESTADO DEL PROYECTO & AVANCE` title in comment
content = content.replace("{/* 05. ESTADO DEL PROYECTO & AVANCE", "{/* 06. ESTADO DEL PROYECTO & AVANCE");

fs.writeFileSync(file, content);
console.log("Patched App.tsx");
