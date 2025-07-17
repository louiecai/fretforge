/**
 * FretboardNote.tsx
 *
 * Displays a single note cell on the fretboard grid, with support for color blending, hover, and click events.
 * Used by FretboardGrid to render each note position.
 */

import React from 'react';
import { Note, getIntervalName } from '../lib/Note';
import type { PitchClass } from '../lib/constants';

/**
 * Props for FretboardNote component.
 */
interface FretboardNoteProps {
  /** The note name (e.g., 'C♯', 'E♭') */
  note: string;
  /** Colors to display for this note (for overlapping scales) */
  colors: string[];
  /** Whether this cell is the nut (0th fret) */
  isNut?: boolean;
  /** Whether any scales are selected */
  hasScalesSelected?: boolean;
  /** Whether to blend colors for overlaps */
  blendOverlaps?: boolean;
  /** Mouse enter event */
  onHoverStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Mouse leave event */
  onHoverEnd: () => void;
  /** Click event (optional) */
  onClick?: () => void;
  /** The note center for interval display (note name string or null) */
  noteCenter?: string | null;
  /** Display mode: 'interval' or 'degree' */
  displayMode?: 'interval' | 'degree';
  /** User-configurable tritone label (e.g., '♭5', '♯4', '♯4/♭5') */
  tritoneLabel?: string;
  /** Whether this note is selected */
  selected?: boolean;
  /** Handler for selection toggle */
  onSelect?: (e: React.MouseEvent) => void;
  /** Handler for drag-select over this note */
  onDragOver?: (e: React.MouseEvent) => void;
  /** Handler for drag-select end (mouse up) */
  onDragEnd?: () => void;
  /** Which sides to show the white border for selection (top, right, bottom, left) */
  selectedBorders?: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  /** Whether this cell is in the last row */
  lastRow?: boolean;
  /** Whether this cell is in the last column */
  lastCol?: boolean;
  /** Whether this cell is in the first row */
  firstRow?: boolean;
  /** Whether this cell is in the first column */
  firstCol?: boolean;
}

/**
 * Helper to determine if a color is light or dark (for text contrast).
 * @param hex - Hex color string
 * @returns True if color is light
 */
function isColorLight(hex: string): boolean {
  hex = hex.replace('#', '');
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
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

/**
 * Blend multiple hex colors by averaging their RGB values.
 * @param hexColors - Array of hex color strings
 * @returns Blended hex color string
 */
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

// Map all possible note names (sharps and flats) to chromatic indices
const NOTE_NAME_TO_INDEX: Record<string, number> = {
  'C': 0, 'B♯': 0,
  'C♯': 1, 'D♭': 1,
  'D': 2,
  'D♯': 3, 'E♭': 3,
  'E': 4, 'F♭': 4,
  'F': 5, 'E♯': 5,
  'F♯': 6, 'G♭': 6,
  'G': 7,
  'G♯': 8, 'A♭': 8,
  'A': 9,
  'A♯': 10, 'B♭': 10,
  'B': 11, 'C♭': 11
};

// Chromatic scale degrees for all 12 semitones (tritone label is injected dynamically)
function getChromaticDegrees(tritoneLabel: string = '♭5'): Record<number, string> {
  return {
    0: '1',
    1: '♭2',
    2: '2',
    3: '♭3',
    4: '3',
    5: '4',
    6: tritoneLabel,
    7: '5',
    8: '♭6',
    9: '6',
    10: '♭7',
    11: '7',
  };
}

/**
 * Displays a single note cell on the fretboard grid.
 */
const FretboardNote: React.FC<FretboardNoteProps> = ({ note, colors, isNut = false, hasScalesSelected = false, blendOverlaps = false, onHoverStart, onHoverEnd, onClick, noteCenter, displayMode, tritoneLabel, selected, onSelect, onDragOver, onDragEnd, selectedBorders, lastRow, lastCol, firstRow, firstCol }) => {
  const hasColors = colors && colors.length > 0;
  const cellColor = hasColors
    ? (blendOverlaps && colors.length > 1 ? blendColors(colors) : colors[0])
    : undefined;
  const textColor = hasColors
    ? (isColorLight(cellColor!) ? '#222' : '#fff')
    : (hasScalesSelected ? 'text-gray-400' : 'text-white');

  // Interval or degree display logic
  let displayLabel = note;
  if (displayMode === 'degree' && noteCenter) {
    const centerIdx = NOTE_NAME_TO_INDEX[noteCenter];
    const noteIdx = NOTE_NAME_TO_INDEX[note];
    const chromaticDegrees = getChromaticDegrees(tritoneLabel);
    if (centerIdx !== undefined && noteIdx !== undefined) {
      const semitones = (noteIdx - centerIdx + 12) % 12;
      displayLabel = chromaticDegrees[semitones] || note;
    } else {
      displayLabel = note;
    }
  } else if (displayMode === 'interval' && noteCenter) {
    const centerIdx = NOTE_NAME_TO_INDEX[noteCenter];
    const noteIdx = NOTE_NAME_TO_INDEX[note];
    if (centerIdx !== undefined && noteIdx !== undefined) {
      const centerNote = new Note(centerIdx as PitchClass, 0, 4);
      const thisNote = new Note(noteIdx as PitchClass, 0, 4);
      const interval = getIntervalName(centerNote, thisNote);
      displayLabel = interval;
    }
  }

  // Compute border style for merged selection borders
  let borderStyle: React.CSSProperties = {};

  // One-sided border logic for grid lines
  borderStyle.borderRight = lastCol ? '1px solid #4b5563' : '1px solid #4b5563';
  borderStyle.borderBottom = lastRow ? '1px solid #4b5563' : '1px solid #4b5563';
  if (firstRow) borderStyle.borderTop = '1px solid #4b5563';
  if (firstCol) borderStyle.borderLeft = '1px solid #4b5563';

  // Selection logic (overrides grid lines)
  if (selected && selectedBorders) {
    borderStyle = {
      ...borderStyle,
      ...(selectedBorders.top ? { borderTop: '2.5px solid #fff' } : {}),
      ...(selectedBorders.bottom ? { borderBottom: '2.5px solid #fff' } : {}),
      ...(selectedBorders.left ? { borderLeft: '2.5px solid #fff' } : {}),
      ...(selectedBorders.right ? { borderRight: '2.5px solid #fff' } : {}),
      zIndex: 10,
    };
  }

  // Nut border should always be visible for 0th fret cells
  if (isNut) {
    borderStyle.borderRight = '6px solid #ffffff';
  }
  return (
    <div
      className={`relative flex items-center justify-center bg-gray-800${hasColors ? ' cursor-pointer hover:bg-gray-700' : ''}${selected ? ' z-10' : ''}`}
      style={{
        height: 'clamp(30px, 8vw, 40px)',
        minHeight: '30px',
        width: '100%',
        ...borderStyle,
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={hasColors && onSelect ? onSelect : undefined}
      onMouseOver={onDragOver ? onDragOver : undefined}
      onMouseUp={onDragEnd ? onDragEnd : undefined}
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
          {displayLabel}
        </div>
      )}
    </div>
  );
};

export default FretboardNote;
