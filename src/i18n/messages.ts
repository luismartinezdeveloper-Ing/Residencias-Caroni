export type SupportedLocale = 'es' | 'en';

export const MESSAGES: Record<SupportedLocale, Record<string, string>> = {
  es: {
    // Header & Navigation
    'header.tagline': 'ocho residencias · una sola pieza',
    'header.subtitle': 'AÑIL ARQUITECTURA · ALTAMIRA',
    'header.nav.obra': 'EL PROYECTO',
    'header.nav.galeria': 'GALERÍA',
    'header.nav.elevacion': 'PLANOS',
    'header.nav.contacto': 'CONTACTO',
    'header.nav.model3d': 'MAQUETA 3D',
    'header.nav.model3d.title': 'Abrir Maqueta 3D Interactiva',
    'header.lang.aria': 'Cambiar idioma de la plataforma',

    // Hero Video Narrative
    'hero.srOnlyTitle': 'Residencias Caroní · Altamira, Caracas · Añil Arquitectura',
    'hero.exploreGallery': 'EXPLORAR GALERÍA',
    'hero.exploreGallery.title': 'Desplazarse a la Galería de Perspectivas',
    'hero.sr.calibrating': '4K IA: CALIBRANDO',
    'hero.sr.on': '4K IA SR: ON',
    'hero.sr.off': '4K IA SR: OFF',
    'hero.sr.disableAria': 'Desactivar Super-Resolution 4K IA',
    'hero.sr.enableAria': 'Activar Super-Resolution 4K IA',
    'hero.audio.on': 'AUDIO: ON',
    'hero.audio.off': 'AUDIO: OFF',
    'hero.audio.muteTitle': 'Silenciar audio',
    'hero.audio.unmuteTitle': 'Activar audio del film',
    'hero.playTitle': 'Reproducir video',
    'hero.pauseTitle': 'Pausar video',

    // Gallery Section
    'gallery.kickerLeft': 'PERSPECTIVAS & MATERIALIDAD',
    'gallery.kickerRight': 'RENDERS DE AUTOR',
    'gallery.scrollHint': 'DESPLAZAMIENTO HORIZONTAL',
    'gallery.loupeHint': 'Pasa el cursor para ampliar',
    'gallery.zoomAlt': '{title} aumentado',
    'gallery.cat.exteriores.label': 'Exteriores',
    'gallery.cat.exteriores.badge': 'FACHADAS & ENTORNO',
    'gallery.cat.pb-norte.label': 'PB Norte · Ávila',
    'gallery.cat.pb-norte.badge': 'RESIDENCIAS PB NORTE',
    'gallery.cat.pb-sur.label': 'PB Sur · Valle',
    'gallery.cat.pb-sur.badge': 'RESIDENCIAS PB SUR',
    'gallery.cat.penthouse.label': 'Penthouse',
    'gallery.cat.penthouse.badge': 'MIRADORES SUPERIORES',

    // Gallery Slides
    'gallery.slide.ext-frontal.tag': 'FACHADA PRINCIPAL',
    'gallery.slide.ext-frontal.title': 'El Ávila como Testigo',
    'gallery.slide.ext-frontal.subtitle': 'Implantación al pie del Parque Nacional en Altamira. Ocho residencias concebidas como un solo volumen escultórico que dialoga con la tradición moderna caraqueña.',
    'gallery.slide.ext-frontal.dock': 'Frontal',

    'gallery.slide.ext-urbana.tag': 'IMPLANTACIÓN URBANA',
    'gallery.slide.ext-urbana.title': 'Presencia en la 8va Transversal',
    'gallery.slide.ext-urbana.subtitle': 'Relación armónica con el perfil urbano de Altamira. El edificio se retranquea generando un zócalo vegetal que aporta privacidad absoluta a las residencias de cota baja.',
    'gallery.slide.ext-urbana.dock': 'Urbana',

    'gallery.slide.ext-celosias.tag': 'HONESTIDAD CONSTRUCTIVA',
    'gallery.slide.ext-celosias.title': 'Materia y Verdad',
    'gallery.slide.ext-celosias.subtitle': 'Concreto visto en obra limpia, celosías de protección solar y perfilería arquitectónica. Materiales nobles que dialogan con el clima y envejecen con carácter.',
    'gallery.slide.ext-celosias.dock': 'Celosías',

    'gallery.slide.ext-lateral.tag': 'VOLUMETRÍA ESCULTÓRICA',
    'gallery.slide.ext-lateral.title': 'Alzado Lateral y Muros Pantalla',
    'gallery.slide.ext-lateral.subtitle': 'Muros ciegos en concreto visto intercalados con aberturas estratégicas. Una arquitectura que resguarda la privacidad entre vecinos y orienta las miradas hacia la naturaleza.',
    'gallery.slide.ext-lateral.dock': 'Lateral',

    'gallery.slide.ext-acceso.tag': 'ACCESO & UMBRAL',
    'gallery.slide.ext-acceso.title': 'Pórtico y Entrada Peatonal',
    'gallery.slide.ext-acceso.subtitle': 'El umbral de ingreso está concebido como una transición de serenidad: control de acceso biométrico discreto, pavimento en granito pulido y muro vegetal de bienvenida.',
    'gallery.slide.ext-acceso.dock': 'Acceso',

    'gallery.slide.ext-patio.tag': 'JARDINES & PAISAJISMO',
    'gallery.slide.ext-patio.title': 'Patio Ajardinado de Planta Baja',
    'gallery.slide.ext-patio.subtitle': 'Un microclima fresco al pie del Ávila que ofrece el confort de una casa unifamiliar aislada con la total seguridad de un conjunto privado de autor.',
    'gallery.slide.ext-patio.dock': 'Patio',

    'gallery.slide.pbn-salon.tag': 'ÁREA SOCIAL',
    'gallery.slide.pbn-salon.title': 'Espacios sin Fronteras',
    'gallery.slide.pbn-salon.subtitle': 'Alturas libres imponentes de 3.20 metros, salones diáfanos sin columnas intermedias y una transición fluida hacia los ventanales que baña el interior de luz natural tamizada.',
    'gallery.slide.pbn-salon.dock': 'Salón',

    'gallery.slide.pbn-terraza.tag': 'EXTERIOR DE AUTOR',
    'gallery.slide.pbn-terraza.title': 'El Jardín y la Terraza Norte',
    'gallery.slide.pbn-terraza.subtitle': 'Terrazas continuas y jardines privados protegidos del entorno urbano. Un oasis de calma diseñado para la contemplación directa de la cresta verde del Parque Nacional.',
    'gallery.slide.pbn-terraza.dock': 'Terraza',

    'gallery.slide.pbn-cocina.tag': 'ALTA COCINA DE AUTOR',
    'gallery.slide.pbn-cocina.title': 'Cocina Gourmet & Isla Social',
    'gallery.slide.pbn-cocina.subtitle': 'Isla central escultórica en cuarcita exótica con carpintería europea oculta sin tiradores. Equipada con electrodomésticos empotrados de grado profesional e iluminación cenital.',
    'gallery.slide.pbn-cocina.dock': 'Cocina',

    'gallery.slide.pbs-salon.tag': 'ÁREA SOCIAL',
    'gallery.slide.pbs-salon.title': 'Salón Principal Diáfano PB Sur',
    'gallery.slide.pbs-salon.subtitle': 'Composición sobria orientada al sur hacia la panorámica del valle de Caracas. Su orientación captura una calidez solar envolvente durante las mañanas y tardes caraqueñas.',
    'gallery.slide.pbs-salon.dock': 'Salón',

    'gallery.slide.pbs-terraza.tag': 'EXPANSIÓN PRIVADA',
    'gallery.slide.pbs-terraza.title': 'Terraza y Deck Perimetral PB Sur',
    'gallery.slide.pbs-terraza.subtitle': 'Refugio al aire libre con aleros de concreto que proporcionan sombra permanente y resguardo de la lluvia tropical sin restar luminosidad al interior.',
    'gallery.slide.pbs-terraza.dock': 'Terraza',

    'gallery.slide.pbs-cocina.tag': 'ALTA COCINA DE AUTOR',
    'gallery.slide.pbs-cocina.title': 'Cocina & Desayunador PB Sur',
    'gallery.slide.pbs-cocina.subtitle': 'Concepto abierto que articula elegancia minimalista con funcionalidad gastronómica. Tonos minerales cálidos y conexión directa con el comedor formal y área de servicio.',
    'gallery.slide.pbs-cocina.dock': 'Cocina',

    'gallery.slide.ph-cima.tag': 'MIRADOR SUPERIOR',
    'gallery.slide.ph-cima.title': 'La Cima Panorámica',
    'gallery.slide.ph-cima.subtitle': 'Perspectivas de 180° sobre el valle de Caracas y la cresta verde del Ávila, con terrazas perimetrales y privacidad absoluta.',
    'gallery.slide.ph-cima.dock': 'Mirador',

    'gallery.slide.ph-doble-altura.tag': 'VOLADIZOS Y VENTANALES',
    'gallery.slide.ph-doble-altura.title': 'Doble Altura y Voladizos Perimetrales',
    'gallery.slide.ph-doble-altura.subtitle': 'Grandes luces estructurales con losas en voladizo continuo. Fachadas completamente acristaladas con atenuación solar y acústica de máxima especificación.',
    'gallery.slide.ph-doble-altura.dock': 'Doble Altura',

    'gallery.slide.ph-transicion.tag': 'LUCES Y CELOSÍAS',
    'gallery.slide.ph-transicion.title': 'Transición Vidriada y Luz Cenital',
    'gallery.slide.ph-transicion.subtitle': 'La modulación de celosías regula el asoleamiento de la tarde, creando un juego dinámico de luces y sombras en los salones de doble altura.',
    'gallery.slide.ph-transicion.dock': 'Ventanales',

    // Elevation & Technical Plates Viewer
    'elevation.title': 'Estratigrafía & Láminas Técnicas',
    'elevation.mobileOpen': '☰ PLANOS & VISTAS',
    'elevation.mobileClose': '✕ CERRAR MENÚ',
    'elevation.prevTitle': 'Lámina anterior (← Flecha Izquierda)',
    'elevation.nextTitle': 'Siguiente lámina (→ Flecha Derecha)',
    'elevation.loupeBadge': '2.5× DETALLE',
    'elevation.zoomAlt': 'Aumento de plano',

    'elevation.cat.elevacion': 'Elevación Frontal',
    'elevation.cat.corte': 'Corte Seccional 3D',
    'elevation.cat.explotado': 'Diagrama Explotado',
    'elevation.cat.perspectiva': 'Perspectiva Real 2K',

    'elevation.var.elev-1.pill': 'Fachada Principal · Acceso',
    'elevation.var.elev-1.tag': 'Fachada Principal · Portón de Acceso y Balcones Laterales',
    'elevation.var.elev-1.sub': 'Proyección ortográfica 2K con portón en el área de acceso (±0.00m) y extensión lateral continua de balcones curvos.',

    'elevation.var.elev-2.pill': 'Alzado Lateral & Acceso',
    'elevation.var.elev-2.tag': 'Fachada Lateral · Extensión de Balcones y Portón',
    'elevation.var.elev-2.sub': 'Alzado lateral con balcones extendidos en voladizo sobre el área de acceso vehicular, muro en «L» y celosías verticales.',

    'elevation.var.elev-3.pill': 'Coronamiento & Aleros',
    'elevation.var.elev-3.tag': 'Cotas y Coronamiento',
    'elevation.var.elev-3.sub': 'Alzado técnico completo con detalle de aleros y remate mirador de penthouse.',

    'elevation.var.corte-1.pill': 'Sección Transversal',
    'elevation.var.corte-1.tag': 'Corte Transversal Norte-Sur',
    'elevation.var.corte-1.sub': 'Sección espacial que expone el dúplex jardín, salones centrales y doble altura.',

    'elevation.var.corte-2.pill': 'Espacialidad PB',
    'elevation.var.corte-2.tag': 'Espacialidad Interior PB',
    'elevation.var.corte-2.sub': 'Relación directa entre las terrazas privadas de planta baja y los salones diáfanos.',

    'elevation.var.corte-3.pill': 'Estructura de Losas',
    'elevation.var.corte-3.tag': 'Transición Estructural de Losas',
    'elevation.var.corte-3.sub': 'Detalle de losas de concreto armado, piscinas de planta baja con muro continuo de piedra laja y alturas de 3.20 m.',

    'elevation.var.corte-4.pill': 'Mirador Penthouse',
    'elevation.var.corte-4.tag': 'Mirador Superior Penthouse',
    'elevation.var.corte-4.sub': 'Remate cenital y terrazas panorámicas con vistas abiertas de 180° a El Ávila.',

    'elevation.var.expl-1.pill': 'Despiece Integral',
    'elevation.var.expl-1.tag': 'Despiece Axonométrico Integral',
    'elevation.var.expl-1.sub': 'Separación vertical de losas que revela la independencia acústica y estructural por nivel.',

    'elevation.var.expl-2.pill': 'Estratigrafía de Niveles',
    'elevation.var.expl-2.tag': 'Estratigrafía de Niveles',
    'elevation.var.expl-2.sub': 'Lectura secuencial desde el subsuelo de estacionamientos hasta la cubierta mirador.',

    'elevation.var.expl-3.pill': 'Terrazas en Voladizo',
    'elevation.var.expl-3.tag': 'Capas y Terrazas en Volado',
    'elevation.var.expl-3.sub': 'Articulación de los balcones en voladizo continuo y jardineras perimetrales.',

    'elevation.var.expl-4.pill': 'Núcleo & Circulaciones',
    'elevation.var.expl-4.tag': 'Núcleo Central y Circulaciones',
    'elevation.var.expl-4.sub': 'Ubicación de los ascensores privados directos y cajas de escaleras presurizadas.',

    'elevation.var.persp-1.pill': 'Fachada de Acceso Real',
    'elevation.var.persp-1.tag': 'Render Arquitectónico · Pórtico de Acceso y Balcones Laterales',
    'elevation.var.persp-1.sub': 'Vista real de la fachada de acceso con el portón en la zona exterior de entrada, rampa de 5 franjas y balcones extendidos lateralmente.',

    'elevation.var.persp-2.pill': 'Fachada Frontal',
    'elevation.var.persp-2.tag': 'Fachada Frontal 2K',
    'elevation.var.persp-2.sub': 'Alzado en alta definición bajo la atmósfera lumínica matutina de Altamira.',

    'elevation.var.persp-3.pill': 'Encuadre de Autor',
    'elevation.var.persp-3.tag': 'Encuadre Arquitectónico',
    'elevation.var.persp-3.sub': 'Perspectiva con ángulo medio destacando la horizontalidad monolítica de la obra.',

    'elevation.var.persp-4.pill': 'Axonometría de Acceso',
    'elevation.var.persp-4.tag': 'Pórtico, Rampa y Extensión Lateral de Balcones',
    'elevation.var.persp-4.sub': 'Detalle axonométrico del portón posicionado en el área de acceso, rampa vehicular y balcones extendidos lateralmente.',

    // Private Advisory CTA
    'cta.eyebrow': 'ATENCIÓN INSTITUCIONAL & PRIVADA',
    'cta.heading': 'Inicie su proceso de adquisición o agende una presentación privada.',
    'cta.bodyPrefix': 'La comercialización de las 8 residencias de',
    'cta.bodyMiddle': 'se gestiona de manera personalizada y directa por la dirección de',
    'cta.bodySuffix': '. Le invitamos a coordinar una sesión privada para conocer la disponibilidad, planos y cronograma de entrega.',
    'cta.badge.units': '8 Residencias de Autor',
    'cta.badge.location': 'Altamira, Caracas',
    'cta.badge.delivery': 'Entrega {delivery}',
    'cta.card.title': 'Dirección de Arquitectura',
    'cta.card.subtitle': 'Añil Arquitectura · Altamira',
    'cta.button.schedule': 'Agendar Cita Privada',
    'cta.button.whatsapp': 'Contacto Directo vía WhatsApp',
    'cta.hours': 'Atención confidencial de lunes a sábado previa cita',

    // Floating Advisor & Footer
    'advisor.title': 'Asesor · Residencias Caroní',
    'advisor.aria': 'Abrir Asesor',
    'advisor.online': 'En línea',
    'footer.home': 'Inicio',
    'footer.gallery': 'Galería',
    'footer.residences': 'Residencias',
    'footer.top': 'Subir',
  },

  en: {
    // Header & Navigation
    'header.tagline': 'eight residences · a single piece',
    'header.subtitle': 'AÑIL ARQUITECTURA · ALTAMIRA',
    'header.nav.obra': 'THE PROJECT',
    'header.nav.galeria': 'GALLERY',
    'header.nav.elevacion': 'PLANS',
    'header.nav.contacto': 'CONTACT',
    'header.nav.model3d': '3D MODEL',
    'header.nav.model3d.title': 'Open Interactive 3D Model',
    'header.lang.aria': 'Switch platform language',

    // Hero Video Narrative
    'hero.srOnlyTitle': 'Residencias Caroní · Altamira, Caracas · Añil Arquitectura',
    'hero.exploreGallery': 'EXPLORE GALLERY',
    'hero.exploreGallery.title': 'Scroll to Perspectives Gallery',
    'hero.sr.calibrating': '4K AI: CALIBRATING',
    'hero.sr.on': '4K AI SR: ON',
    'hero.sr.off': '4K AI SR: OFF',
    'hero.sr.disableAria': 'Disable 4K AI Super-Resolution',
    'hero.sr.enableAria': 'Enable 4K AI Super-Resolution',
    'hero.audio.on': 'AUDIO: ON',
    'hero.audio.off': 'AUDIO: OFF',
    'hero.audio.muteTitle': 'Mute audio',
    'hero.audio.unmuteTitle': 'Enable film audio',
    'hero.playTitle': 'Play video',
    'hero.pauseTitle': 'Pause video',

    // Gallery Section
    'gallery.kickerLeft': 'PERSPECTIVES & MATERIALITY',
    'gallery.kickerRight': 'AUTHORED RENDERS',
    'gallery.scrollHint': 'HORIZONTAL SCROLL',
    'gallery.loupeHint': 'Hover to magnify',
    'gallery.zoomAlt': '{title} magnified',
    'gallery.cat.exteriores.label': 'Exteriors',
    'gallery.cat.exteriores.badge': 'FACADES & SETTING',
    'gallery.cat.pb-norte.label': 'GF North · Ávila',
    'gallery.cat.pb-norte.badge': 'GF NORTH RESIDENCES',
    'gallery.cat.pb-sur.label': 'GF South · Valley',
    'gallery.cat.pb-sur.badge': 'GF SOUTH RESIDENCES',
    'gallery.cat.penthouse.label': 'Penthouse',
    'gallery.cat.penthouse.badge': 'UPPER OVERLOOKS',

    // Gallery Slides
    'gallery.slide.ext-frontal.tag': 'PRIMARY FACADE',
    'gallery.slide.ext-frontal.title': 'El Ávila as Witness',
    'gallery.slide.ext-frontal.subtitle': 'Sited at the foot of the National Park in Altamira. Eight residences conceived as a single sculptural volume in dialogue with Caracas modernist heritage.',
    'gallery.slide.ext-frontal.dock': 'Frontal',

    'gallery.slide.ext-urbana.tag': 'URBAN SITING',
    'gallery.slide.ext-urbana.title': 'Presence on 8th Transversal',
    'gallery.slide.ext-urbana.subtitle': 'Harmonious relationship with the urban fabric of Altamira. The volume steps back behind a lush landscaped plinth providing complete privacy for lower-level residences.',
    'gallery.slide.ext-urbana.dock': 'Urban',

    'gallery.slide.ext-celosias.tag': 'TECTONIC HONESTY',
    'gallery.slide.ext-celosias.title': 'Matter and Truth',
    'gallery.slide.ext-celosias.subtitle': 'Board-formed architectural concrete, solar brise-soleil screens, and precision metalwork. Noble materials tuned to the tropical climate that age with dignity.',
    'gallery.slide.ext-celosias.dock': 'Louvers',

    'gallery.slide.ext-lateral.tag': 'SCULPTURAL MASSING',
    'gallery.slide.ext-lateral.title': 'Side Elevation & Shear Walls',
    'gallery.slide.ext-lateral.subtitle': 'Monolithic concrete shear walls punctuated by deliberate apertures—shielding lateral privacy between neighbors while framing mountain and valley vistas.',
    'gallery.slide.ext-lateral.dock': 'Lateral',

    'gallery.slide.ext-acceso.tag': 'THRESHOLD & ARRIVAL',
    'gallery.slide.ext-acceso.title': 'Portico & Pedestrian Entry',
    'gallery.slide.ext-acceso.subtitle': 'The arrival sequence unfolds as a quiet transition: discreet biometric access control, honed granite paving, and a living botanical welcome wall.',
    'gallery.slide.ext-acceso.dock': 'Entry',

    'gallery.slide.ext-patio.tag': 'GARDENS & LANDSCAPE',
    'gallery.slide.ext-patio.title': 'Ground-Level Garden Courtyard',
    'gallery.slide.ext-patio.subtitle': 'A cool microclimate at the base of El Ávila offering the serenity of an isolated single-family villa within an ultra-private authored enclave.',
    'gallery.slide.ext-patio.dock': 'Courtyard',

    'gallery.slide.pbn-salon.tag': 'LIVING PAVILION',
    'gallery.slide.pbn-salon.title': 'Boundary-Free Volume',
    'gallery.slide.pbn-salon.subtitle': 'Commanding 3.20-meter clear ceiling heights, column-free living salons, and effortless flow toward floor-to-ceiling glazing bathed in filtered daylight.',
    'gallery.slide.pbn-salon.dock': 'Salon',

    'gallery.slide.pbn-terraza.tag': 'AUTHORED OUTDOORS',
    'gallery.slide.pbn-terraza.title': 'North Garden & Terrace',
    'gallery.slide.pbn-terraza.subtitle': 'Continuous private terraces and walled gardens shielded from the city—an enclave calibrated for direct contemplation of El Ávila’s forested ridge.',
    'gallery.slide.pbn-terraza.dock': 'Terrace',

    'gallery.slide.pbn-cocina.tag': 'HAUTE CULINARY STUDIO',
    'gallery.slide.pbn-cocina.title': 'Gourmet Kitchen & Social Island',
    'gallery.slide.pbn-cocina.subtitle': 'Sculptural exotic quartzite central island paired with handleless European cabinetry, integrated chef-grade appliances, and zenithal lighting.',
    'gallery.slide.pbn-cocina.dock': 'Kitchen',

    'gallery.slide.pbs-salon.tag': 'LIVING PAVILION',
    'gallery.slide.pbs-salon.title': 'GF South Open Living Salon',
    'gallery.slide.pbs-salon.subtitle': 'Measured proportions oriented southward toward the panoramic Caracas valley, capturing warm natural light throughout morning and afternoon hours.',
    'gallery.slide.pbs-salon.dock': 'Salon',

    'gallery.slide.pbs-terraza.tag': 'PRIVATE EXPANSION',
    'gallery.slide.pbs-terraza.title': 'GF South Perimeter Terrace & Deck',
    'gallery.slide.pbs-terraza.subtitle': 'Open-air sanctuary sheltered by deep concrete overhangs providing permanent shade and tropical rain protection without dimming the interior.',
    'gallery.slide.pbs-terraza.dock': 'Terrace',

    'gallery.slide.pbs-cocina.tag': 'HAUTE CULINARY STUDIO',
    'gallery.slide.pbs-cocina.title': 'GF South Kitchen & Breakfast Bar',
    'gallery.slide.pbs-cocina.subtitle': 'Open-plan layout uniting minimalist restraint with culinary performance in warm mineral tones linked directly to formal dining and service quarters.',
    'gallery.slide.pbs-cocina.dock': 'Kitchen',

    'gallery.slide.ph-cima.tag': 'UPPER OVERLOOK',
    'gallery.slide.ph-cima.title': 'The Panoramic Summit',
    'gallery.slide.ph-cima.subtitle': '180° commanding sightlines across the Caracas valley and El Ávila crest, wrapped in perimeter sky terraces and total privacy.',
    'gallery.slide.ph-cima.dock': 'Overlook',

    'gallery.slide.ph-doble-altura.tag': 'CANTILEVERS & GLAZING',
    'gallery.slide.ph-doble-altura.title': 'Double Height & Cantilevered Slabs',
    'gallery.slide.ph-doble-altura.subtitle': 'Long structural spans with continuous cantilevered floor plates and high-spec solar/acoustic curtain-wall glazing.',
    'gallery.slide.ph-doble-altura.dock': 'Double Height',

    'gallery.slide.ph-transicion.tag': 'LIGHT & BRISE-SOLEIL',
    'gallery.slide.ph-transicion.title': 'Glazed Transition & Zenithal Light',
    'gallery.slide.ph-transicion.subtitle': 'Rhythmic timber-toned louvers modulate western afternoon sun, casting choreographed light and shadow across the double-height living gallery.',
    'gallery.slide.ph-transicion.dock': 'Glazing',

    // Elevation & Technical Plates Viewer
    'elevation.title': 'Stratigraphy & Technical Plates',
    'elevation.mobileOpen': '☰ PLANS & VIEWS',
    'elevation.mobileClose': '✕ CLOSE MENU',
    'elevation.prevTitle': 'Previous plate (← Left Arrow)',
    'elevation.nextTitle': 'Next plate (→ Right Arrow)',
    'elevation.loupeBadge': '2.5× DETAIL',
    'elevation.zoomAlt': 'Magnified architectural plate',

    'elevation.cat.elevacion': 'Front Elevation',
    'elevation.cat.corte': '3D Sectional Cut',
    'elevation.cat.explotado': 'Exploded Axonometric',
    'elevation.cat.perspectiva': '2K Photo Perspective',

    'elevation.var.elev-1.pill': 'Main Facade · Entry',
    'elevation.var.elev-1.tag': 'Main Facade · Entry Gate & Lateral Balconies',
    'elevation.var.elev-1.sub': '2K orthographic projection featuring the vehicular entry gate at datum ±0.00m and continuous curved lateral balconies.',

    'elevation.var.elev-2.pill': 'Side Elevation & Entry',
    'elevation.var.elev-2.tag': 'Side Elevation · Extended Balconies & Gate',
    'elevation.var.elev-2.sub': 'Lateral elevation highlighting cantilevered balconies over the vehicular driveway, L-shaped feature wall, and vertical louvers.',

    'elevation.var.elev-3.pill': 'Crown & Eaves',
    'elevation.var.elev-3.tag': 'Dimensions & Roof Crown',
    'elevation.var.elev-3.sub': 'Full technical elevation detailing perimeter concrete eaves and the penthouse overlook crown.',

    'elevation.var.corte-1.pill': 'Cross Section',
    'elevation.var.corte-1.tag': 'North-South Cross Section',
    'elevation.var.corte-1.sub': 'Spatial section revealing the garden duplex levels, central salons, and penthouse double-height volume.',

    'elevation.var.corte-2.pill': 'GF Spatiality',
    'elevation.var.corte-2.tag': 'Ground-Floor Spatial Sequence',
    'elevation.var.corte-2.sub': 'Seamless spatial threshold between private ground-level terraces and open interior living pavilions.',

    'elevation.var.corte-3.pill': 'Slab Structure',
    'elevation.var.corte-3.tag': 'Structural Slab Articulation',
    'elevation.var.corte-3.sub': 'Reinforced concrete floor plates, ground-level lap pools with continuous natural stone wall, and 3.20m clear ceiling heights.',

    'elevation.var.corte-4.pill': 'Penthouse Overlook',
    'elevation.var.corte-4.tag': 'Penthouse Roof Overlook',
    'elevation.var.corte-4.sub': 'Zenithal roof cap and panoramic terraces opening to unobstructed 180° El Ávila views.',

    'elevation.var.expl-1.pill': 'Full Assembly',
    'elevation.var.expl-1.tag': 'Comprehensive Exploded Axonometric',
    'elevation.var.expl-1.sub': 'Vertical slab separation illustrating acoustic and structural independence across every residential floor.',

    'elevation.var.expl-2.pill': 'Floor Stratigraphy',
    'elevation.var.expl-2.tag': 'Level-by-Level Stratigraphy',
    'elevation.var.expl-2.sub': 'Sequential vertical reading from subterranean parking levels up to the panoramic roof terrace.',

    'elevation.var.expl-3.pill': 'Cantilevered Terraces',
    'elevation.var.expl-3.tag': 'Layers & Cantilevered Balconies',
    'elevation.var.expl-3.sub': 'Tectonic articulation of continuous cantilevered wraparound balconies and perimeter planters.',

    'elevation.var.expl-4.pill': 'Core & Circulation',
    'elevation.var.expl-4.tag': 'Central Core & Private Circulation',
    'elevation.var.expl-4.sub': 'Placement of private direct-entry elevators and pressurized vertical egress stairwells.',

    'elevation.var.persp-1.pill': 'Actual Entry Facade',
    'elevation.var.persp-1.tag': 'Architectural Render · Entry Portico & Lateral Balconies',
    'elevation.var.persp-1.sub': 'Photorealistic view of the arrival facade with exterior access gate, five-strip concrete ramp, and laterally extended balconies.',

    'elevation.var.persp-2.pill': 'Frontal Facade',
    'elevation.var.persp-2.tag': '2K Frontal Facade',
    'elevation.var.persp-2.sub': 'High-definition frontal elevation rendered under crisp Altamira morning daylight.',

    'elevation.var.persp-3.pill': 'Authored Framing',
    'elevation.var.persp-3.tag': 'Architectural Perspective',
    'elevation.var.persp-3.sub': 'Mid-angle perspective emphasizing the monolithic horizontality of the composition.',

    'elevation.var.persp-4.pill': 'Entry Axonometry',
    'elevation.var.persp-4.tag': 'Portico, Ramp & Extended Lateral Balconies',
    'elevation.var.persp-4.sub': 'Axonometric detail of the entry gate positioned at the outer threshold, vehicular ramp, and laterally extended balconies.',

    // Private Advisory CTA
    'cta.eyebrow': 'INSTITUTIONAL & PRIVATE ADVISORY',
    'cta.heading': 'Begin your acquisition process or schedule a private presentation.',
    'cta.bodyPrefix': 'The placement of all 8 residences at',
    'cta.bodyMiddle': 'is managed directly and personally by the leadership of',
    'cta.bodySuffix': '. We invite you to arrange a private briefing to review unit availability, floor plans, and the delivery schedule.',
    'cta.badge.units': '8 Authored Residences',
    'cta.badge.location': 'Altamira, Caracas',
    'cta.badge.delivery': 'Delivery {delivery}',
    'cta.card.title': 'Architectural Direction',
    'cta.card.subtitle': 'Añil Arquitectura · Altamira',
    'cta.button.schedule': 'Schedule Private Appointment',
    'cta.button.whatsapp': 'Direct Contact via WhatsApp',
    'cta.hours': 'Confidential advisory Monday through Saturday by appointment',

    // Floating Advisor & Footer
    'advisor.title': 'Advisor · Residencias Caroní',
    'advisor.aria': 'Open Advisor',
    'advisor.online': 'Online',
    'footer.home': 'Home',
    'footer.gallery': 'Gallery',
    'footer.residences': 'Residences',
    'footer.top': 'Top',
  },
};
