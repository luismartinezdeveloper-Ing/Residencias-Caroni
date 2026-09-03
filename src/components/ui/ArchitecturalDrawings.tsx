import React from 'react';

// Official Line Isotype
export const CaroniIsotype: React.FC<{
  color?: string;
  size?: number;
  className?: string;
}> = ({ color = '#1B1813', size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      referrerPolicy="no-referrer"
    >
      {/* Pure clean architectural line art representing the single monolithic volume partitioned into geometric rhythm */}
      <path
        d="M20 82V24L50 14L80 24V82"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="square"
      />
      {/* Horizontal structural lines - cotas */}
      <line x1="20" y1="42" x2="80" y2="42" stroke={color} strokeWidth="1.2" />
      <line x1="20" y1="62" x2="80" y2="62" stroke={color} strokeWidth="1.2" />
      <line x1="20" y1="82" x2="80" y2="82" stroke={color} strokeWidth="2.2" />
      
      {/* Vertical module division */}
      <line x1="50" y1="14" x2="50" y2="82" stroke={color} strokeWidth="1.4" />
      <line x1="35" y1="42" x2="35" y2="82" stroke={color} strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="65" y1="42" x2="65" y2="82" stroke={color} strokeWidth="0.8" strokeDasharray="2 2" />
      
      {/* Base contact line */}
      <line x1="12" y1="82" x2="88" y2="82" stroke={color} strokeWidth="1" />
    </svg>
  );
};

// Official Sello
export const CaroniSeal: React.FC<{ size?: number; color?: string }> = ({
  size = 110,
  color = '#8C7452',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="80" cy="80" r="76" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="80" cy="80" r="70" stroke={color} strokeWidth="0.8" />
      
      {/* Text in circle */}
      <path
        id="textPathUpper"
        d="M 22 80 A 58 58 0 0 1 138 80"
        fill="none"
      />
      <path
        id="textPathLower"
        d="M 138 80 A 58 58 0 0 1 22 80"
        fill="none"
      />
      
      <text fill={color} fontSize="8.5" fontFamily="Calibri, Inter, sans-serif" letterSpacing="0.28em">
        <textPath href="#textPathUpper" startOffset="50%" textAnchor="middle">
          RESIDENCIAS CARONÍ
        </textPath>
      </text>

      <text fill={color} fontSize="7" fontFamily="Calibri, Inter, sans-serif" letterSpacing="0.22em">
        <textPath href="#textPathLower" startOffset="50%" textAnchor="middle">
          ALTAMIRA · CARACAS · MMXXVIII
        </textPath>
      </text>
      
      {/* Center symbol */}
      <g transform="translate(48, 48) scale(0.64)">
        <CaroniIsotype color={color} size={100} />
      </g>
    </svg>
  );
};

