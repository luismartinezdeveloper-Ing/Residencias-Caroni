const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveElevationViewer.tsx', 'utf8');

content = content.replace(
  '02 · ALZADO ARQUITECTÓNICO & CORTE VERTICAL',
  '02 · INVENTARIO Y ARQUITECTURA'
);
content = content.replace(
  '<span className="text-[#8C7452]">.</span>Geometría, cotas y estratificación.',
  '<span className="text-[#8C7452]">.</span>Explorador Maestro del Edificio.'
);
content = content.replace(
  'Estudio volumétrico de las siete cotas de altura frente a la silueta del Parque Nacional Waraira Repano.',
  'Seleccione un estrato o fachada en el plano interactivo para revelar el dossier técnico, la memoria descriptiva y los planos de la residencia correspondiente en tiempo real.'
);

// Remove the bottom border from the section
content = content.replace(
  'className="w-full bg-white border-b border-[#1B1813] py-12 sm:py-16"',
  'className="w-full bg-white pt-12 sm:pt-16 pb-6"'
);

fs.writeFileSync('src/components/InteractiveElevationViewer.tsx', content);
