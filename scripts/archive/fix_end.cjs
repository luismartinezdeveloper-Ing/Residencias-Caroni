const fs = require('fs');
let lines = fs.readFileSync('src/components/InteractiveElevationViewer.tsx', 'utf8').split('\n');
// the last lines currently look like:
//           </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// We want to make sure it matches properly.
let content = fs.readFileSync('src/components/InteractiveElevationViewer.tsx', 'utf8');
content = content.replace(
`            <div className="font-serif text-xs text-[#8C8678]">
              {selectedUnit.distinctiveAttribute}
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>`,
`            <div className="font-serif text-xs text-[#8C8678]">
              {selectedUnit.distinctiveAttribute}
            </div>
          </div>
        </div>
      </div>
    </section>`
);
fs.writeFileSync('src/components/InteractiveElevationViewer.tsx', content);
