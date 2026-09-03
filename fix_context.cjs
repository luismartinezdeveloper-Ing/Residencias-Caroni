const fs = require('fs');
let content = fs.readFileSync('src/context/ConfidentialityContext.tsx', 'utf8');

content = content.replace(
  "const [isAuthModalOpen,\n        isAdvisorMode,\n        toggleAdvisorMode, setIsAuthModalOpen] = useState<boolean>(false);",
  "const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);"
);

content = content.replace(
  "closeAuthModal,\n        targetAfterAuth,",
  "isAdvisorMode,\n        toggleAdvisorMode,\n        closeAuthModal,\n        targetAfterAuth,"
);

fs.writeFileSync('src/context/ConfidentialityContext.tsx', content);
