/**
 * FretboardGrid.tsx
 *
 * Displays the guitar fretboard as a grid of notes, with support for highlighting, blending, and note interaction.
 * Used as the main visualization component in FretForge.
 */

import React, { useEffect, useRef } from 'react';
import { Note } from '../lib/Note';
import FretboardNote from './FretboardNote';
import FretMarkersRow from './FretMarkersRow';

/**
 * Props for FretboardGrid component.
 */
interface FretboardGridProps {
  /** 2D array of Note objects for each string and fret */
  board: Note[][];
  /** Map of note names to highlight colors */
  highlightedNotes: Record<string, string[]>;
  /** Whether to display notes as flats (♭) or sharps (♯) */
  preferFlat: boolean;
  /** Whether any scales are selected */
  hasScalesSelected?: boolean;
  /** Whether to blend colors for overlapping notes */
  blendOverlaps?: boolean;
  /** Whether to display fret markers */
  showFretMarkers?: boolean;
  /** Callback for when a note is hovered */
  onNoteHoverStart: (info: { string: number; fret: number; noteStr: string; x: number; y: number }) => void;
  /** Callback for when a note hover ends */
  onNoteHoverEnd: () => void;
  /** Callback for when a note is clicked (optional) */
  onNoteClick?: (note: string, stringIndex: number, fret: number) => void;
  /** The note center for interval display (note name string or null) */
  noteCenter?: string | null;
  /** Display mode: 'interval' or 'degree' */
  displayMode?: 'interval' | 'degree';
  /** User-configurable tritone label (e.g., '♭5', '♯4', '♯4/♭5') */
  tritoneLabel?: string;
  /** Set of selected note keys (e.g., 's{string}-f{fret}') */
  selectedNotes?: Set<string>;
  /** Handler to toggle note selection */
  onNoteSelect?: (key: string, event: React.MouseEvent) => void;
  /** Handler for drag-select over a note */
  onNoteDragOver?: (key: string, event: React.MouseEvent) => void;
  /** Handler for drag-select end (mouse up) */
  onNoteDragEnd?: () => void;
}

/**
 * Displays the guitar fretboard as a grid of notes.
 */
const FretboardGrid: React.FC<FretboardGridProps> = ({
  board,
  highlightedNotes,
  preferFlat,
  hasScalesSelected = false,
  blendOverlaps = false,
  showFretMarkers = true,
  onNoteHoverStart,
  onNoteHoverEnd,
  onNoteClick,
  noteCenter,
  displayMode,
  tritoneLabel,
  selectedNotes,
  onNoteSelect,
  onNoteDragOver,
  onNoteDragEnd,
}) => {
  const numFrets = board[0].length;
  const firstFretRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (firstFretRef.current) {
      // setNutLeft(firstFretRef.current.offsetLeft + firstFretRef.current.offsetWidth); // Removed unused variable
    }
    const handleResize = () => {
      if (firstFretRef.current) {
        // setNutLeft(firstFretRef.current.offsetLeft + firstFretRef.current.offsetWidth); // Removed unused variable
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [board]);

  return (
    <div style={{ position: 'relative' }}>
      {/* No nut divider element; use thick right border on 0th fret cells */}
      <div
        className="grid gap-0 bg-[#23272F] w-full"
        style={{
          gridTemplateColumns: `minmax(40px, 1fr) repeat(${numFrets}, minmax(48px, 1fr)) 32px`,
          fontSize: 'clamp(10px, 2vw, 14px)',
          // Removed borderBottom and borderRight to eliminate floating border
        }}
      >
        {/* Fret numbers */}
        <div></div>
        {Array.from({ length: numFrets }, (_, i) => (
          <div key={i} className="text-xs text-center text-gray-400 py-1">
            {i}
          </div>
        ))}
        <div /> {/* Dummy column for right margin */}

        {/* Strings */}
        {[...board].reverse().map((stringRow, stringIndex) => {
          const trueIndex = board.length - 1 - stringIndex;
          return (
            <React.Fragment key={trueIndex}>
              <div className="text-xs text-right pr-2 py-2 text-gray-400">{trueIndex + 1}</div>
              {stringRow.map((note, fret) => {
                if (!note) {
                  return (
                    <div
                      key={`s${trueIndex}-f${fret}`}
                      className={`bg-gray-800 border border-gray-600 ${fret === 0 ? 'border-r-8 border-r-white' : ''}`}
                      style={{
                        height: 'clamp(30px, 8vw, 40px)',
                        minHeight: '30px',
                        width: '100%'
                      }}
                    />
                  ); // Render empty grid cell for hidden notes
                }

                const label = note.toString(preferFlat).replace(/[0-9]/g, '');
                const colors = highlightedNotes[label] || [];
                const isLastRow = trueIndex === 0;
                const isFirstRow = trueIndex === board.length - 1;
                const isLastCol = fret === stringRow.length - 1;
                const isFirstCol = fret === 0;
                return (
                  // Compute which borders to show for selected notes
                  (() => {
                    const key = `s${trueIndex}-f${fret}`;
                    const isSelected = selectedNotes?.has(key) ?? false;
                    let selectedBorders = undefined;
                    if (isSelected) {
                      // Check neighbors
                      const top = !(selectedNotes?.has(`s${trueIndex + 1}-f${fret}`));
                      const bottom = !(selectedNotes?.has(`s${trueIndex - 1}-f${fret}`));
                      const left = !(selectedNotes?.has(`s${trueIndex}-f${fret - 1}`));
                      const right = !(selectedNotes?.has(`s${trueIndex}-f${fret + 1}`));
                      selectedBorders = { top, right, bottom, left };
                    }
                    return (
                      <FretboardNote
                        key={`s${trueIndex}-f${fret}`}
                        note={label}
                        colors={colors}
                        isNut={fret === 0}
                        hasScalesSelected={hasScalesSelected}
                        blendOverlaps={blendOverlaps}
                        onHoverStart={() => onNoteHoverStart({ string: trueIndex, fret, noteStr: label, x: 0, y: 0 })}
                        onHoverEnd={onNoteHoverEnd}
                        onClick={onNoteClick ? () => onNoteClick(label, trueIndex, fret) : undefined}
                        selected={isSelected}
                        onSelect={onNoteSelect ? (e: React.MouseEvent) => onNoteSelect(key, e) : undefined}
                        onDragOver={onNoteDragOver ? (e: React.MouseEvent) => onNoteDragOver(key, e) : undefined}
                        onDragEnd={onNoteDragEnd}
                        noteCenter={noteCenter}
                        displayMode={displayMode}
                        tritoneLabel={tritoneLabel}
                        selectedBorders={selectedBorders}
                        lastRow={isLastRow}
                        lastCol={isLastCol}
                        firstRow={isFirstRow}
                        firstCol={isFirstCol}
                      />
                    );
                  })()
                );
              })}
              <div /> {/* Dummy column for right margin */}
            </React.Fragment>
          );
        })}

        {showFretMarkers && <FretMarkersRow numFrets={numFrets - 1} />}
        <div /> {/* Dummy column for right margin under markers row */}
      </div>
    </div>
  );
};

export default FretboardGrid;
