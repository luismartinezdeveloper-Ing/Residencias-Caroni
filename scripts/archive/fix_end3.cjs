const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveElevationViewer.tsx', 'utf8');
content = content.replace(
`            <div className="font-serif text-xs text-[#8C8678]">
              {selectedUnit.distinctiveAttribute}
            </div>
          </div>
        </div>
    </section>`,
`            <div className="font-serif text-xs text-[#8C8678]">
              {selectedUnit.distinctiveAttribute}
            </div>
          </div>
    </section>`
);
fs.writeFileSync('src/components/InteractiveElevationViewer.tsx', content);
