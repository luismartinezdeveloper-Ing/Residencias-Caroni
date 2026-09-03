const fs = require('fs');
let content = fs.readFileSync('src/components/ResidenceShowcase.tsx', 'utf8');

// replace const { isAccredited, openAuthModal } = useConfidentiality();
// with const { isAccredited, openAuthModal, isAdvisorMode } = useConfidentiality();
content = content.replace(
  "const { isAccredited, openAuthModal } = useConfidentiality();",
  "const { isAccredited, openAuthModal, isAdvisorMode } = useConfidentiality();"
);

// wrap the action strip in isAdvisorMode check
const actionStripStart = content.indexOf("{/* Action Strip: Connect Directly to Investment Structure & LOI */}");
const beforeActionStrip = content.slice(0, actionStripStart);
let afterActionStrip = content.slice(actionStripStart);

afterActionStrip = afterActionStrip.replace(
  "{/* Action Strip: Connect Directly to Investment Structure & LOI */}\n        <div",
  "{/* Action Strip: Connect Directly to Investment Structure & LOI */}\n        {isAdvisorMode && (<div"
);

// close the wrap before the end of the section
const closingDiv = afterActionStrip.lastIndexOf("</div>\n    </section>");
afterActionStrip = afterActionStrip.slice(0, closingDiv) + "</div>)} \n" + afterActionStrip.slice(closingDiv);

fs.writeFileSync('src/components/ResidenceShowcase.tsx', beforeActionStrip + afterActionStrip);
