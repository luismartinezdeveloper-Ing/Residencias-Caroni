const fs = require('fs');
const file = 'src/components/modals/Architectural3DModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Floor Type Toggle \(Dynamic for all typologies\) \*\/\}[\s\S]*?\} m²/;

const restored = `{/* Floor Type Toggle (Dynamic for all typologies) */}
                      <div className="flex justify-center mb-6 z-30 pointer-events-auto relative mt-4">
                        <div className="flex border border-[#1B1813] bg-white p-0.5 shadow-sm">
                          <button 
                            onClick={() => setPlanType('Social')}
                            className={\`font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 whitespace-nowrap transition-colors cursor-pointer \${
                              planType === 'Social' 
                                ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold' 
                                : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                            }\`}
                          >
                            {selectedUnit.typology === 'Jardín' ? 'PLANTA INFERIOR (SOCIAL)' : selectedUnit.typology === 'Mirador' ? 'PLANTA PRINCIPAL' : 'ÁREA SOCIAL'}
                          </button>
                          <button 
                            onClick={() => setPlanType('Privada')}
                            className={\`font-meta text-[8px] sm:text-[9.5px] px-3 sm:px-4 py-1.5 whitespace-nowrap transition-colors cursor-pointer \${
                              planType === 'Privada' 
                                ? 'bg-[#1B1813] text-[#EFEBE0] font-semibold' 
                                : 'text-[#1B1813] hover:text-[#8C7452] hover:bg-[#FAF9F6]'
                            }\`}
                          >
                            {selectedUnit.typology === 'Jardín' ? 'PLANTA SUPERIOR (PRIVADA)' : selectedUnit.typology === 'Mirador' ? 'NIVEL DE HABITACIONES' : 'ÁREA PRIVADA'}
                          </button>
                        </div>
                      </div>

                      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center my-auto">
                        <FloorPlanSchema 
                          typology={selectedUnit.typology as any} 
                          orientation={selectedUnit.orientation as any}
                          planType={planType} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3D ENGINE (Preserved WebGL Context) */}
                <div className={\`absolute inset-0 transition-opacity duration-500 \${viewMode !== 'floorplan' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}\`}>
                {hasWebGLError ? (
                  /* WebGL Fallback Viewport (High-Precision Vector Axonometric / Elevation) */
                  <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between overflow-y-auto bg-[#EFEBE0]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C9C4B5] pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-[#8C7452]" />
                        <span className="font-meta text-[9px] text-[#1B1813] font-semibold">
                          ESTUDIO ESTRATIGRÁFICO VECTORIAL (MODO RESILIENTE)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setHasWebGLError(false);
                          setRetryKey((k) => k + 1);
                        }}
                        className="font-meta text-[8.5px] px-2.5 py-1 bg-[#1B1813] text-[#EFEBE0] hover:bg-[#8C7452] transition-colors cursor-pointer"
                      >
                        REINTENTAR RENDER 3D ↺
                      </button>
                    </div>
                    
                    <div className="my-auto py-2 flex items-center justify-center">
                      <ArchitecturalElevation
                        className="max-h-[300px] sm:max-h-[380px] w-full"
                        highlightLevel={activeFloorFilter === 'ALL' ? undefined : activeFloorFilter}
                        selectedUnitId={selectedUnit.id}
                        onSelectUnitId={(uId) => {
                          const found = UNITS_DATA.find((u) => u.id === uId);
                          if (found) onSelectUnit(found);
                        }}
                      />
                    </div>

                    <div className="font-meta text-[8px] text-[#8C8678] text-center border-t border-[#C9C4B5] pt-2">
                      Aceleración WebGL bloqueada por contexto del navegador. Visualización vectorial y estrato activos.
                    </div>
                  </div>
                ) : (
                  <div
                    ref={mountRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
                  />
                )}

                {/* Top Overlay: Stratum Filter Bar (Centered, Clean, No-overlap) */}
                <div className={\`absolute top-2 left-2 right-2 sm:left-4 sm:right-auto flex flex-wrap items-center justify-between sm:justify-start gap-2 pointer-events-none z-30 transition-opacity duration-300 \${viewMode === 'floorplan' ? 'opacity-0' : 'opacity-100'}\`}>
                  <div className="bg-white/95 backdrop-blur-xs border border-[#C9C4B5] p-1 sm:p-1.5 flex flex-col gap-1 shadow-xs pointer-events-auto max-w-full overflow-hidden">
                    <div className="flex items-center justify-between px-1">
                      <span className="font-meta text-[8px] sm:text-[9px] text-[#8C8678] tracking-wider uppercase">
                        Estratos en corte
                      </span>
                      <span className="font-meta text-[8px] sm:text-[9px] text-[#8C7452] font-semibold">
                        {activeFloorFilter}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scrollbar-thin">
                      {[
                        { id: 'ALL', label: 'TODOS' },
                        { id: 'PB', label: 'PB DÚPLEX' },
                        { id: 'P2', label: 'P2' },
                        { id: 'P3', label: 'P3' },
                        { id: 'MIRADOR', label: 'MIRADORES' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setActiveFloorFilter(f.id as any)}
                          className={\`font-meta text-[8px] sm:text-[9px] px-2 py-1 border whitespace-nowrap transition-colors cursor-pointer \${
                            activeFloorFilter === f.id
                              ? 'bg-[#8C7452] text-[#EFEBE0] border-[#8C7452] font-bold shadow-2xs'
                              : 'bg-white text-[#1B1813] border-[#C9C4B5] hover:border-[#8C7452]'
                          }\`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Consolidated Dock: Camera Views + Rotate 360 + Zoom Controls */}
                <div className={\`absolute bottom-2 left-2 right-2 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-1.5 sm:gap-2 pointer-events-none z-30 transition-opacity duration-300 \${viewMode === 'floorplan' ? 'opacity-0' : 'opacity-100'}\`}>
                  
                  {/* Left Group: Camera Presets & Orbit Toggle */}
                  <div className="bg-white/95 backdrop-blur-xs border border-[#C9C4B5] p-1 sm:p-1.5 flex flex-col gap-1 shadow-xs pointer-events-auto max-w-full">
                    <span className="font-meta text-[7px] sm:text-[7.5px] text-[#8C8678] tracking-wider px-1 uppercase">
                      Perspectiva & Órbita
                    </span>
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                      {[
                        { id: 'iso', label: 'ISOMÉTRICA' },
                        { id: 'north', label: 'NORTE (ÁVILA)' },
                        { id: 'south', label: 'SUR' },
                        { id: 'top', label: 'PLANTA' },
                      ].map((cam) => (
                        <button
                          key={cam.id}
                          onClick={() => setCameraPreset(cam.id as any)}
                          className={\`font-meta text-[7.5px] sm:text-[8.5px] px-1.5 sm:px-2 py-0.5 sm:py-1 border whitespace-nowrap transition-colors cursor-pointer \${
                            cameraView === cam.id
                              ? 'bg-[#1B1813] text-[#EFEBE0] border-[#1B1813] font-bold'
                              : 'bg-white text-[#1B1813] border-[#C9C4B5] hover:border-[#8C7452]'
                          }\`}
                        >
                          {cam.label}
                        </button>
                      ))}

                      {/* 360 Rotate Button */}
                      <button
                        onClick={() => setIsRotating(!isRotating)}
                        className={\`font-meta text-[7.5px] sm:text-[8.5px] px-1.5 sm:px-2 py-0.5 sm:py-1 border whitespace-nowrap transition-colors flex items-center space-x-1 cursor-pointer \${
                          isRotating
                            ? 'bg-[#8C7452] text-[#EFEBE0] border-[#8C7452] font-bold animate-pulse'
                            : 'bg-white text-[#1B1813] border-[#C9C4B5] hover:border-[#8C7452]'
                        }\`}
                      >
                        <span>{isRotating ? '■' : '▶'}</span>
                        <span>{isRotating ? 'PAUSA' : '360°'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Group: Zoom In / Zoom Out / Reset View */}
                  <div className="bg-white/95 backdrop-blur-xs border border-[#C9C4B5] p-1 flex items-center justify-end gap-1 shadow-xs pointer-events-auto shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleZoomChange(10)}
                      title="Alejar modelo"
                      className="font-mono text-sm w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center border border-[#C9C4B5] bg-white hover:bg-[#1B1813] hover:text-[#EFEBE0] text-[#1B1813] transition-colors cursor-pointer"
                    >
                      −
                    </button>
                    <button
                      onClick={handleResetView}
                      title="Encuadre inicial estándar"
                      className="font-meta text-[7.5px] sm:text-[8px] px-1.5 h-6 sm:h-7 flex items-center justify-center border border-[#C9C4B5] bg-white hover:border-[#8C7452] text-[#8C8678] hover:text-[#1B1813] transition-colors cursor-pointer"
                    >
                      REAJUSTAR
                    </button>
                    <button
                      onClick={() => handleZoomChange(-10)}
                      title="Acercar modelo"
                      className="font-mono text-sm w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center border border-[#C9C4B5] bg-white hover:bg-[#1B1813] hover:text-[#EFEBE0] text-[#1B1813] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                </div>

              </div>

              {/* Technical Data Sidebar (Architectural Specs) */}
              <div className="lg:col-span-5 xl:col-span-4 bg-white border-t lg:border-t-0 lg:border-l border-[#1B1813] flex flex-col h-[400px] lg:h-full relative overflow-y-auto">
                <div className="p-4 sm:p-5 md:p-6 space-y-6 lg:space-y-8 flex-1">
                  
                  {/* Property Quick Nav / Pagination */}
                  <div className="flex items-center justify-between border-b border-[#1B1813] pb-2">
                    <div className="font-meta text-[9px] sm:text-[10px] text-[#8C8678] uppercase tracking-wider">
                      Inventario
                    </div>
                    <div className="flex space-x-1">
                      {UNITS_DATA.map((u, i) => {
                        const isSelected = u.id === selectedUnit.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUnit(u);
                            }}
                            className={\`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-meta text-[8.5px] sm:text-[9.5px] transition-colors cursor-pointer \${
                              isSelected ? 'bg-[#1B1813] text-[#EFEBE0]' : 'bg-[#FAF9F6] text-[#8C8678] hover:bg-[#EFEBE0] hover:text-[#1B1813]'
                            }\`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Focused Unit Detailed Specs Card */}
                  <div className="border border-[#C9C4B5] bg-[#FAF9F6] p-3 space-y-1.5 font-serif text-[11.5px]">
                    <div className="flex justify-between border-b border-[#C9C4B5] pb-1">
                      <span className="text-[#8C8678]">Superficie Total:</span>
                      <span className="text-[#1B1813] font-semibold">
                        {selectedUnit.totalArea.toLocaleString('es-VE', { minimumFractionDigits: 2 })} m²`;

content = content.replace(regex, restored);
fs.writeFileSync(file, content);
console.log('Fixed the mess');
