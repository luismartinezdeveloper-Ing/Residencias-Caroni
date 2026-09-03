const fs = require('fs');
let content = fs.readFileSync('src/components/ResidenceShowcase.tsx', 'utf8');

// The original closing of space-y-24 was right above Action Strip.
// And Action Strip was inside max-w-7xl.
// So, I need to put </motion.div></AnimatePresence> right above {/* Action Strip...
// And change the bottom back to what it was.

let startIdx = content.indexOf('{/* Action Strip: Connect Directly to Investment Structure & LOI */}');

if (startIdx !== -1) {
  // Let's first restore the bottom
  content = content.replace(
`        </div>)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>`,
`        </div>)}
      </div>
    </section>`
  );

  // Now let's inject </motion.div></AnimatePresence> before Action Strip, replacing the </div> that closes space-y-24.
  // Wait, if space-y-24 was closed by </div>, let's just replace that </div>.
  // We can just find:
  //           </div>
  //         </div>
  //         {/* Action Strip:
  // And change it to:
  //           </motion.div>
  //         </AnimatePresence>
  //         {/* Action Strip:

  content = content.replace(
`          </div>
        {/* Action Strip`,
`          </motion.div>
        </AnimatePresence>
        {/* Action Strip`
  );
  
  // Actually, there are multiple divs. Let's just do it cleanly.
  fs.writeFileSync('src/components/ResidenceShowcase.tsx', content);
  console.log("Restored bottom.");
}
