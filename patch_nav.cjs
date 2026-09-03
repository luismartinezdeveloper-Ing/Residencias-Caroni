const fs = require('fs');
let content = fs.readFileSync('src/components/ExperienceHeader.tsx', 'utf8');

const oldNavAdvisor = `  const navItems = isAdvisorMode ? [
    { id: 'obra', code: '01', label: 'LA PIEZA' },
    { id: 'elevacion', code: '02', label: 'CORTE & COTAS' },
    { id: 'residencias', code: '03', label: '8 RESIDENCIAS' },
    { id: 'inversion', code: '04', label: 'ESTRUCTURA & LOI' },
    { id: 'ledger', code: '05', label: 'LIBRO MAYOR' },
  ] : [
    { id: 'obra', code: '01', label: 'LA PIEZA' },
    { id: 'elevacion', code: '02', label: 'CORTE & COTAS' },
    { id: 'residencias', code: '03', label: '8 RESIDENCIAS' },
  ];`;

const newNavAdvisor = `  const navItems = isAdvisorMode ? [
    { id: 'obra', code: '01', label: 'LA PIEZA' },
    { id: 'elevacion', code: '02', label: 'INVENTARIO' },
    { id: 'inversion', code: '03', label: 'ESTRUCTURA & LOI' },
    { id: 'ledger', code: '04', label: 'LIBRO MAYOR' },
  ] : [
    { id: 'obra', code: '01', label: 'LA PIEZA' },
    { id: 'elevacion', code: '02', label: 'INVENTARIO' },
  ];`;

if (content.includes(oldNavAdvisor)) {
  content = content.replace(oldNavAdvisor, newNavAdvisor);
  fs.writeFileSync('src/components/ExperienceHeader.tsx', content);
  console.log('Nav patched');
} else {
  console.log('Nav not found');
}
