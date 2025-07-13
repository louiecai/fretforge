import React from 'react';

interface FretboardNoteProps {
  note: string;
  colors: string[]; // Updated to accept multiple colors for overlapping scales
  isNut?: boolean; // Indicates if this is the nut (0th fret)
  hasScalesSelected?: boolean; // Indicates if any scales are selected
  onHoverStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  onHoverEnd: () => void;
}

const FretboardNote: React.FC<FretboardNoteProps> = ({ note, colors, isNut = false, hasScalesSelected = false, onHoverStart, onHoverEnd }) => {
  const hasColors = colors && colors.length > 0;

  return (
    <div
      className={`relative flex items-center justify-center bg-gray-800 border border-gray-600 ${isNut ? 'border-r-[6px] border-r-gray-500' : ''
        }`}
      style={{
        height: 'clamp(30px, 8vw, 40px)',
        width: 'clamp(30px, 8vw, 50px)',
        minHeight: '30px',
        minWidth: '30px'
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {(!hasScalesSelected || hasColors) && (
        <div
          className={`rounded-full px-1 sm:px-2 py-1 text-xs font-medium transition relative ${hasColors ? 'text-white' : 'text-gray-400'
            }`}
          style={{
            background: hasColors
              ? `conic-gradient(${colors.map((color, i) => `${color} ${(i / colors.length) * 100}%, ${color} ${((i + 1) / colors.length) * 100}%`).join(', ')})`
              : 'transparent',
            fontSize: 'clamp(8px, 2vw, 12px)',
            lineHeight: '1'
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
};

export default FretboardNote;
