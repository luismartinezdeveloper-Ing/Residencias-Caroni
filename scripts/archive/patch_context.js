const fs = require('fs');
const content = fs.readFileSync('src/context/ConfidentialityContext.tsx', 'utf8');

let newContent = content.replace(
  'isAuthModalOpen: boolean;',
  'isAuthModalOpen: boolean;\n  isAdvisorMode: boolean;\n  toggleAdvisorMode: () => void;'
);

newContent = newContent.replace(
  'const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);',
  'const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);\n  const [isAdvisorMode, setIsAdvisorMode] = useState<boolean>(false);'
);

newContent = newContent.replace(
  'const closeAuthModal = () => {',
  'const toggleAdvisorMode = () => setIsAdvisorMode(prev => !prev);\n\n  const closeAuthModal = () => {'
);

newContent = newContent.replace(
  'isAuthModalOpen,',
  'isAuthModalOpen,\n        isAdvisorMode,\n        toggleAdvisorMode,'
);

fs.writeFileSync('src/context/ConfidentialityContext.tsx', newContent);
