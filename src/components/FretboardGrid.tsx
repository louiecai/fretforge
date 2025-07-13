import React from 'react';
import { Note } from '../lib/Note';
import FretboardNote from './FretboardNote';
import FretMarkersRow from './FretMarkersRow';

interface FretboardGridProps {
  board: Note[][];
  highlightedNotes: Record<string, string[]>; // Updated to include colors for overlapping scales
  preferFlat: boolean;
  hasScalesSelected?: boolean; // Indicates if any scales are selected
  blendOverlaps?: boolean;
  onNoteHoverStart: (info: { string: number; fret: number; noteStr: string; x: number; y: number }) => void;
  onNoteHoverEnd: () => void;
}

const FretboardGrid: React.FC<FretboardGridProps> = ({
  board,
  highlightedNotes,
  preferFlat,
  hasScalesSelected = false,
  blendOverlaps = false,
  onNoteHoverStart,
  onNoteHoverEnd,
}) => {
  const numFrets = board[0].length;

  return (
    <div
      className="grid gap-[1px] bg-[#23272F] w-full"
      style={{
        gridTemplateColumns: `minmax(30px, 1fr) repeat(${numFrets}, minmax(30px, 1fr)) 24px`, // Add dummy column
        fontSize: 'clamp(8px, 2vw, 12px)'
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
                    className={`bg-gray-800 border border-gray-600 ${fret === 0 ? 'border-r-[6px] border-r-gray-500' : ''}`}
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
              return (
                <FretboardNote
                  key={`s${trueIndex}-f${fret}`}
                  note={label}
                  colors={colors} // Pass multiple colors for overlapping scales
                  isNut={fret === 0} // Pass nut indicator
                  hasScalesSelected={hasScalesSelected}
                  blendOverlaps={blendOverlaps}
                  onHoverStart={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    onNoteHoverStart({
                      string: trueIndex + 1,
                      fret,
                      noteStr: note.toString(preferFlat),
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onHoverEnd={onNoteHoverEnd}
                />
              );
            })}
            <div /> {/* Dummy column for right margin */}
          </React.Fragment>
        );
      })}

      <FretMarkersRow numFrets={numFrets - 1} />
      <div /> {/* Dummy column for right margin under markers row */}
    </div>
  );
};

export default FretboardGrid;
