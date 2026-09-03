const fs = require('fs');

// Patch InvestmentTermSheet
let invContent = fs.readFileSync('src/components/InvestmentTermSheet.tsx', 'utf8');
invContent = invContent.replace('04 · ESTRUCTURA PATRIMONIAL & PROTOCOLO DE ADJUDICACIÓN', '03 · ESTRUCTURA PATRIMONIAL & PROTOCOLO DE ADJUDICACIÓN');
fs.writeFileSync('src/components/InvestmentTermSheet.tsx', invContent);

// Patch InstitutionalLedger
let ledgContent = fs.readFileSync('src/components/InstitutionalLedger.tsx', 'utf8');
ledgContent = ledgContent.replace('05 · LIBRO MAYOR INSTITUCIONAL & AVANCE FÍSICO-FINANCIERO', '04 · LIBRO MAYOR INSTITUCIONAL & AVANCE FÍSICO-FINANCIERO');
fs.writeFileSync('src/components/InstitutionalLedger.tsx', ledgContent);