// Official Elevation Architectural Drawing with Cotas & Floor Shading
export const ArchitecturalElevation: React.FC<{
  className?: string;
  showCotas?: boolean;
  highlightLevel?: string;
  selectedUnitId?: string;
  onSelectUnitId?: (unitId: string) => void;
  theme?: 'crema' | 'papel' | 'tinta';
}> = ({
  className = '',
  showCotas = true,
  highlightLevel,
  selectedUnitId,
  onSelectUnitId,
  theme = 'crema',
}) => {
  const isDark = theme === 'tinta';
  const lineColor = isDark ? '#EFEBE0' : '#1B1813';
  const cotaColor = isDark ? '#8C8678' : '#8C8678';
  const mountainColor = isDark ? '#8C7452' : '#8C7452';
  const accentColor = '#8C7452';

  // Normalize level matcher helper
  const isLevelActive = (lvlCode: string) => {
    const raw = (highlightLevel || '').toLowerCase().trim();
    if (lvlCode === 'superior') {
      return (
        raw.includes('superior') ||
        raw.includes('mirador') ||
        raw.includes('coronación') ||
        raw.includes('coronacion') ||
        raw.includes('25.50') ||
        raw.includes('21.25') ||
        selectedUnitId === 'mirador-norte' ||
        selectedUnitId === 'mirador-sur'
      );
    }
    if (lvlCode === 'p3') {
      return (
        raw === 'p3' ||
        raw.includes('p3') ||
        raw.includes('tipo 03') ||
        raw.includes('17.00') ||
        selectedUnitId === 'residencia-03-norte' ||
        selectedUnitId === 'residencia-03-sur'
      );
    }
    if (lvlCode === 'p2') {
      return (
        raw === 'p2' ||
        raw.includes('p2') ||
        raw.includes('tipo 02') ||
        raw.includes('12.75') ||
        selectedUnitId === 'residencia-02-norte' ||
        selectedUnitId === 'residencia-02-sur'
      );
    }
    if (lvlCode === 'pb') {
      return (
        raw.includes('pb') ||
        raw.includes('jardín') ||
        raw.includes('jardin') ||
        raw.includes('dúplex') ||
        raw.includes('duplex') ||
        raw.includes('4.25') ||
        raw.includes('8.50') ||
        raw.includes('0.00') ||
        selectedUnitId === 'jardin-norte' ||
        selectedUnitId === 'jardin-sur'
      );
    }
    if (lvlCode === 'sotano') {
      return raw.includes('sótano') || raw.includes('sotano') || raw.includes('-3.50');
    }
    return false;
  };

  const isJNActive = selectedUnitId === 'jardin-norte' || (!selectedUnitId && isLevelActive('pb'));
  const isJSActive = selectedUnitId === 'jardin-sur' || (!selectedUnitId && isLevelActive('pb'));
  const isR2NActive = selectedUnitId === 'residencia-02-norte' || (!selectedUnitId && isLevelActive('p2'));
  const isR2SActive = selectedUnitId === 'residencia-02-sur' || (!selectedUnitId && isLevelActive('p2'));
  const isR3NActive = selectedUnitId === 'residencia-03-norte' || (!selectedUnitId && isLevelActive('p3'));
  const isR3SActive = selectedUnitId === 'residencia-03-sur' || (!selectedUnitId && isLevelActive('p3'));
  const isMNActive = selectedUnitId === 'mirador-norte' || (!selectedUnitId && isLevelActive('superior'));
  const isMSActive = selectedUnitId === 'mirador-sur' || (!selectedUnitId && isLevelActive('superior'));
  const isSotanoActive = isLevelActive('sotano');

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox="0 0 850 420"
        className="w-full h-auto max-h-[460px] select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* SVG Pattern Definitions for Architectural Shading & Hatching */}
        <defs>
          {/* Fine 45° Architectural Hatch for Active Floor */}
          <pattern
            id="archHatchActive"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke={accentColor} strokeWidth="1.2" opacity="0.45" />
          </pattern>

          {/* Cross Hatch for Penthouse / Ground Garden Accent */}
          <pattern
            id="archHatchGarden"
            width="10"
            height="10"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="10" stroke={accentColor} strokeWidth="0.8" opacity="0.35" />
            <line x1="0" y1="0" x2="10" y2="0" stroke={accentColor} strokeWidth="0.8" opacity="0.35" />
          </pattern>

          {/* Luminous Warm Bronze Wash Gradient */}
          <linearGradient id="bronzeFloorWash" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8C7452" stopOpacity="0.32" />
            <stop offset="50%" stopColor="#8C7452" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#8C7452" stopOpacity="0.32" />
          </linearGradient>

          <linearGradient id="bronzeSoftWash" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8C7452" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#8C7452" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Background Waraira Repano Mountain Silhouette (Strict Thin Line Art) */}
        <path
          d="M 10 220 Q 140 130 260 90 T 520 70 T 720 120 T 840 180"
          stroke={mountainColor}
          strokeWidth="0.8"
          strokeDasharray="4 3"
          opacity="0.6"
        />
        <path
          d="M 60 230 Q 220 140 380 110 T 640 95 T 840 150"
          stroke={mountainColor}
          strokeWidth="0.5"
          opacity="0.4"
        />

        {/* Mountain label */}
        <text
          x="320"
          y="60"
          fill={cotaColor}
          fontSize="9"
          fontFamily="Calibri, Inter, sans-serif"
          letterSpacing="0.22em"
          textAnchor="middle"
        >
          PARQUE NACIONAL WARAIRA REPANO · LÍNEA DE CONTACTO
        </text>

        {/* Ground Baseline ±0.00 */}
        <line x1="60" y1="360" x2="720" y2="360" stroke={lineColor} strokeWidth="2.5" />
        <line x1="40" y1="360" x2="740" y2="360" stroke={lineColor} strokeWidth="0.5" />

        {/* ======================================================== */}
        {/* LEVEL 01: DÚPLEX PB + 1 (Jardín Norte & Jardín Sur)     */}
        {/* ======================================================== */}
        {/* Level PB Shaded Background (Full Level Wash) */}
        {isLevelActive('pb') && (
          <rect
            x="180"
            y="275"
            width="440"
            height="85"
            fill="url(#bronzeSoftWash)"
          />
        )}

        {/* Quadrant Left: Jardín Norte (JN) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectUnitId && onSelectUnitId('jardin-norte')}
        >
          <rect
            x="180"
            y="275"
            width="220"
            height="85"
            fill={isJNActive ? 'url(#bronzeFloorWash)' : 'transparent'}
            stroke={isJNActive ? accentColor : 'transparent'}
            strokeWidth={isJNActive ? '2.4' : '0'}
            className="transition-all duration-200"
          />
          {isJNActive && (
            <rect
              x="180"
              y="275"
              width="220"
              height="85"
              fill="url(#archHatchActive)"
            />
          )}
        </g>

        {/* Quadrant Right: Jardín Sur (JS) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectUnitId && onSelectUnitId('jardin-sur')}
        >
          <rect
            x="400"
            y="275"
            width="220"
            height="85"
            fill={isJSActive ? 'url(#bronzeFloorWash)' : 'transparent'}
            stroke={isJSActive ? accentColor : 'transparent'}
            strokeWidth={isJSActive ? '2.4' : '0'}
            className="transition-all duration-200"
          />
          {isJSActive && (
            <rect
              x="400"
              y="275"
              width="220"
              height="85"
              fill="url(#archHatchActive)"
            />
          )}
        </g>

        {/* Base Structural Perimeter Level 01 */}
        <rect
          x="180"
          y="275"
          width="440"
          height="85"
          stroke={isLevelActive('pb') ? accentColor : lineColor}
          strokeWidth={isLevelActive('pb') ? '1.8' : '1.2'}
          fill="none"
          pointerEvents="none"
        />
        {/* Intermediate slab inside duplex */}
        <line
          x1="180"
          y1="318"
          x2="620"
          y2="318"
          stroke={isLevelActive('pb') ? accentColor : lineColor}
          strokeWidth="0.8"
          strokeDasharray="3 3"
          pointerEvents="none"
        />

        {/* Duplex Gardens & Private Pool on ground */}
        <g className={isJNActive ? 'opacity-100' : 'opacity-80'}>
          <line
            x1="80"
            y1="360"
            x2="180"
            y2="360"
            stroke={isJNActive ? accentColor : lineColor}
            strokeWidth={isJNActive ? '2.2' : '1.2'}
          />
          {isJNActive && (
            <rect x="80" y="338" width="100" height="22" fill="url(#archHatchGarden)" />
          )}
          <path
            d="M 90 360 L 90 348 L 170 348 L 170 360"
            stroke={isJNActive ? accentColor : accentColor}
            strokeWidth={isJNActive ? '1.2' : '0.8'}
            fill={isJNActive ? `${accentColor}25` : 'none'}
          />
          <text
            x="130"
            y="342"
            fill={isJNActive ? accentColor : cotaColor}
            fontSize="8"
            fontWeight={isJNActive ? 'bold' : 'normal'}
            fontFamily="Calibri, Inter"
            letterSpacing="0.18em"
            textAnchor="middle"
          >
            JARDÍN NORTE 350 m²
          </text>
        </g>

        {/* Duplex Sur Garden (Right ground) */}
        <g className={isJSActive ? 'opacity-100' : 'opacity-80'}>
          <line
            x1="620"
            y1="360"
            x2="720"
            y2="360"
            stroke={isJSActive ? accentColor : lineColor}
            strokeWidth={isJSActive ? '2.2' : '1.2'}
          />
          {isJSActive && (
            <rect x="620" y="338" width="100" height="22" fill="url(#archHatchGarden)" />
          )}
          <path
            d="M 630 360 L 630 348 L 710 348 L 710 360"
            stroke={isJSActive ? accentColor : accentColor}
            strokeWidth={isJSActive ? '1.2' : '0.8'}
            fill={isJSActive ? `${accentColor}25` : 'none'}
          />
          <text
            x="670"
            y="342"
            fill={isJSActive ? accentColor : cotaColor}
            fontSize="8"
            fontWeight={isJSActive ? 'bold' : 'normal'}
            fontFamily="Calibri, Inter"
            letterSpacing="0.18em"
            textAnchor="middle"
          >
            JARDÍN SUR 280 m²
          </text>
        </g>

        {/* ======================================================== */}
        {/* LEVEL 02: PLANTA TIPO P2 (Residencia 02 Norte / Sur)     */}
        {/* ======================================================== */}
        {isLevelActive('p2') && (
          <rect
            x="180"
            y="218"
            width="440"
            height="57"
            fill="url(#bronzeSoftWash)"
          />
        )}

        {/* Quadrant Left: Residencia 02 Norte (R2N) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectUnitId && onSelectUnitId('residencia-02-norte')}
        >
          <rect
            x="180"
            y="218"
            width="220"
            height="57"
            fill={isR2NActive ? 'url(#bronzeFloorWash)' : 'transparent'}
            stroke={isR2NActive ? accentColor : 'transparent'}
            strokeWidth={isR2NActive ? '2.4' : '0'}
            className="transition-all duration-200"
          />
          {isR2NActive && (
            <rect
              x="180"
              y="218"
              width="220"
              height="57"
              fill="url(#archHatchActive)"
            />
          )}
        </g>

        {/* Quadrant Right: Residencia 02 Sur (R2S) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectUnitId && onSelectUnitId('residencia-02-sur')}
        >
          <rect
            x="400"
            y="218"
            width="220"
            height="57"
            fill={isR2SActive ? 'url(#bronzeFloorWash)' : 'transparent'}
            stroke={isR2SActive ? accentColor : 'transparent'}
            strokeWidth={isR2SActive ? '2.4' : '0'}
            className="transition-all duration-200"
          />
          {isR2SActive && (
            <rect
              x="400"
              y="218"
              width="220"
              height="57"
              fill="url(#archHatchActive)"
            />
          )}
        </g>

        {/* Base Level 02 Perimeter */}
        <rect
          x="180"
          y="218"
          width="440"
          height="57"
          stroke={isLevelActive('p2') ? accentColor : lineColor}
          strokeWidth={isLevelActive('p2') ? '1.8' : '1.2'}
          fill="none"
          pointerEvents="none"
        />
        {/* Terrace cantilever P2 */}
        <rect
          x="155"
          y="222"
          width="25"
          height="49"
          stroke={isLevelActive('p2') ? accentColor : lineColor}
          strokeWidth={isLevelActive('p2') ? '1.4' : '1'}
          fill={isLevelActive('p2') ? `${accentColor}25` : 'none'}
        />
        <line x1="155" y1="246" x2="180" y2="246" stroke={cotaColor} strokeWidth="0.5" />

        {/* ======================================================== */}
        {/* LEVEL 03: PLANTA TIPO P3 (Residencia 03 Norte / Sur)     */}
        {/* ======================================================== */}
        {isLevelActive('p3') && (
          <rect
            x="180"
            y="161"
            width="440"
            height="57"
            fill="url(#bronzeSoftWash)"
          />
        )}

        {/* Quadrant Left: Residencia 03 Norte (R3N) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectUnitId && onSelectUnitId('residencia-03-norte')}
        >
          <rect
            x="180"
            y="161"
            width="220"
            height="57"
            fill={isR3NActive ? 'url(#bronzeFloorWash)' : 'transparent'}
            stroke={isR3NActive ? accentColor : 'transparent'}
            strokeWidth={isR3NActive ? '2.4' : '0'}
            className="transition-all duration-200"
          />
          {isR3NActive && (
            <rect
              x="180"
              y="161"
              width="220"
              height="57"
              fill="url(#archHatchActive)"
            />
          )}
        </g>

        {/* Quadrant Right: Residencia 03 Sur (R3S) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectUnitId && onSelectUnitId('residencia-03-sur')}
        >
          <rect
            x="400"
            y="161"
            width="220"
            height="57"
            fill={isR3SActive ? 'url(#bronzeFloorWash)' : 'transparent'}
            stroke={isR3SActive ? accentColor : 'transparent'}
            strokeWidth={isR3SActive ? '2.4' : '0'}
            className="transition-all duration-200"
          />
          {isR3SActive && (
            <rect
              x="400"
              y="161"
              width="220"
              height="57"
              fill="url(#archHatchActive)"
            />
          )}
        </g>

        {/* Base Level 03 Perimeter */}
        <rect
          x="180"
          y="161"
          width="440"
          height="57"
          stroke={isLevelActive('p3') ? accentColor : lineColor}
          strokeWidth={isLevelActive('p3') ? '1.8' : '1.2'}
          fill="none"
          pointerEvents="none"
        />
        {/* Terrace cantilever P3 */}
        <rect
          x="155"
          y="165"
          width="25"
          height="49"
          stroke={isLevelActive('p3') ? accentColor : lineColor}
          strokeWidth={isLevelActive('p3') ? '1.4' : '1'}
          fill={isLevelActive('p3') ? `${accentColor}25` : 'none'}
        />

        {/* ======================================================== */}
        {/* LEVEL SUPERIOR: CORONACIÓN & MIRADORES (MN & MS)         */}
        {/* ======================================================== */}
        {isLevelActive('superior') && (
          <rect
            x="180"
            y="100"
            width="440"
            height="61"
            fill="url(#bronzeSoftWash)"
          />
        )}

        {/* Quadrant Left: Mirador Norte (MN) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectUnitId && onSelectUnitId('mirador-norte')}
        >
          <rect
            x="180"
            y="100"
            width="220"
            height="61"
            fill={isMNActive ? 'url(#bronzeFloorWash)' : 'transparent'}
            stroke={isMNActive ? accentColor : 'transparent'}
            strokeWidth={isMNActive ? '2.4' : '0'}
            className="transition-all duration-200"
          />
          {isMNActive && (
            <rect
              x="180"
              y="100"
              width="220"
              height="61"
              fill="url(#archHatchActive)"
            />
          )}
        </g>

        {/* Quadrant Right: Mirador Sur (MS) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectUnitId && onSelectUnitId('mirador-sur')}
        >
          <rect
            x="400"
            y="100"
            width="220"
            height="61"
            fill={isMSActive ? 'url(#bronzeFloorWash)' : 'transparent'}
            stroke={isMSActive ? accentColor : 'transparent'}
            strokeWidth={isMSActive ? '2.4' : '0'}
            className="transition-all duration-200"
          />
          {isMSActive && (
            <rect
              x="400"
              y="100"
              width="220"
              height="61"
              fill="url(#archHatchActive)"
            />
          )}
        </g>

        {/* Base Level Superior Perimeter */}
        <rect
          x="180"
          y="100"
          width="440"
          height="61"
          stroke={isLevelActive('superior') ? accentColor : lineColor}
          strokeWidth={isLevelActive('superior') ? '2' : '1.5'}
          fill="none"
          pointerEvents="none"
        />

        {/* Mirador Rooftop Terrace & Pergola (Coronación) */}
        <g className={isLevelActive('superior') ? 'opacity-100' : 'opacity-85'}>
          <rect
            x="220"
            y="78"
            width="360"
            height="22"
            stroke={accentColor}
            strokeWidth={isLevelActive('superior') ? '1.4' : '1'}
            fill={isLevelActive('superior') ? `${accentColor}25` : 'none'}
          />
          {[240, 280, 320, 360, 400, 440, 480, 520, 560].map((xP) => (
            <line
              key={xP}
              x1={xP}
              y1="78"
              x2={xP}
              y2="100"
              stroke={accentColor}
              strokeWidth={isLevelActive('superior') ? '0.9' : '0.6'}
            />
          ))}
          <text
            x="400"
            y="92"
            fill={isLevelActive('superior') ? '#1B1813' : accentColor}
            fontSize="8"
            fontWeight="bold"
            fontFamily="Calibri, Inter"
            letterSpacing="0.2em"
            textAnchor="middle"
          >
            PERGOLADO & MIRADOR A CIELO ABIERTO · COTA +25.50
          </text>
        </g>

        {/* Vertical Axis (North vs South Partition Line) */}
        <line
          x1="400"
          y1="100"
          x2="400"
          y2="360"
          stroke={lineColor}
          strokeWidth="1.8"
          pointerEvents="none"
        />

        {/* Architectural rhythmic window mullions */}
        {[225, 270, 315, 360, 445, 490, 535, 580].map((xPos, idx) => (
          <g key={idx} opacity={0.7} pointerEvents="none">
            <line x1={xPos} y1="110" x2={xPos} y2="150" stroke={lineColor} strokeWidth="0.7" />
            <line x1={xPos} y1="170" x2={xPos} y2="210" stroke={lineColor} strokeWidth="0.7" />
            <line x1={xPos} y1="228" x2={xPos} y2="268" stroke={lineColor} strokeWidth="0.7" />
            <line x1={xPos} y1="285" x2={xPos} y2="350" stroke={lineColor} strokeWidth="0.7" />
          </g>
        ))}

        {/* Floor & Unit Typography Labels with Visual Active Badges */}
        {/* PB + 1 Labels */}
        <g pointerEvents="none">
          <text
            x="290"
            y={isJNActive ? '318' : '325'}
            fill={isJNActive ? '#1B1813' : lineColor}
            fontSize={isJNActive ? '11.5' : '10'}
            fontWeight={isJNActive ? 'bold' : 'normal'}
            fontFamily="EB Garamond, serif"
            textAnchor="middle"
          >
            Jardín Norte
          </text>
          {isJNActive && (
            <text
              x="290"
              y="336"
              fill={accentColor}
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="Calibri, Inter"
              letterSpacing="0.14em"
              textAnchor="middle"
            >
              ● SELECCIONADO (1.030 m²)
            </text>
          )}

          <text
            x="510"
            y={isJSActive ? '318' : '325'}
            fill={isJSActive ? '#1B1813' : lineColor}
            fontSize={isJSActive ? '11.5' : '10'}
            fontWeight={isJSActive ? 'bold' : 'normal'}
            fontFamily="EB Garamond, serif"
            textAnchor="middle"
          >
            Jardín Sur
          </text>
          {isJSActive && (
            <text
              x="510"
              y="336"
              fill={accentColor}
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="Calibri, Inter"
              letterSpacing="0.14em"
              textAnchor="middle"
            >
              ● SELECCIONADO (931 m²)
            </text>
          )}

          {/* P2 Labels */}
          <text
            x="290"
            y={isR2NActive ? '243' : '249'}
            fill={isR2NActive ? '#1B1813' : lineColor}
            fontSize={isR2NActive ? '11.5' : '10'}
            fontWeight={isR2NActive ? 'bold' : 'normal'}
            fontFamily="EB Garamond, serif"
            textAnchor="middle"
          >
            Residencia 02 Norte
          </text>
          {isR2NActive && (
            <text
              x="290"
              y="259"
              fill={accentColor}
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="Calibri, Inter"
              letterSpacing="0.14em"
              textAnchor="middle"
            >
              ● SELECCIONADO (415 m²)
            </text>
          )}

          <text
            x="510"
            y={isR2SActive ? '243' : '249'}
            fill={isR2SActive ? '#1B1813' : lineColor}
            fontSize={isR2SActive ? '11.5' : '10'}
            fontWeight={isR2SActive ? 'bold' : 'normal'}
            fontFamily="EB Garamond, serif"
            textAnchor="middle"
          >
            Residencia 02 Sur
          </text>
          {isR2SActive && (
            <text
              x="510"
              y="259"
              fill={accentColor}
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="Calibri, Inter"
              letterSpacing="0.14em"
              textAnchor="middle"
            >
              ● SELECCIONADO (415 m²)
            </text>
          )}

          {/* P3 Labels */}
          <text
            x="290"
            y={isR3NActive ? '186' : '192'}
            fill={isR3NActive ? '#1B1813' : lineColor}
            fontSize={isR3NActive ? '11.5' : '10'}
            fontWeight={isR3NActive ? 'bold' : 'normal'}
            fontFamily="EB Garamond, serif"
            textAnchor="middle"
          >
            Residencia 03 Norte
          </text>
          {isR3NActive && (
            <text
              x="290"
              y="202"
              fill={accentColor}
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="Calibri, Inter"
              letterSpacing="0.14em"
              textAnchor="middle"
            >
              ● SELECCIONADO (415 m²)
            </text>
          )}

          <text
            x="510"
            y={isR3SActive ? '186' : '192'}
            fill={isR3SActive ? '#1B1813' : lineColor}
            fontSize={isR3SActive ? '11.5' : '10'}
            fontWeight={isR3SActive ? 'bold' : 'normal'}
            fontFamily="EB Garamond, serif"
            textAnchor="middle"
          >
            Residencia 03 Sur
          </text>
          {isR3SActive && (
            <text
              x="510"
              y="202"
              fill={accentColor}
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="Calibri, Inter"
              letterSpacing="0.14em"
              textAnchor="middle"
            >
              ● SELECCIONADO (415 m²)
            </text>
          )}

          {/* Superior Labels */}
          <text
            x="290"
            y={isMNActive ? '127' : '133'}
            fill={isMNActive ? '#1B1813' : lineColor}
            fontSize={isMNActive ? '11.5' : '10'}
            fontWeight={isMNActive ? 'bold' : 'normal'}
            fontFamily="EB Garamond, serif"
            textAnchor="middle"
          >
            Mirador Norte
          </text>
          {isMNActive && (
            <text
              x="290"
              y="144"
              fill={accentColor}
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="Calibri, Inter"
              letterSpacing="0.14em"
              textAnchor="middle"
            >
              ● SELECCIONADO (610 m²)
            </text>
          )}

          <text
            x="510"
            y={isMSActive ? '127' : '133'}
            fill={isMSActive ? '#1B1813' : lineColor}
            fontSize={isMSActive ? '11.5' : '10'}
            fontWeight={isMSActive ? 'bold' : 'normal'}
            fontFamily="EB Garamond, serif"
            textAnchor="middle"
          >
            Mirador Sur
          </text>
          {isMSActive && (
            <text
              x="510"
              y="144"
              fill={accentColor}
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="Calibri, Inter"
              letterSpacing="0.14em"
              textAnchor="middle"
            >
              ● SELECCIONADO (610 m²)
            </text>
          )}
        </g>

        {/* ======================================================== */}
        {/* SÓTANO: ESTACIONAMIENTO & SERVICIOS (-3.50)              */}
        {/* ======================================================== */}
        <g
          className="cursor-pointer"
          onClick={() => onSelectUnitId && onSelectUnitId('sotano')}
        >
          <rect
            x="180"
            y="360"
            width="440"
            height="42"
            stroke={isSotanoActive ? accentColor : cotaColor}
            strokeWidth={isSotanoActive ? '2' : '1'}
            strokeDasharray="3 3"
            fill={isSotanoActive ? 'url(#bronzeSoftWash)' : 'none'}
          />
          <text
            x="400"
            y="384"
            fill={isSotanoActive ? accentColor : cotaColor}
            fontSize="8.5"
            fontWeight={isSotanoActive ? 'bold' : 'normal'}
            fontFamily="Calibri, Inter"
            letterSpacing="0.22em"
            textAnchor="middle"
          >
            SÓTANO PRIVADO · 36 PUESTOS DE ESTACIONAMIENTO · -3.50
          </text>
        </g>

        {/* ======================================================== */}
        {/* 7 OFFICIAL COTAS DE FACHADA (Escala Derecha con Puntero) */}
        {/* ======================================================== */}
        {showCotas && (
          <g transform="translate(635, 0)">
            {/* Vertical guide line */}
            <line x1="45" y1="78" x2="45" y2="360" stroke={cotaColor} strokeWidth="0.6" />

            {[
              { val: '+25.50', y: 78, label: 'Coronación', key: 'superior' },
              { val: '+21.25', y: 100, label: 'Cubierta Mirador', key: 'superior' },
              { val: '+17.00', y: 161, label: 'Planta P3', key: 'p3' },
              { val: '+12.75', y: 218, label: 'Planta P2', key: 'p2' },
              { val: '+8.50', y: 275, label: 'Planta Alta Dúplex', key: 'pb' },
              { val: '+4.25', y: 318, label: 'Planta Baja', key: 'pb' },
              { val: '±0.00', y: 360, label: 'Cero de Proyecto', key: 'pb' },
            ].map((cota, i) => {
              const isCotaActive = isLevelActive(cota.key);
              return (
                <g key={i} className="transition-all duration-200">
                  {/* Horizontal tick mark */}
                  <line
                    x1="40"
                    y1={cota.y}
                    x2={isCotaActive ? '54' : '50'}
                    y2={cota.y}
                    stroke={isCotaActive ? accentColor : accentColor}
                    strokeWidth={isCotaActive ? '2.4' : '1.2'}
                  />
                  <line
                    x1="-15"
                    y1={cota.y}
                    x2="40"
                    y2={cota.y}
                    stroke={isCotaActive ? accentColor : cotaColor}
                    strokeWidth={isCotaActive ? '0.9' : '0.4'}
                    strokeDasharray="2 2"
                    opacity={isCotaActive ? 1 : 0.5}
                  />
                  {/* Cota value */}
                  <text
                    x="56"
                    y={cota.y + 3.5}
                    fill={isCotaActive ? accentColor : lineColor}
                    fontSize={isCotaActive ? '10.5' : '9.5'}
                    fontFamily="Calibri, Inter, sans-serif"
                    fontWeight={isCotaActive ? 'bold' : '600'}
                    letterSpacing="0.1em"
                  >
                    {cota.val}
                  </text>
                  <text
                    x="112"
                    y={cota.y + 3.5}
                    fill={isCotaActive ? '#1B1813' : cotaColor}
                    fontSize={isCotaActive ? '8' : '7.5'}
                    fontWeight={isCotaActive ? 'bold' : 'normal'}
                    fontFamily="Calibri, Inter, sans-serif"
                    letterSpacing="0.15em"
                  >
                    {cota.label}
                  </text>
                  {isCotaActive && (
                    <text
                      x="32"
                      y={cota.y + 3.5}
                      fill={accentColor}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="Calibri, Inter"
                      textAnchor="end"
                    >
                      ►
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};

// Architectural Floor Plan Schema
export const FloorPlanSchema: React.FC<{
  typology: 'Jardín' | 'Residencia' | 'Mirador';
  orientation: 'Norte' | 'Sur';
  planType?: 'Social' | 'Privada';
}> = ({ typology, orientation, planType = 'Social' }) => {
  return (
    <div className="border border-[#C9C4B5] bg-white p-6 relative">
      <div className="flex justify-between items-center border-b border-[#1B1813] pb-3 mb-4">
        <div>
          <span className="font-meta text-[10px] text-[#8C8678]">
            ESQUEMA ARQUITECTÓNICO · {typology === 'Residencia' ? 'PLANTA ÚNICA' : `DISTRIBUCIÓN ${planType.toUpperCase()}`}
          </span>
          <h4 className="font-display text-lg text-[#1B1813]">
            {typology === 'Jardín'
              ? (planType === 'Social' ? `Planta Baja (${orientation})` : `Planta Alta Privada (${orientation})`)
              : typology === 'Residencia'
              ? `Planta Tipo (${orientation})`
              : (planType === 'Social' ? `Planta Principal de Coronación (${orientation})` : `Nivel de Habitaciones (${orientation})`)}
          </h4>
        </div>
        <div className="text-right font-meta text-[9px] text-[#8C7452]">
          AÑIL ARQUITECTURA · ESCALA 1:100
        </div>
      </div>

      <svg viewBox="0 0 500 280" className="w-full h-auto select-none" fill="none">
        {/* Exterior Wall */}
        <rect x="30" y="30" width="440" height="220" stroke="#1B1813" strokeWidth="1.8" fill="#FAF9F6" />

        {planType === 'Privada' ? (
          <>
            {/* Private Area Layout */}
            {/* Master Suite Wing */}
            <rect x="30" y="30" width="220" height="220" stroke="#1B1813" strokeWidth="1.2" fill="#F4F1EA" />
            <text x="140" y="130" fill="#1B1813" fontSize="13" fontFamily="EB Garamond" textAnchor="middle">
              Master Suite
            </text>
            <text x="140" y="150" fill="#8C8678" fontSize="8.5" fontFamily="Calibri, Inter" textAnchor="middle">
              VESTIER WALKIN CLOSET · BAÑO DOBLE
            </text>
            {/* Secondary Suites */}
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
            )}
          </>
        ) : (
          typology === 'Jardín' ? (
            <>
              {/* Garden Zone */}
              <rect x="30" y="30" width="440" height="70" stroke="#8C7452" strokeWidth="1" fill="#F4F1EA" strokeDasharray="3 3" />
              <text x={orientation === 'Norte' ? "185" : "250"} y="68" fill="#8C7452" fontSize="9" fontFamily="Calibri, Inter" letterSpacing="0.15em" textAnchor="middle">
                JARDÍN PRIVADO EXCLUSIVO ({orientation === 'Norte' ? '350,89' : '280,40'} M²)
              </text>
              {orientation === 'Norte' && (
                <>
                  <rect x="340" y="42" width="100" height="36" stroke="#8C7452" strokeWidth="0.8" fill="none" />
                  <text x="390" y="64" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="middle">
                    LÁMINA DE AGUA
                  </text>
                </>
              )}

              {/* Covered Terrace */}
              <rect x="30" y="100" width="440" height="40" stroke="#1B1813" strokeWidth="1" fill="none" />
              <text x="250" y="124" fill="#8C8678" fontSize="9" fontFamily="Calibri, Inter" letterSpacing="0.18em" textAnchor="middle">
                TERRAZA CUBIERTA ({orientation === 'Norte' ? '120,75' : '110,50'} M²)
              </text>

              {/* Social Areas */}
              <line x1="250" y1="140" x2="250" y2="250" stroke="#1B1813" strokeWidth="1.2" />
              <text x="140" y="180" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">
                Gran Salón Principal
              </text>
              <text x="140" y="196" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="middle">
                DOBLE ALTURA
              </text>

              <text x="350" y="180" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">
                Comedor & Cocina
              </text>
              <text x="350" y="196" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="middle">
                DESPENSA + ÁREA DE FAENA
              </text>
              
              {/* Stairwell / Core */}
              <rect x="220" y="210" width="60" height="40" stroke="#8C7452" strokeWidth="1" fill="none" />
              <text x="250" y="234" fill="#8C7452" fontSize="7.5" fontFamily="Calibri, Inter" letterSpacing="0.1em" textAnchor="middle">
                NÚCLEO / ESCALERA
              </text>
            </>
          ) : typology === 'Residencia' ? (
            <>
              {/* Front Terrace */}
              <rect x="30" y="30" width="440" height="45" stroke="#8C7452" strokeWidth="1" fill="#F4F1EA" />
              <text x="250" y="58" fill="#8C7452" fontSize="9.5" fontFamily="Calibri, Inter" letterSpacing="0.2em" textAnchor="middle">
                TERRAZA FRONTAL CONTINUA (92,01 M²)
              </text>

              {/* Living / Dining */}
              <rect x="30" y="75" width="280" height="100" stroke="#1B1813" strokeWidth="1" fill="none" />
              <text x="170" y="125" fill="#1B1813" fontSize="12" fontFamily="EB Garamond" textAnchor="middle">
                Área Social / Gran Estar
              </text>
              <text x="170" y="142" fill="#8C8678" fontSize="8" fontFamily="Calibri, Inter" textAnchor="middle">
                VENTANALES PISO A TECHO
              </text>

              {/* Master Suite (in Social view for single-floor to show integration, but less focused) */}
              <rect x="310" y="75" width="160" height="100" stroke="#1B1813" strokeWidth="1" fill="none" />
              <text x="390" y="120" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">
                Acceso a Zona Íntima
              </text>

              <rect x="30" y="175" width="440" height="75" stroke="#1B1813" strokeWidth="0.8" fill="none" />
              <text x="250" y="215" fill="#1B1813" fontSize="10" fontFamily="EB Garamond" textAnchor="middle">
                Comedor / Cocina / Área de Servicio
              </text>
            </>
          ) : (
            <>
              {/* Mirador Penthouse Open Sky Terrace */}
              <rect x="30" y="30" width="440" height="65" stroke="#8C7452" strokeWidth="1.2" fill="#F4F1EA" />
              <text x="250" y="65" fill="#8C7452" fontSize="10" fontFamily="Calibri, Inter" letterSpacing="0.22em" textAnchor="middle">
                MIRADOR A CIELO ABIERTO (180,50 M²) · COTA +25.50
              </text>

              {/* Grand Reception Hall */}
              <rect x="30" y="95" width="290" height="155" stroke="#1B1813" strokeWidth="1" fill="none" />
              <text x="175" y="170" fill="#1B1813" fontSize="13" fontFamily="EB Garamond" textAnchor="middle">
                Salón de Coronación & Comedor
              </text>
              <text x="175" y="188" fill="#8C8678" fontSize="8.5" fontFamily="Calibri, Inter" textAnchor="middle">
                VISTA 180° AL WARAIRA REPANO Y VALLE
              </text>

              {/* Master Suite Wing Area */}
              <rect x="320" y="95" width="150" height="155" stroke="#1B1813" strokeWidth="1" fill="none" />
              <text x="395" y="165" fill="#1B1813" fontSize="11" fontFamily="EB Garamond" textAnchor="middle">
                Acceso a Habitaciones
              </text>
            </>
          )
        )}
      </svg>
      
      <div className="mt-3 pt-2 border-t border-[#C9C4B5] flex justify-between items-center text-[10px] text-[#8C8678] font-meta">
        <span>COTA DE NIVEL ASIGNADA</span>
        <span>SUPERFICIE ÚNICA CONTRATABLE</span>
      </div>
    </div>
  );
};
