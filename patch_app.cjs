const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove import
content = content.replace("import { ResidenceShowcase } from './components/sections/ResidenceShowcase';\n", "");

// Remove the section
const showcaseRegex = /        \{\/\* 03\. LAS 8 RESIDENCIAS[^\}]*?\}\s*<motion\.div[\s\S]*?<ResidenceShowcase[\s\S]*?<\/motion\.div>\s*/;
content = content.replace(showcaseRegex, "");

// In footer, remove 03. RESIDENCIAS button
content = content.replace(/<button onClick=\{\(\) => handleNavigate\('residencias'\)\} className="hover:text-\[\#8C7452\] transition-colors">03\. RESIDENCIAS<\/button>\s*/, "");

// Also in footer, update the Advisor mode indices
content = content.replace(/>04\. INVERSIÓN<\/button>/, '>03. INVERSIÓN</button>');
content = content.replace(/>05\. ESTADO DEL PROYECTO<\/button>/, '>04. ESTADO DEL PROYECTO</button>');

// Also update the commented numbers for sections if I can, but not strictly necessary.
content = content.replace('04. ESTRUCTURA FINANCIERA', '03. ESTRUCTURA FINANCIERA');
content = content.replace('05. THE LEDGER', '04. THE LEDGER');

fs.writeFileSync(file, content);
console.log("Patched App.tsx.");
