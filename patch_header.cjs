const fs = require('fs');
const file = 'src/components/layout/ExperienceHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "export type NavSection = 'obra' | 'elevacion' | 'residencias' | 'inversion' | 'ledger';", 
  "export type NavSection = 'obra' | 'elevacion' | 'galeria' | 'inversion' | 'ledger';"
);

content = content.replace(/  const navItems = isAdvisorMode \? \[\s*\{ id: 'obra', code: '01', label: 'LA PIEZA' \},\s*\{ id: 'elevacion', code: '02', label: 'INVENTARIO' \},\s*\{ id: 'inversion', code: '03', label: 'ESTRUCTURA & LOI' \},\s*\{ id: 'ledger', code: '04', label: 'LIBRO MAYOR' \},\s*\] : \[\s*\{ id: 'obra', code: '01', label: 'LA PIEZA' \},\s*\{ id: 'elevacion', code: '02', label: 'INVENTARIO' \},\s*\];/, `  const navItems = isAdvisorMode ? [
    { id: 'obra', code: '01', label: 'LA PIEZA' },
    { id: 'elevacion', code: '02', label: 'INVENTARIO' },
    { id: 'galeria', code: '03', label: 'ATMÓSFERA' },
    { id: 'inversion', code: '04', label: 'ESTRUCTURA & LOI' },
    { id: 'ledger', code: '05', label: 'LIBRO MAYOR' },
  ] : [
    { id: 'obra', code: '01', label: 'LA PIEZA' },
    { id: 'elevacion', code: '02', label: 'INVENTARIO' },
    { id: 'galeria', code: '03', label: 'ATMÓSFERA' },
  ];`);

fs.writeFileSync(file, content);
console.log("Patched ExperienceHeader.tsx");
