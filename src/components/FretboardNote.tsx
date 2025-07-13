import React from 'react';

interface FretboardNoteProps {
  note: string;
  colors: string[]; // Updated to accept multiple colors for overlapping scales
  isNut?: boolean; // Indicates if this is the nut (0th fret)
  hasScalesSelected?: boolean; // Indicates if any scales are selected
  blendOverlaps?: boolean;
  onHoverStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  onHoverEnd: () => void;
}

// Helper to determine if a color is light or dark
function isColorLight(hex: string): boolean {
  // Remove # if present
  hex = hex.replace('#', '');
  // Parse r, g, b
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  // Perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6; // threshold: tweak as needed
}

const FretboardNote: React.FC<FretboardNoteProps> = ({ note, colors, isNut = false, hasScalesSelected = false, blendOverlaps = false, onHoverStart, onHoverEnd }) => {
  const hasColors = colors && colors.length > 0;
  // Improved blending function: average RGB, handle 3/6 digit hex, clamp, and return 6-digit hex
  function blendColors(hexColors: string[]): string {
    if (hexColors.length === 0) return '#444444';
    let r = 0, g = 0, b = 0;
    hexColors.forEach(hex => {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length === 6) {
        r += parseInt(hex.substring(0, 2), 16);
        g += parseInt(hex.substring(2, 4), 16);
        b += parseInt(hex.substring(4, 6), 16);
      }
    });
    r = Math.round(r / hexColors.length);
    g = Math.round(g / hexColors.length);
    b = Math.round(b / hexColors.length);
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toLowerCase();
  }
  const cellColor = hasColors
    ? (blendOverlaps && colors.length > 1 ? blendColors(colors) : colors[0])
    : undefined;
  const textColor = hasColors
    ? (isColorLight(cellColor!) ? '#222' : '#fff')
    : (hasScalesSelected ? 'text-gray-400' : 'text-white');

  return (
    <div
      className={`relative flex items-center justify-center bg-gray-800 border border-gray-600 ${isNut ? 'border-r-[6px] border-r-gray-500' : ''}`}
      style={{
        height: 'clamp(30px, 8vw, 40px)',
        minHeight: '30px',
        width: '100%'
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {(!hasScalesSelected || hasColors) && (
        <div
          className={`rounded-full px-1 sm:px-2 py-1 text-xs font-medium transition relative`}
          style={{
            background: hasColors
              ? (blendOverlaps && colors.length > 1
                ? cellColor
                : `conic-gradient(${colors.map((color, i) => `${color} ${(i / colors.length) * 100}%, ${color} ${((i + 1) / colors.length) * 100}%`).join(', ')})`)
              : 'transparent',
            fontSize: 'clamp(8px, 2vw, 12px)',
            lineHeight: '1',
            color: hasColors ? textColor : undefined
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
};

export default FretboardNote;
