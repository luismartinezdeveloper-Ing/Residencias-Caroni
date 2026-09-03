const fs = require('fs');
let content = fs.readFileSync('src/components/HeroCinematic.tsx', 'utf8');

const oldPillars = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-white rounded-2xl border border-[#1B1813]/5 p-5 shadow-sm hover:shadow-xl transition-all cursor-default">
            <span className="font-meta text-[9px] text-[#8C7452] block tracking-wider mb-1">01 · ESTRUCTURA JURÍDICA</span>
            <h3 className="font-display text-xl text-[#1B1813] mb-2">Propiedad Horizontal</h3>
            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
              Cada residencia cuenta con su documento de propiedad independiente debidamente registrado, sin intermediarios o estructuras complejas.
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-white rounded-2xl border border-[#1B1813]/5 p-5 shadow-sm hover:shadow-xl transition-all cursor-default">
            <span className="font-meta text-[9px] text-[#8C7452] block tracking-wider mb-1">02 · AUTONOMÍA CRÍTICA</span>
            <h3 className="font-display text-xl text-[#1B1813] mb-2">100% Respaldo</h3>
            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
              Planta eléctrica de cobertura total (servicios + climatización residencial) y pozo profundo con planta de tratamiento continuo.
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-white rounded-2xl border border-[#1B1813]/5 p-5 shadow-sm hover:shadow-xl transition-all cursor-default">
            <span className="font-meta text-[9px] text-[#8C8678] block tracking-wider mb-1">03 · MODELO DE PAGO</span>
            <h3 className="font-display text-xl text-[#1B1813] mb-2">7 Etapas de Construcción</h3>
            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
              Cobranza regulada en custodia por cuenta escrow, liquidable únicamente tras certificación técnica de obra emitida por Añil.
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-white rounded-2xl border border-[#1B1813]/5 p-5 shadow-sm hover:shadow-xl transition-all cursor-default">
            <span className="font-meta text-[9px] text-[#8C7452] block tracking-wider mb-1">04 · CARTERA ASIGNADA</span>
            <h3 className="font-display text-xl text-[#1B1813] mb-2">{unitsReservedOrCommitted} / {UNITS_DATA.length} Comprometidas</h3>
            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
              {UNITS_DATA.filter(u => u.status === 'comprometida').length} residencias firmadas bajo contrato, {UNITS_DATA.filter(u => u.status === 'en_reserva').length} en reserva formalizada y solo {UNITS_DATA.filter(u => u.status === 'disponible').length} disponibles.
            </p>
          </motion.div>
        </div>`;

const newPillars = `<div className="grid grid-cols-1 lg:grid-cols-4 border-y border-[#C9C4B5]/60 mt-12">
          <div className="p-5 lg:p-6 lg:border-r border-b lg:border-b-0 border-[#C9C4B5]/60 group cursor-default">
            <span className="font-meta text-[9px] text-[#8C7452] block tracking-wider mb-2 opacity-80 group-hover:opacity-100 transition-opacity">01 · ESTRUCTURA JURÍDICA</span>
            <h3 className="font-display text-xl text-[#1B1813] mb-2">Propiedad Horizontal</h3>
            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
              Cada residencia cuenta con su documento de propiedad independiente debidamente registrado, sin intermediarios o estructuras complejas.
            </p>
          </div>

          <div className="p-5 lg:p-6 lg:border-r border-b lg:border-b-0 border-[#C9C4B5]/60 group cursor-default">
            <span className="font-meta text-[9px] text-[#8C7452] block tracking-wider mb-2 opacity-80 group-hover:opacity-100 transition-opacity">02 · AUTONOMÍA CRÍTICA</span>
            <h3 className="font-display text-xl text-[#1B1813] mb-2">100% Respaldo</h3>
            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
              Planta eléctrica de cobertura total (servicios + climatización residencial) y pozo profundo con planta de tratamiento continuo.
            </p>
          </div>

          <div className="p-5 lg:p-6 lg:border-r border-b lg:border-b-0 border-[#C9C4B5]/60 group cursor-default">
            <span className="font-meta text-[9px] text-[#8C7452] block tracking-wider mb-2 opacity-80 group-hover:opacity-100 transition-opacity">03 · MODELO DE PAGO</span>
            <h3 className="font-display text-xl text-[#1B1813] mb-2">7 Etapas de Construcción</h3>
            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
              Cobranza regulada en custodia por cuenta escrow, liquidable únicamente tras certificación técnica de obra emitida por Añil.
            </p>
          </div>

          <div className="p-5 lg:p-6 group cursor-default">
            <span className="font-meta text-[9px] text-[#8C7452] block tracking-wider mb-2 opacity-80 group-hover:opacity-100 transition-opacity">04 · CARTERA ASIGNADA</span>
            <h3 className="font-display text-xl text-[#1B1813] mb-2">{unitsReservedOrCommitted} / {UNITS_DATA.length} Comprometidas</h3>
            <p className="font-serif text-xs text-[#8C8678] leading-relaxed">
              {UNITS_DATA.filter(u => u.status === 'comprometida').length} residencias firmadas, {UNITS_DATA.filter(u => u.status === 'en_reserva').length} en reserva y solo {UNITS_DATA.filter(u => u.status === 'disponible').length} disponibles.
            </p>
          </div>
        </div>`;

if (content.includes(oldPillars)) {
  content = content.replace(oldPillars, newPillars);
  fs.writeFileSync('src/components/HeroCinematic.tsx', content);
  console.log('4 Pillars patched');
} else {
  console.log('4 Pillars not found');
}
