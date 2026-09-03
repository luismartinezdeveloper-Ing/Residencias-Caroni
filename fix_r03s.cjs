const fs = require('fs');
let file = 'src/data/brandData.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "id: 'residencia-03-sur',\n    code: 'R03S',\n    name: 'Residencia 03 Sur',\n    typology: 'Residencia',\n    orientation: 'Sur',\n    level: 'P3',\n    character: 'Planta tipo elevada con horizonte urbano despejado',\n    interiorArea: 323.79,\n    terraceArea: 92.01,\n    totalArea: 415.80,\n    rooms: 4,",
  "id: 'residencia-03-sur',\n    code: 'R03S',\n    name: 'Residencia 03 Sur',\n    typology: 'Residencia',\n    orientation: 'Sur',\n    level: 'P3',\n    character: 'Planta tipo elevada con horizonte urbano despejado',\n    interiorArea: 323.79,\n    terraceArea: 92.01,\n    totalArea: 415.80,\n    rooms: 3,"
);

fs.writeFileSync(file, content);
console.log("R03S fixed.");
