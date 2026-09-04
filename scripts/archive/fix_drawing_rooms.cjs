const fs = require('fs');
let file = 'src/components/ui/ArchitecturalDrawings.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `{/* Secondary Suites */}
            <rect x="250" y="30" width="220" height="73" stroke="#1B1813" strokeWidth="1" fill="none" />
            <text x="360" y="70" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Suite 02</text>
            <text x="360" y="85" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">BAÑO PRIVADO</text>
            
            <rect x="250" y="103" width="220" height="73" stroke="#1B1813" strokeWidth="1" fill="none" />
            <text x="360" y="143" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Suite 03</text>
            <text x="360" y="158" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">BAÑO PRIVADO</text>

            <rect x="250" y="176" width="220" height="74" stroke="#1B1813" strokeWidth="1" fill="none" />
            <text x="360" y="215" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Suite 04 / Estudio</text>
            <text x="360" y="230" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">BAÑO PRIVADO</text>`;

const replacement = `{/* Secondary Suites */}
            {typology === 'Jardín' ? (
              <>
                <rect x="250" y="30" width="220" height="73" stroke="#1B1813" strokeWidth="1" fill="none" />
                <text x="360" y="70" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Suite 02</text>
                <text x="360" y="85" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">BAÑO PRIVADO</text>
                
                <rect x="250" y="103" width="220" height="73" stroke="#1B1813" strokeWidth="1" fill="none" />
                <text x="360" y="143" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Suite 03</text>
                <text x="360" y="158" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">BAÑO PRIVADO</text>

                <rect x="250" y="176" width="220" height="74" stroke="#1B1813" strokeWidth="1" fill="none" />
                <text x="360" y="215" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Suite 04 / Estudio</text>
                <text x="360" y="230" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">BAÑO PRIVADO</text>
              </>
            ) : (
              <>
                <rect x="250" y="30" width="220" height="110" stroke="#1B1813" strokeWidth="1" fill="none" />
                <text x="360" y="85" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Suite 02</text>
                <text x="360" y="100" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">BAÑO PRIVADO</text>
                
                <rect x="250" y="140" width="220" height="110" stroke="#1B1813" strokeWidth="1" fill="none" />
                <text x="360" y="195" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">Suite 03 / Estudio</text>
                <text x="360" y="210" fill="#8C8678" fontSize="7" fontFamily="Calibri, Inter" textAnchor="middle">BAÑO PRIVADO</text>
              </>
            )}`;

if(content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Drawings updated successfully.");
} else {
  console.log("Could not find target block.");
}
