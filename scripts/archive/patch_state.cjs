const fs = require('fs');
const file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { CaroniIsotype, ArchitecturalElevation } from '../ui/ArchitecturalDrawings';",
  "import { CaroniIsotype, ArchitecturalElevation, FloorPlanSchema } from '../ui/ArchitecturalDrawings';"
);

content = content.replace(
  "const [isFullscreen, setIsFullscreen] = useState<boolean>(false);",
  "const [isFullscreen, setIsFullscreen] = useState<boolean>(false);\n  const [spatialMode, setSpatialMode] = useState<'3d' | '2d'>('3d');"
);

fs.writeFileSync(file, content);
